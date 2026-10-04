"""Run the three fixed comparisons and generate evidence and result tables."""
from collections import Counter
from copy import deepcopy
import hashlib
import json
from pathlib import Path

from .core import (ROOT, candidate_items, dependencies, digest, incremental,
                   load_records, prepare, rank, read_json, scoped_rules, write_json)
from .counting import LocalCounter, write_input


def evaluate_retrieval(items, gold):
    selected = {item["id"]: item for item in items}
    relevant = [row for row in gold["records"] if row["relevant"]]
    evidence_total = sum(len(row["evidence"]) for row in relevant)
    preserved = 0
    for row in relevant:
        if row["id"] in selected:
            # JSON escapes paragraph breaks; compare parsed field values instead.
            description = selected[row["id"]].get("fields", selected[row["id"]]).get("abstract", "")
            preserved += sum(evidence in description for evidence in row["evidence"])
    hits = sorted(set(selected) & {row["id"] for row in relevant})
    return {"relevant_total": len(relevant), "relevant_retained": len(hits), "recall": len(hits) / len(relevant),
            "evidence_total": evidence_total, "evidence_preserved": preserved,
            "selected_ids": list(selected), "hit_ids": hits,
            "missed_ids": sorted(row["id"] for row in relevant if row["id"] not in selected),
            "nonrelevant_or_insufficient_selected": sorted(set(selected) - set(hits))}


def run_demo(out):
    out = Path(out)
    lock = read_json(ROOT / "data/fixture-lock.json")
    for relative, expected in lock["files"].items():
        assert hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() == expected, f"Fixture changed: {relative}"
    records = load_records(ROOT / "data/raw/catalog-v1.jsonl")
    updated = load_records(ROOT / "data/raw/catalog-v2.jsonl")
    cfg, rules, vocabulary, context = dependencies(ROOT / "configs/subject-review.json")
    task = (ROOT / cfg["template"]).read_text(encoding="utf-8")
    counter = LocalCounter()
    rows = []

    def measure(name, baseline, after, input_n, retained_n, evidence, limitation):
        b, a = counter.count(baseline), counter.count(after)
        row = {"case": name, "input_records": input_n, "retained_or_pending_records": retained_n,
               "baseline_tokens": b, "prepared_tokens": a, "reduction": 1 - a / b,
               "evidence": evidence, "boundary": limitation,
               "baseline_file": str(baseline.relative_to(out)), "prepared_file": str(after.relative_to(out))}
        rows.append(row)
        return row

    groups = prepare(records, cfg, rules, vocabulary)
    baseline = write_input(out / "case1/baseline.txt", task, records)
    after = write_input(out / "case1/prepared.txt", task, groups)
    mapped = {member["id"]: (group, member) for group in groups for member in group["members"]}
    assert set(mapped) == {r["id"] for r in records}
    retained_fields = cfg["fields"] + ["id", "source_locator"]
    for r in records:
        group, member = mapped[r["id"]]
        assert all(group["fields"][key] == r.get(key) for key in cfg["fields"])
        assert member == {"id": r["id"], "source_locator": r["source_locator"]}
    boundaries = read_json(ROOT / "data/subject-boundaries.json")
    assert mapped[boundaries["mismatch_id"]][0]["rule_issues"] == []
    assert mapped[boundaries["missing_abstract_id"]][0]["preparation_status"] == "insufficient_material"
    for a, b in [boundaries["separate_edition"], boundaries["separate_copy"]]:
        assert mapped[a][0]["item_id"] != mapped[b][0]["item_id"]
    for a, b in boundaries["exact_groups"]:
        assert mapped[a][0]["item_id"] == mapped[b][0]["item_id"]
    retention = {"input_rows": len(records), "retained_ids": len(mapped), "unique_preparation_items": len(groups),
                 "exact_duplicate_computations_avoided": len(records) - len(groups),
                 "input_field_count": len(records[0]), "retained_original_field_count": len(retained_fields),
                 "retained_original_fields": retained_fields, "removed_fields": sorted(set(records[0]) - set(retained_fields)),
                 "field_value_equality_checked_for_all_rows": True,
                 "mapping": {rid: {"item_id": group["item_id"], "source_locator": member["source_locator"], "status": group["preparation_status"], "rule_issues": group["rule_issues"]} for rid, (group, member) in mapped.items()},
                 "boundary_checks": boundaries}
    write_json(out / "case1/retention.json", retention)
    write_json(out / "case1/rule-results.json", {rid: group["rule_issues"] for rid, (group, _) in mapped.items()})
    scope = read_json(ROOT / "configs/reports-2000-2025.json")
    write_json(out / "rules/scoped-inventory.json", {"scope": scope, "records": scoped_rules(records, scope, rules, vocabulary)})
    measure("1 · Subject review", baseline, after, len(records), len(mapped),
            f"{len(mapped)}/{len(records)} IDs; {len(groups)} items; all {len(retained_fields)} configured original fields unchanged",
            "R007 passes format rules but still needs semantic review; R008 has insufficient material.")

    retrieval = read_json(ROOT / "configs/research-candidates.json")
    research_task = (ROOT / retrieval["template"]).read_text(encoding="utf-8")
    gold = read_json(ROOT / "data/retrieval-gold.json")
    # Ranking takes only records and config. It never sees relevance labels.
    scores = rank(records, retrieval)
    write_json(out / "case2/ranking.json", {"config": retrieval, "ranking": scores})
    baseline = write_input(out / "case2/baseline.txt", research_task, records)
    for label, k in [("top5", retrieval["top_k"]), ("top15", retrieval["expanded_k"])]:
        items = candidate_items(records, retrieval, scores, k)
        path = write_input(out / f"case2/{label}.txt", research_task, items,
                           {"query": retrieval["query"], "method": "TF-IDF cosine", "requested_k": k,
                            "corpus_records": len(records), "coverage": "Candidates only. Widen k or inspect case2/baseline.txt and original source locators."})
        evaluation = evaluate_retrieval(items, gold)
        write_json(out / f"case2/{label}-evaluation.json", evaluation)
        measure(f"2 · Candidates {label}", baseline, path, len(records), len(items),
                f"Recall {evaluation['relevant_retained']}/{evaluation['relevant_total']}; evidence {evaluation['evidence_preserved']}/{evaluation['evidence_total']}",
                "Missed: " + ", ".join(evaluation["missed_ids"]) + "; lexical decoys may remain.")
    evaluation = evaluate_retrieval(records, gold)
    write_json(out / "case2/full-evaluation.json", evaluation)
    measure("2 · Full source fallback", baseline, baseline, len(records), len(records),
            f"Recall {evaluation['relevant_retained']}/{evaluation['relevant_total']}; evidence {evaluation['evidence_preserved']}/{evaluation['evidence_total']}",
            "Complete fixture supplied; relevance judgment still required. Not exhaustive outside this fixture.")

    pending1, cache1, status1 = incremental(records, cfg, rules, vocabulary, context)
    pending2, cache2, status2 = incremental(updated, cfg, rules, vocabulary, context, cache1)
    phases = [("first", records, pending1, cache1, status1)]
    phases.append(("second", updated, pending2, cache2, status2))
    # Change each dependency independently, holding the updated export fixed.
    for label, kind in [("task-change", "task"), ("vocabulary-change", "vocabulary"), ("rules-change", "rules")]:
        changed_cfg, changed_rules, changed_vocab = deepcopy(cfg), deepcopy(rules), deepcopy(vocabulary)
        if kind == "task":
            changed_cfg["task_id"] = "subject-review-v2-with-export-note"
            changed_cfg["fields"].append("export_note")
            changed_cfg["required_for_review"].append("export_note")
        elif kind == "vocabulary":
            changed_vocab["version"] = "vocabulary-v2"
            changed_vocab["terms"].remove("Astronomy")
        else:
            changed_rules["version"] = "rules-v2"
            changed_rules["allowed_types"].append("photocopy")
        changed_context = digest({"base_context": context, "config": changed_cfg, "rules": changed_rules, "vocabulary": changed_vocab})
        pend, cache, status = incremental(updated, changed_cfg, changed_rules, changed_vocab, changed_context, cache2)
        phases.append((label, updated, pend, cache, status))
        write_json(out / f"case3/{label}/dependency-change.json", {"config": changed_cfg, "rules": changed_rules, "vocabulary": changed_vocab, "context": changed_context})
    summaries = {}
    for label, current, pend, cache, statuses in phases:
        active = [r for r in current if r["status"] == "active"]
        # Baseline preparation is separate measurement work, not reused AI work.
        if label in {"task-change", "vocabulary-change", "rules-change"}:
            delta = read_json(out / f"case3/{label}/dependency-change.json")
            full = prepare(active, delta["config"], delta["rules"], delta["vocabulary"])
        else:
            full = prepare(active, cfg, rules, vocabulary)
        base_path = write_input(out / f"case3/{label}/baseline.txt", task, full)
        pending_path = write_input(out / f"case3/{label}/pending.txt", task, pend)
        write_json(out / f"case3/{label}/cache.json", cache)
        write_json(out / f"case3/{label}/status.json", statuses)
        counts = dict(Counter(s["state"] for s in statuses))
        pending_n = sum(len(group["members"]) for group in pend)
        summaries[label] = {"export_rows": len(current), "active_rows": len(active), "full_items": len(full), "pending_rows": pending_n,
                            "pending_items": len(pend), "states": counts, "cache_kind": cache["kind"]}
        measure(f"3 · {label}", base_path, pending_path, len(active), pending_n,
                f"{pending_n} pending; {counts.get('reused_preparation', 0)} reused; all active IDs accounted for",
                "Prepared material cache only; no completed AI review cached.")
    write_json(out / "case3/summary.json", summaries)
    assert summaries["second"]["states"] == {"reused_preparation": 56, "modified_or_cache_invalid": 2, "new": 2, "deleted": 1, "inactive": 1}
    for phase in ["task-change", "vocabulary-change", "rules-change"]:
        assert summaries[phase]["states"] == {"dependency_changed": 60, "inactive": 1}
    write_json(out / "metrics.json", {"tokenizer": counter.metadata, "comparisons": rows,
                                     "model_calls_in_preprocessing": 0, "codex_development_usage": "not measured", "independent_model_evaluation": "not run", "hokieai_allocation": "not measured"})
    header = "| Case / task | Input → retained or pending records | Baseline text tokens | Prepared text tokens | Input reduction | Evidence / recall | Boundary |\n| --- | ---: | ---: | ---: | ---: | --- | --- |\n"
    body = "".join(f"| {r['case']} | {r['input_records']} → {r['retained_or_pending_records']} | {r['baseline_tokens']:,} | {r['prepared_tokens']:,} | {r['reduction']:.2%} | {r['evidence']} | {r['boundary']} |\n" for r in rows)
    (out / "summary.md").write_text(header + body, encoding="utf-8")
    if out.resolve() == ROOT / "results":
        compact = "| Comparison | Records: input → retained/pending | Text tokens: baseline → prepared | Input reduction | Evidence |\n| --- | ---: | ---: | ---: | --- |\n"
        for row in rows[:4] + [rows[5]]:
            compact += f"| {row['case']} | {row['input_records']} → {row['retained_or_pending_records']} | {row['baseline_tokens']:,} → {row['prepared_tokens']:,} | {row['reduction']:.2%} | {row['evidence']} |\n"
        for relative, table in [("README.md", compact), ("docs/experiment-report.md", header + body)]:
            doc = ROOT / relative
            if doc.exists():
                text = doc.read_text(encoding="utf-8")
                start, end = "<!-- RESULTS:START -->", "<!-- RESULTS:END -->"
                if start in text and end in text:
                    before, remainder = text.split(start, 1)
                    _, after = remainder.split(end, 1)
                    doc.write_text(before + start + "\n\n" + table + "\n" + end + after, encoding="utf-8")
    # Hash every generated result, excluding execution-wrapper files written later.
    output_hashes = {str(p.relative_to(out)): hashlib.sha256(p.read_bytes()).hexdigest()
                     for p in sorted(out.rglob("*")) if p.is_file() and "execution" not in p.parts and p.name != "artifact-manifest.json"}
    write_json(out / "artifact-manifest.json", {"files": output_hashes, "fixture_lock": lock, "tokenizer": counter.metadata})
    print(header + body, end="")
    return rows
