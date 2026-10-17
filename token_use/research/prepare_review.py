"""Validate imported model responses and prepare blinded human review; no model calls."""
import argparse
from collections import Counter
import csv
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def load_jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def structural_check(response, source_id):
    try:
        value = json.loads(response)
    except (ValueError, TypeError):
        return False
    return (isinstance(value, dict) and value.get("record_id") == source_id
            and isinstance(value.get("description"), str)
            and 0 < len(value["description"].split()) <= 80
            and isinstance(value.get("evidence_fields"), list)
            and all(isinstance(x, str) for x in value["evidence_fields"])
            and isinstance(value.get("limitations"), list)
            and all(isinstance(x, str) for x in value["limitations"]))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--responses", type=Path, required=True)
    parser.add_argument("--requests", type=Path, default=ROOT / "outputs/requests.jsonl")
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    if args.out.exists():
        parser.error("Review output exists; choose a new directory to preserve earlier ratings")
    requests = {row["request_id"]: row for row in load_jsonl(args.requests)}
    quality_pilot = json.loads((ROOT / "results/quality-pilot.json").read_text())
    pilot_keys = {row["record_key"] for row in quality_pilot["records"]}
    planned = {request_id for request_id, row in requests.items()
               if row["record_key"] in pilot_keys and row["condition"] in quality_pilot["conditions"]}
    if len(planned) != len(pilot_keys) * len(quality_pilot["conditions"]):
        raise ValueError("Generated requests do not contain the complete frozen quality pilot")
    task = (ROOT / "task.txt").read_text()
    responses = load_jsonl(args.responses)
    if not responses:
        parser.error("No responses supplied; model evaluation remains pending")
    source_rows = json.loads((ROOT / "data/loc-sample.json").read_text())
    source_ids = {row["Id"] for row in source_rows}
    seen = set()
    audit, review, key, settings, models = [], [], [], set(), set()
    for item in responses:
        required = {"request_id", "prompt_sha256", "model", "settings", "status", "response", "attempts", "usage", "latency_seconds"}
        if not required.issubset(item):
            raise ValueError(f"Missing response keys: {sorted(required - set(item))}")
        request_id = item["request_id"]
        if request_id in seen or request_id not in requests:
            raise ValueError(f"Duplicate or unknown request_id: {request_id}")
        seen.add(request_id)
        request = requests[request_id]
        if hashlib.sha256(request["prompt"].encode()).hexdigest() != request["prompt_sha256"]:
            raise ValueError(f"Generated prompt has changed: {request_id}")
        if not request["prompt"].startswith(task):
            raise ValueError("Request does not use the frozen task")
        supplied_fields = set(json.loads(request["prompt"][len(task):]))
        if item.get("prompt_sha256") != request["prompt_sha256"]:
            raise ValueError(f"Prompt hash does not match frozen request: {request_id}")
        if not isinstance(item.get("model"), str) or not item["model"].strip() or not isinstance(item.get("settings"), dict):
            raise ValueError("Record model identifier and full inference settings for every response")
        models.add(item["model"])
        settings.add(json.dumps(item["settings"], sort_keys=True))
        if item.get("status") not in {"success", "error"}:
            raise ValueError("status must be success or error; pending placeholders are not observations")
        if request["source_id"] not in source_ids:
            raise ValueError("Request source is not in the frozen corpus")
        raw_response = item.get("response", "")
        if not isinstance(raw_response, str):
            raise ValueError("response must preserve the raw model response as a string")
        if item["status"] == "success" and not raw_response.strip():
            raise ValueError("An empty response must be recorded as an error")
        usage = item.get("usage")
        if usage is not None:
            if not isinstance(usage, dict):
                raise ValueError("usage must be a provider-usage object or null")
            for field in ("input_tokens", "output_tokens"):
                if type(usage.get(field)) is not int or usage[field] < 0:
                    raise ValueError("Provider token usage must contain nonnegative integer counts or be null")
        latency = item["latency_seconds"]
        if latency is not None and (type(latency) not in (int, float) or not math.isfinite(latency) or latency < 0):
            raise ValueError("latency_seconds must be a finite nonnegative number or null")
        attempts = item.get("attempts")
        if type(attempts) is not int or attempts < 1:
            raise ValueError("Record the number of attempted calls, including failed attempts")
        blind_id = hashlib.sha256(("review-order-v1:" + request_id).encode()).hexdigest()[:16]
        structure_ok = item["status"] == "success" and structural_check(raw_response, request["source_id"])
        unavailable_fields = (sorted(set(json.loads(raw_response)["evidence_fields"]) - supplied_fields)
                              if structure_ok else None)
        audit.append({
            "request_id": request_id, "condition": request["condition"],
            "record_key": request["record_key"], "status": item["status"],
            "structural_valid": structure_ok,
            "claimed_evidence_fields_not_supplied": unavailable_fields,
            "usage": usage, "attempts": attempts,
            "latency_seconds": item.get("latency_seconds"),
        })
        review.append({"blind_id": blind_id, "record_key": request["record_key"],
                       "source_url": request["source_id"], "response": raw_response,
                       "unsupported_claims": "", "lost_qualifiers": "", "acceptable": "",
                       "salient_facts_available": "", "salient_facts_covered": "",
                       "informativeness_notes": "",
                       "editing_seconds": "", "notes": ""})
        key.append({"blind_id": blind_id, "request_id": request_id,
                    "condition": request["condition"], "record_key": request["record_key"]})
    if len(models) != 1 or len(settings) != 1:
        raise ValueError("Use the same model and inference settings for the paired comparison")
    args.out.mkdir(parents=True)
    review.sort(key=lambda row: row["blind_id"])
    with (args.out / "blinded-review.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(review[0]))
        writer.writeheader()
        writer.writerows(review)
    (args.out / "condition-key.json").write_text(json.dumps(key, indent=2) + "\n")
    (args.out / "response-audit.json").write_text(json.dumps({
        "model": next(iter(models)), "settings": json.loads(next(iter(settings))),
        "imported_responses": len(responses), "generated_requests": len(requests),
        "planned_quality_requests": len(planned),
        "observed_quality_requests": len(seen & planned),
        "missing_quality_requests": sorted(planned - seen),
        "nonpilot_imports": sorted(seen - planned),
        "quality_pilot_all_conditions_attempted": planned.issubset(seen),
        "quality_records_with_all_conditions_attempted": sum(
            all(f"{record_key}--{condition}" in seen for condition in quality_pilot["conditions"])
            for record_key in pilot_keys),
        "status_counts": dict(Counter(row["status"] for row in audit)),
        "semantic_quality": "pending independent human review",
        "usage_scope": "Supplied provider usage only. Missing usage is unknown, never zero. Include all attempts; preserve per-attempt provider logs separately.",
        "results": audit,
    }, indent=2) + "\n")
    print(f"Prepared {len(review)} blinded rows. No semantic quality scores were generated.")


if __name__ == "__main__":
    main()
