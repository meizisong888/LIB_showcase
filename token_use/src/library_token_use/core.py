"""Pure local field selection, rules, exact grouping, TF-IDF and preparation cache."""
from collections import Counter
from datetime import date
import hashlib
import json
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
TRACE_FIELDS = {"id", "source_locator"}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def digest(value):
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def load_records(path):
    records = [json.loads(line) for line in Path(path).read_text(encoding="utf-8").splitlines() if line.strip()]
    ids = [r.get("id") for r in records]
    if any(not isinstance(i, str) or not i for i in ids) or len(set(ids)) != len(ids):
        raise ValueError("Every export row needs a nonempty unique ID; resolve identity before preparation.")
    return records


def dependencies(config_path):
    config = read_json(config_path)
    rules = read_json(ROOT / config["rules_file"])
    vocabulary = read_json(ROOT / config["vocabulary_file"])
    if set(config["required_for_review"]) - set(config["fields"]) - TRACE_FIELDS:
        raise ValueError("A required review field would be removed by this configuration.")
    # Hash contents, not only declared version labels. Code changes invalidate cache too.
    code = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(Path(__file__).parent.glob("*.py"))}
    context = digest({"config": config, "rules": rules, "vocabulary": vocabulary,
                      "template": (ROOT / config["template"]).read_text(encoding="utf-8"), "code": code})
    return config, rules, vocabulary, context


def check_rules(record, rules, vocabulary):
    issues = []
    for field in rules["required"]:
        if record.get(field) in (None, "", []):
            issues.append(f"missing:{field}")
    try:
        value = record.get("date", "")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise ValueError("date shape")
        date.fromisoformat(value)
    except (ValueError, TypeError):
        issues.append("invalid:date")
    for field, allowed in [("language", rules["allowed_languages"]), ("material_type", rules["allowed_types"])]:
        if record.get(field) not in allowed:
            issues.append(f"not_allowed:{field}")
    subjects = record.get("subjects")
    if not isinstance(subjects, list) or any(not isinstance(s, str) for s in subjects):
        issues.append("invalid:subjects_shape")
    elif any(s not in vocabulary["terms"] for s in subjects):
        issues.append("not_in_local_vocabulary:subjects")
    return issues


def prepare_content(record, config, rules, vocabulary):
    missing = [key for key in config["required_for_review"] if record.get(key) in (None, "", [])]
    return {"fields": {key: record.get(key) for key in config["fields"]},
            "preparation_status": "insufficient_material" if missing else "ready_for_review",
            "missing_fields": missing, "rule_issues": check_rules(record, rules, vocabulary)}


def group_prepared(records, prepared):
    groups = {}
    for r in records:
        content = prepared[r["id"]]
        # Canonical exact text is the grouping key: no fuzzy/entity merging.
        key = canonical(content)
        if key not in groups:
            groups[key] = {"item_id": "item-" + digest(content), **content, "members": []}
        groups[key]["members"].append({"id": r["id"], "source_locator": r.get("source_locator")})
    return list(groups.values())


def prepare(records, config, rules, vocabulary):
    prepared = {r["id"]: prepare_content(r, config, rules, vocabulary) for r in records}
    return group_prepared(records, prepared)


def scoped_rules(records, scope, rules, vocabulary):
    """An inventory-specific date/type filter, never used to bypass subject review."""
    ledger = []
    for r in records:
        issues = check_rules(r, rules, vocabulary)
        if "invalid:date" in issues or "not_allowed:material_type" in issues:
            status = "exception_needs_review"
        else:
            year = date.fromisoformat(r["date"]).year
            status = "included" if scope["year_min"] <= year <= scope["year_max"] and r["material_type"] in scope["material_types"] else "outside_explicit_scope"
        ledger.append({"id": r["id"], "source_locator": r.get("source_locator"), "date": r.get("date"),
                       "material_type": r.get("material_type"), "status": status, "rule_issues": issues})
    return ledger


def rank(records, config):
    """Smoothed IDF, logarithmic TF, L2 cosine. No stemming or query expansion."""
    if config.get("year_filter") is not None or config.get("type_filter") is not None:
        raise ValueError("This research task has no date/type filter; use the explicit inventory task for that scope.")
    stops = set(config["stopwords"])

    def words(text):
        return [w for w in re.findall(config["token_pattern"], text.lower()) if w not in stops]

    counts = []
    for r in records:
        texts = [" ".join(r[key]) if isinstance(r.get(key), list) else str(r.get(key) or "") for key in config["search_fields"]]
        counts.append(Counter(words(" ".join(texts))))
    df = Counter(term for count in counts for term in count)
    idf = {term: math.log((1 + len(records)) / (1 + frequency)) + 1 for term, frequency in df.items()}

    def vector(count):
        weighted = {term: (1 + math.log(n)) * idf[term] for term, n in count.items() if term in idf}
        length = math.sqrt(sum(w * w for w in weighted.values()))
        return {term: w / length for term, w in weighted.items()} if length else {}

    query = vector(Counter(words(config["query"])))
    scores = []
    for r, count in zip(records, counts):
        vec = vector(count)
        score = sum(weight * vec.get(term, 0.0) for term, weight in query.items())
        scores.append({"id": r["id"], "source_locator": r.get("source_locator"),
                       "score": score, "matching_terms": sorted(set(query) & set(count))})
    return sorted(scores, key=lambda entry: (-entry["score"], entry["id"]))


def candidate_items(records, config, scores, k):
    lookup = {r["id"]: r for r in records}
    # k is literal: zero-score rows may appear, clearly labeled, in a wider set.
    return [{"id": entry["id"], "source_locator": entry["source_locator"],
             "retrieval_score": round(entry["score"], 8), "matching_terms": entry["matching_terms"],
             "fields": {key: lookup[entry["id"]].get(key) for key in config["fields"]}}
            for entry in scores[:k]]


def incremental(records, config, rules, vocabulary, context, previous=None):
    """Reuse prepared content, never an AI answer. Refresh current source pointers."""
    previous = previous or {"entries": {}, "context": None}
    invalid = [r["id"] for r in records if r.get("status") not in {config["active_status"], "inactive"}]
    if invalid:
        raise ValueError(f"Unknown or missing status; refusing to silently omit IDs: {invalid}")
    active = [r for r in records if r.get("status") == config["active_status"]]
    entries, statuses, prepared = {}, [], {}
    old = previous["entries"]
    for r in active:
        # Export line numbers move after deletion. They are current mappings, not
        # semantic content; all other exported fields conservatively affect reuse.
        fingerprint = digest({"record": {k: v for k, v in r.items() if k != "source_locator"}, "context": context})
        cached = old.get(r["id"])
        if cached and cached["fingerprint"] == fingerprint and digest(cached["prepared"]) == cached.get("prepared_sha256"):
            state, content = "reused_preparation", cached["prepared"]
        else:
            state = "new" if not cached else ("dependency_changed" if previous["context"] != context else "modified_or_cache_invalid")
            content = prepare_content(r, config, rules, vocabulary)
        prepared[r["id"]] = content
        entries[r["id"]] = {"fingerprint": fingerprint, "prepared": content, "prepared_sha256": digest(content)}
        statuses.append({"id": r["id"], "state": state, "source_locator": r.get("source_locator")})
    current_ids = {r["id"] for r in records}
    active_ids = {r["id"] for r in active}
    for rid in sorted((set(old) - active_ids) | (current_ids - active_ids)):
        statuses.append({"id": rid, "state": "inactive" if rid in current_ids else "deleted"})
    pending_ids = {s["id"] for s in statuses if s["state"] in {"new", "dependency_changed", "modified_or_cache_invalid"}}
    pending = group_prepared([r for r in active if r["id"] in pending_ids], prepared)
    return pending, {"context": context, "entries": entries, "kind": "prepared_material_only"}, statuses
