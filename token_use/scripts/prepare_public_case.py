"""Prepare the frozen public catalog sample locally; no acquisition or model calls."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from library_token_use.core import canonical, digest, load_records, read_json, write_json
from library_token_use.counting import LocalCounter, write_input


def prepare_records(records, config, sources):
    """Keep configured values verbatim, flag absences, and map exact groups."""
    if set(config["required_for_review"]) - set(config["fields"]):
        raise ValueError("A required task field cannot be deleted by projection.")
    groups, ledger = {}, []
    for record in records:
        rid = record[config["id_field"]]
        fields = {key: record.get(key) for key in config["fields"]}
        missing = [key for key in config["required_for_review"] if fields.get(key) in (None, "", [])]
        absent_optional = [key for key in config["optional_context"] if fields.get(key) in (None, "", [])]
        content = {"fields": fields, "preparation_status": "insufficient_material" if missing else "ready_for_review",
                   "missing_fields": missing, "optional_context_not_supplied": absent_optional}
        key = canonical(content)
        if key not in groups:
            groups[key] = {"item_id": "item-" + digest(content), **content, "members": []}
        member = {"id": rid, "source_url": record[config["source_field"]], "source_locator": sources[rid]["source_locator"]}
        groups[key]["members"].append(member)
        removed = sorted(set(record) - set(config["fields"]) - {config["id_field"], config["source_field"]})
        ledger.append({"id": rid, "item_id": groups[key]["item_id"], "source": member,
                       "retained_fields": list(config["fields"]), "removed_fields": removed,
                       "missing_fields": missing, "optional_context_not_supplied": absent_optional,
                       "status": content["preparation_status"], "field_values_equal_to_source": all(fields[k] == record.get(k) for k in config["fields"])})
    return list(groups.values()), ledger


def run(out, config_path):
    config = read_json(config_path)
    raw_path = ROOT / config["input"]
    manifest = read_json(ROOT / config["manifest"])
    if hashlib.sha256(raw_path.read_bytes()).hexdigest() != manifest["records_sha256"]:
        raise ValueError("Frozen public sample changed; refusing to report its old provenance.")
    for name, sha in manifest["frozen_design_sha256"].items():
        if hashlib.sha256((ROOT / name).read_bytes()).hexdigest() != sha:
            raise ValueError(f"Pre-measurement specification changed: {name}")
    records = load_records(raw_path)
    sources = {r["id"]: r for r in manifest["records"]}
    if set(sources) != {r["id"] for r in records}:
        raise ValueError("Manifest and record IDs disagree")
    task = (ROOT / config["template"]).read_text(encoding="utf-8")
    prepared, ledger = prepare_records(records, config, sources)
    full = [{"fields": r, "members": [{"id": r["id"], "source_url": r["link"], "source_locator": sources[r["id"]]["source_locator"]}]} for r in records]
    baseline = write_input(out / "baseline.txt", task, full)
    after = write_input(out / "prepared.txt", task, prepared)
    counter = LocalCounter()
    b, a = counter.count(baseline), counter.count(after)
    by_id = {m["id"]: (item, m) for item in prepared for m in item["members"]}
    for record in records:
        item, member = by_id[record["id"]]
        assert item["fields"] == {k: record.get(k) for k in config["fields"]}
        assert member["source_url"] == record["link"]
        filename, line = member["source_locator"].rsplit("#L", 1)
        assert json.loads((ROOT / filename).read_text(encoding="utf-8").splitlines()[int(line) - 1]) == record
    field_checks = {key: {"equal_values_in_all_rows": True,
                          "nonempty_source_records": sum(r.get(key) not in (None, "", []) for r in records),
                          "missing_source_records": [r["id"] for r in records if r.get(key) in (None, "", [])]}
                    for key in config["fields"]}
    missing_counts = dict(Counter(key for row in ledger for key in row["missing_fields"]))
    metrics = {"data_kind": "real public Library of Congress metadata; not synthetic", "records": len(records),
               "retained_ids": len(by_id), "prepared_items": len(prepared), "exact_duplicate_items_avoided": len(records) - len(prepared),
               "baseline_tokens": b, "prepared_tokens": a, "reduction": 1 - a / b,
               "configured_content_fields": len(config["fields"]), "all_configured_values_equal": all(row["field_values_equal_to_source"] for row in ledger),
               "insufficient_material_records": sum(row["status"] == "insufficient_material" for row in ledger),
               "missing_required_fields": missing_counts, "tokenizer": counter.metadata,
               "task_template": config["template"], "config": str(config_path.relative_to(ROOT)),
               "source_records_sha256": manifest["records_sha256"],
               "model_answer_quality": "not measured", "hokieai_allocation": "not measured", "codex_development_usage": "not measured"}
    write_json(out / "metrics.json", metrics)
    write_json(out / "retention.json", {"records": ledger, "field_checks": field_checks,
                                         "checks": "Equality for every configured field, all ID/source mappings, original dates/notes/rights preserved. No semantic or image review performed."})
    write_json(out / "id-map.json", {rid: {"item_id": group["item_id"], **member} for rid, (group, member) in by_id.items()})
    write_json(out / "missing-information.json", [r for r in ledger if r["missing_fields"]])
    first = records[0]
    write_json(out / "example-before.json", first)
    write_json(out / "example-after.json", by_id[first["id"]][0])
    table = ("| Data / task | Records → items | Baseline tokens | Prepared tokens | Input reduction | Retention and limit |\n"
             "| --- | ---: | ---: | ---: | ---: | --- |\n"
             f"| Real LOC metadata · subject-review preparation | {len(records)} → {len(prepared)} | {b:,} | {a:,} | {1 - a / b:.2%} | All {len(by_id)} IDs and {len(config['fields'])} configured field values per row preserved; {metrics['insufficient_material_records']} records need more evidence |\n")
    (out / "summary.md").write_text(table, encoding="utf-8")
    write_json(out / "artifact-manifest.json", {"files": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.iterdir()) if p.is_file() and p.name != "artifact-manifest.json"}})
    print(table, end="")
    print(f"Missing required fields: {missing_counts}. Prepared material only; no model judgment or quota measurement.")
    return metrics


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="outputs/public-review")
    parser.add_argument("--config", default="configs/public-subject-review.json")
    args = parser.parse_args()
    out = Path(args.out).resolve()
    if not any(out.is_relative_to(ROOT / name) for name in ["outputs", "results", "scratch"]):
        raise ValueError("Output must stay in this project's outputs/, results/ or scratch/.")
    out.mkdir(parents=True, exist_ok=True)
    run(out, Path(args.config).resolve())


if __name__ == "__main__":
    main()
