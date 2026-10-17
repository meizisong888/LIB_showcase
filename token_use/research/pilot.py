#!/usr/bin/env python3
"""Frozen real-metadata input ablation. No model or embedding calls.

Run ``python pilot.py --setup`` once with network access to acquire tokenizer
tables. Ordinary runs build both encodings directly from those local tables,
check all frozen design hashes, and block Python socket entry points. This
guard is deliberately not described as kernel/network-namespace isolation.
"""

from __future__ import annotations

import argparse
import base64
import collections
import contextlib
import csv
import datetime as dt
import hashlib
import importlib.metadata
import io
import json
import os
from pathlib import Path
import platform
import socket
import statistics
import sys
import time


ROOT = Path(__file__).resolve().parent
CONDITIONS = ("full_pretty", "full_compact", "task_fields", "title_subjects")


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def has_content(value: object) -> bool:
    """Null-only nested arrays/objects are empty; zero and False are values."""
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, dict):
        return any(has_content(v) for v in value.values())
    if isinstance(value, (list, tuple)):
        return any(has_content(v) for v in value)
    return True


def project(record: dict, fields: list[str]) -> dict:
    # Absent fields stay absent: never add or manufacture source values.
    return {key: record[key] for key in fields if key in record}


def variants(record: dict, config: dict) -> dict[str, dict]:
    return {
        "full_pretty": record,
        "full_compact": record,
        "task_fields": project(record, config["retained_fields"]),
        "title_subjects": project(record, config["stress_fields"]),
    }


def render_payload(value: dict, condition: str) -> str:
    if condition == "full_pretty":
        return json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2)
    return canonical(value)


@contextlib.contextmanager
def deny_python_network():
    """Prevent Python socket networking; does not instrument OS syscalls."""
    def blocked(*args, **kwargs):
        raise RuntimeError("Network use is forbidden during the offline pilot. Run --setup separately if tokenizer files are absent.")

    names = ("socket", "create_connection", "getaddrinfo", "gethostbyname", "gethostbyname_ex")
    previous = {name: getattr(socket, name) for name in names}
    try:
        for name in names:
            setattr(socket, name, blocked)
        yield
    finally:
        for name, function in previous.items():
            setattr(socket, name, function)


def load_design() -> tuple[dict, str, list[dict], dict]:
    lock = json.loads((ROOT / "design-lock.json").read_text(encoding="utf-8"))
    for name, expected in lock["files"].items():
        actual = digest((ROOT / name).read_bytes())
        if actual != expected:
            raise ValueError(f"Frozen design mismatch: {name}. Preserve this pilot; create an explicitly versioned new design for changes.")
    config = json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
    if config["conditions"] != list(CONDITIONS) or config["primary_baseline"] != "full_compact":
        raise ValueError("This pilot implements the four frozen arms with full_compact as primary baseline.")
    if not set(config["stress_fields"]).issubset(config["retained_fields"]):
        raise ValueError("Stress fields must be a subset of configured task fields.")
    task = (ROOT / config["prompt_file"]).read_text(encoding="utf-8")
    raw = (ROOT / config["input"]).read_bytes()
    source_manifest = json.loads((ROOT / "data/manifest.json").read_text(encoding="utf-8"))
    if digest(raw) != source_manifest["sha256"]:
        raise ValueError("Source bytes do not match data/manifest.json.")
    records = json.loads(raw)
    if not isinstance(records, list) or not all(isinstance(r, dict) for r in records):
        raise ValueError("Expected a JSON list of metadata objects.")
    if len(records) != source_manifest["record_count"] or not records:
        raise ValueError("Source record count differs from the frozen manifest.")
    return config, task, records, source_manifest


def setup_tokenizers(config: dict) -> None:
    """Online acquisition only; export the exact tables used by default runs."""
    import tiktoken

    cache = ROOT / ".cache"
    cache.mkdir(parents=True, exist_ok=True)
    os.environ["TIKTOKEN_CACHE_DIR"] = str(cache / "downloads")
    manifest = {"tiktoken_version": importlib.metadata.version("tiktoken"), "encodings": {}}
    for name in config["encodings"]:
        encoding = tiktoken.get_encoding(name)
        # tiktoken's local Encoding constructor uses these three components.
        # Exporting them avoids get_encoding's download fallback in later runs.
        ranks = b"".join(base64.b64encode(token) + b" " + str(rank).encode("ascii") + b"\n"
                         for token, rank in sorted(encoding._mergeable_ranks.items(), key=lambda item: item[1]))
        rank_path = cache / f"{name}.tiktoken"
        rank_path.write_bytes(ranks)
        spec_path = cache / f"{name}.json"
        write_json(spec_path, {"name": name, "pat_str": encoding._pat_str, "special_tokens": encoding._special_tokens})
        manifest["encodings"][name] = {
            "rank_file": rank_path.name, "rank_sha256": digest(ranks),
            "spec_file": spec_path.name, "spec_sha256": digest(spec_path.read_bytes()),
            "mergeable_rank_count": len(encoding._mergeable_ranks),
        }
    write_json(cache / "manifest.json", manifest)
    print(f"Tokenizer tables acquired for {', '.join(config['encodings'])}. Default runs now require only these local files.")


def load_local_tokenizers(config: dict) -> tuple[dict, dict]:
    import tiktoken

    cache = ROOT / ".cache"
    manifest_path = cache / "manifest.json"
    if not manifest_path.is_file():
        raise FileNotFoundError("Local tokenizer tables are absent. Run python pilot.py --setup once with network access.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    current = importlib.metadata.version("tiktoken")
    if manifest["tiktoken_version"] != current:
        raise ValueError(f"Tokenizer version mismatch: tables prepared with {manifest['tiktoken_version']}, runtime {current}.")
    encodings = {}
    for name in config["encodings"]:
        info = manifest["encodings"][name]
        rank_bytes = (cache / info["rank_file"]).read_bytes()
        spec_bytes = (cache / info["spec_file"]).read_bytes()
        if digest(rank_bytes) != info["rank_sha256"] or digest(spec_bytes) != info["spec_sha256"]:
            raise ValueError(f"Tokenizer cache checksum mismatch: {name}")
        spec = json.loads(spec_bytes)
        ranks = {}
        for line in rank_bytes.splitlines():
            token, rank = line.split()
            ranks[base64.b64decode(token, validate=True)] = int(rank)
        if len(ranks) != info["mergeable_rank_count"]:
            raise ValueError(f"Tokenizer rank count mismatch: {name}")
        encodings[name] = tiktoken.Encoding(name=spec["name"], pat_str=spec["pat_str"],
                                           mergeable_ranks=ranks, special_tokens=spec["special_tokens"])
    return encodings, manifest


def percent(numerator: int | float, denominator: int | float) -> float | None:
    return round(100 * numerator / denominator, 6) if denominator else None


def audit_variant(source: dict, prepared: dict, task_fields: list[str]) -> dict:
    source_keys, output_keys = set(source), set(prepared)
    retained = source_keys & output_keys
    nonempty = {key for key in source_keys if has_content(source[key])}
    task_present = source_keys & set(task_fields)
    task_nonempty = task_present & nonempty
    equality = {key: prepared[key] == source[key] for key in sorted(retained)}
    if output_keys - source_keys or not all(equality.values()):
        raise AssertionError("A preprocessing arm added or modified source fields.")
    return {
        "preserved_fields": sorted(retained),
        "removed_fields": sorted(source_keys - output_keys),
        "preserved_values_equal_source": equality,
        "configured_task_fields_absent_in_source": sorted(set(task_fields) - source_keys),
        "configured_task_fields_removed": sorted(task_present - output_keys),
        "source_field_value_coverage": {"retained": len(retained), "available": len(source_keys),
                                         "pct": percent(len(retained), len(source_keys))},
        "nonempty_source_field_value_coverage": {"retained": len(nonempty & output_keys), "available": len(nonempty),
                                                  "pct": percent(len(nonempty & output_keys), len(nonempty))},
        "nonempty_configured_task_field_value_coverage": {
            "retained": len(task_nonempty & output_keys), "available": len(task_nonempty),
            "pct": percent(len(task_nonempty & output_keys), len(task_nonempty))},
    }


def reduction_stats(values: list[int], baseline: list[int]) -> dict:
    per_record = [100 * (b - value) / b for value, b in zip(values, baseline)]
    quartiles = statistics.quantiles(per_record, n=4, method="inclusive") if len(per_record) > 1 else [per_record[0]] * 3
    return {"total_pct": percent(sum(baseline) - sum(values), sum(baseline)),
            "mean_record_pct": round(statistics.mean(per_record), 6),
            "median_record_pct": round(statistics.median(per_record), 6),
            "min_record_pct": round(min(per_record), 6), "max_record_pct": round(max(per_record), 6),
            "q1_record_pct": round(quartiles[0], 6), "q3_record_pct": round(quartiles[2], 6),
            "iqr_record_pct": round(quartiles[2] - quartiles[0], 6),
            "quartile_method": "statistics.quantiles(n=4, method='inclusive')"}


def grouped_duplicates(keys: list[str], records: list[dict]) -> dict:
    groups = collections.defaultdict(list)
    for index, key in enumerate(keys, 1):
        groups[key].append(f"row-{index:03d}")
    duplicates = [{"group_key": key, "record_keys": members, "count": len(members)}
                  for key, members in sorted(groups.items()) if len(members) > 1]
    return {"unique_values": len(groups), "duplicate_groups": len(duplicates),
            "rows_in_duplicate_groups": sum(group["count"] for group in duplicates),
            "additional_rows_beyond_first": sum(group["count"] - 1 for group in duplicates), "groups": duplicates}


def run_pilot(config: dict, task: str, records: list[dict], source_manifest: dict) -> dict:
    started = time.perf_counter()
    encodings, tokenizer_manifest = load_local_tokenizers(config)
    results = ROOT / "results"
    outputs = ROOT / "outputs"
    results.mkdir(parents=True, exist_ok=True)
    outputs.mkdir(parents=True, exist_ok=True)
    requests_path = outputs / "requests.jsonl"
    counts = {condition: {encoding: [] for encoding in encodings} for condition in CONDITIONS}
    csv_rows, audits, request_hashes = [], [], []
    rows_by_stratum = {"description_present": [], "description_missing": []}
    example = None
    with requests_path.open("w", encoding="utf-8", newline="\n") as request_file:
        for index, source in enumerate(records, 1):
            record_key = f"row-{index:03d}"
            source_id = source.get("Id")
            record_variants = variants(source, config)
            has_description = has_content(source.get("Description"))
            selection_hash = digest((config["quality_pilot_seed"] + "\n" + canonical(source_id) + "\n" + record_key).encode("utf-8"))
            stratum = "description_present" if has_description else "description_missing"
            rows_by_stratum[stratum].append({"record_key": record_key, "source_id": source_id,
                "description_nonempty": has_description, "selection_sha256": selection_hash})
            audit = {"record_key": record_key, "source_id": source_id, "source_fields": sorted(source),
                     "source_nonempty_fields": sorted(key for key in source if has_content(source[key])), "conditions": {}}
            record_counts = {}
            for condition in CONDITIONS:
                prepared = record_variants[condition]
                payload = render_payload(prepared, condition)
                if json.loads(payload) != prepared:
                    raise AssertionError("JSON serialization changed a source value.")
                prompt = task + payload + "\n"
                prompt_hash = digest(prompt.encode("utf-8"))
                request_id = f"{record_key}--{condition}"
                request = {"request_id": request_id, "record_key": record_key, "condition": condition,
                           "prompt": prompt, "source_id": source_id, "prompt_sha256": prompt_hash}
                request_file.write(canonical(request) + "\n")
                request_hashes.append({key: request[key] for key in ("request_id", "record_key", "condition", "prompt_sha256")})
                audit["conditions"][condition] = audit_variant(source, prepared, config["retained_fields"])
                record_counts[condition] = {}
                for encoding_name, encoding in encodings.items():
                    # Special-token-looking source strings are ordinary text, not control tokens.
                    count = len(encoding.encode(prompt, disallowed_special=()))
                    counts[condition][encoding_name].append(count)
                    record_counts[condition][encoding_name] = count
                    csv_rows.append({"record_key": record_key, "source_id": source_id, "condition": condition,
                                     "encoding": encoding_name, "input_text_tokens": count,
                                     "description_nonempty": has_description, "prompt_sha256": prompt_hash})
            if json.loads(render_payload(source, "full_pretty")) != json.loads(render_payload(source, "full_compact")):
                raise AssertionError("Formatting arms differ in content.")
            audits.append(audit)
            if example is None:
                example = {"record_key": record_key, "source_id": source_id, "source": source,
                           "task_fields": record_variants["task_fields"], "title_subjects": record_variants["title_subjects"],
                           "input_text_tokens": record_counts,
                           "note": "The first source row, selected without regard to measured savings. Both full arms contain the source object; only serialization differs."}

    fieldnames = list(csv_rows[0]) + ["reduction_from_full_compact_pct", "reduction_from_full_pretty_pct"]
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=fieldnames, lineterminator="\n")
    writer.writeheader()
    for row in csv_rows:
        index = int(row["record_key"].split("-")[1]) - 1
        for baseline in ("full_compact", "full_pretty"):
            baseline_count = counts[baseline][row["encoding"]][index]
            row[f"reduction_from_{baseline}_pct"] = percent(baseline_count - row["input_text_tokens"], baseline_count)
        writer.writerow(row)
    (results / "per-record.csv").write_text(stream.getvalue(), encoding="utf-8")
    all_fields = sorted(set().union(*(set(record) for record in records)))
    coverage = {field: {"present_records": sum(field in record for record in records),
                        "nonempty_records": sum(has_content(record.get(field)) for record in records),
                        "empty_or_absent_records": sum(not has_content(record.get(field)) for record in records)}
                for field in all_fields}
    task_content_fields = [field for field in config["retained_fields"] if field not in ("Id", "Url")]
    natural_duplicates = {
        "deduplication_applied": False,
        "source_ids": grouped_duplicates([canonical(record.get("Id")) for record in records], records),
        "exact_full_records": grouped_duplicates([digest(canonical(record).encode("utf-8")) for record in records], records),
        "exact_task_content": grouped_duplicates([digest(canonical(project(record, task_content_fields)).encode("utf-8")) for record in records], records),
        "task_content_comparison_fields": task_content_fields,
        "note": "Descriptive statistics only. Task-content comparison omits Id and Url but retains all other configured fields. All source rows are still processed independently; no savings are attributed to duplicate handling.",
    }
    selected = []
    for rows in rows_by_stratum.values():
        selected.extend(sorted(rows, key=lambda row: (row["selection_sha256"], row["record_key"]))[:config["quality_pilot_per_description_stratum"]])
    pilot_requests_path = outputs / "pilot-requests.jsonl"
    # Preserve the exact already-counted prompt text, in deterministic selected
    # record order followed by the frozen four-condition order.
    all_requests = {request["request_id"]: request for request in
                    (json.loads(line) for line in requests_path.read_text(encoding="utf-8").splitlines())}
    with pilot_requests_path.open("w", encoding="utf-8", newline="\n") as request_file:
        for record in selected:
            for condition in CONDITIONS:
                request_file.write(canonical(all_requests[f"{record['record_key']}--{condition}"]) + "\n")
    write_json(results / "quality-pilot.json", {
        "selection_method": "Within each Description-availability stratum, ascending SHA256(seed + newline + canonical JSON source Id + newline + unique row key). No token-count or model-output-based selection.",
        "seed": config["quality_pilot_seed"], "requested_per_description_stratum": config["quality_pilot_per_description_stratum"],
        "source_stratum_counts": {key: len(value) for key, value in rows_by_stratum.items()},
        "selected_count": len(selected), "records": selected, "conditions": list(CONDITIONS),
        "requests_path": "outputs/pilot-requests.jsonl",
        "model_evaluation_status": "not_run", "human_evaluation_status": "not_run",
        "note": "Balanced pilot strata are not prevalence-representative. This file selects cases; it contains no gold labels or model answers.",
    })
    write_json(results / "field-audit.json", {
        "metric": "field-value coverage, not semantic evidence retention or answer quality",
        "definition": "Each present top-level field counts once. Nonempty means at least one non-null/nonblank nested value; numeric zero and False count as values. Repeated facts across fields are not deduplicated. Absent source fields are excluded from available-field denominators.",
        "all_preserved_values_equal_source": True, "record_count": len(records), "records": audits,
    })
    write_json(results / "example.json", example)
    write_json(results / "prompt-inventory.json", {"count": len(request_hashes), "requests": request_hashes})
    conditions = {}
    for condition in CONDITIONS:
        conditions[condition] = {"tokens": {}}
        for encoding_name in encodings:
            values = counts[condition][encoding_name]
            conditions[condition]["tokens"][encoding_name] = {
                "total": sum(values), "mean_per_record": statistics.mean(values), "median_per_record": statistics.median(values),
                "reduction_from_full_compact": reduction_stats(values, counts["full_compact"][encoding_name]),
                "reduction_from_full_pretty": reduction_stats(values, counts["full_pretty"][encoding_name]),
            }
    summary = {
        "experiment": config["version"], "task": config["task"], "record_count": len(records),
        "source": source_manifest, "encodings": list(encodings), "primary_baseline": config["primary_baseline"],
        "conditions": conditions, "source_field_coverage": coverage, "natural_duplicates": natural_duplicates,
        "token_measurement": "Text of each complete task prompt plus one serialized metadata record, counted separately. Includes the same task instructions in every condition. Excludes provider chat framing, output/reasoning tokens, retries, billing, and any HokieAI allocation conversion.",
        "requests": {"path": "outputs/requests.jsonl", "sha256": digest(requests_path.read_bytes()), "count": len(request_hashes)},
        "quality_requests": {"path": "outputs/pilot-requests.jsonl", "sha256": digest(pilot_requests_path.read_bytes()),
                             "count": len(selected) * len(CONDITIONS)},
        "checks": {"all_source_rows_in_every_condition": all(len(counts[c][e]) == len(records) for c in CONDITIONS for e in encodings),
                   "pretty_compact_json_roundtrip_equal": True, "all_retained_values_equal_source": True,
                   "unique_request_ids": len({r["request_id"] for r in request_hashes}) == len(request_hashes)},
        "model_evaluation_status": "not_run", "human_evaluation_status": "not_run",
        "runtime_evidence": "results/run-environment.json",
    }
    write_json(results / "summary.json", summary)
    artifact_paths = ["config.json", "task.txt", "design-lock.json", "pilot.py", "data/loc-sample.json", "data/manifest.json",
                      "results/summary.json", "results/per-record.csv", "results/field-audit.json", "results/quality-pilot.json",
                      "results/example.json", "results/prompt-inventory.json", "outputs/requests.jsonl", "outputs/pilot-requests.jsonl", ".cache/manifest.json"]
    for info in tokenizer_manifest["encodings"].values():
        artifact_paths.extend([".cache/" + info["rank_file"], ".cache/" + info["spec_file"]])
    write_json(results / "artifact-manifest.json", {
        "algorithm": "sha256", "files": {name: digest((ROOT / name).read_bytes()) for name in sorted(artifact_paths)},
        "note": "Deterministic inputs, program, tokenizer tables, prepared prompts, and output artifacts. Variable timing/environment evidence is recorded separately; this manifest does not hash itself.",
    })
    write_json(results / "run-environment.json", {
        "completed_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "preprocessing_elapsed_seconds": round(time.perf_counter() - started, 6),
        "python_version": platform.python_version(), "platform": platform.platform(),
        "tiktoken_version": importlib.metadata.version("tiktoken"), "tokenizer_setup_is_separate": True,
        "network_guard": "Python socket entry points blocked in default run; no kernel/network-namespace isolation or network-syscall count claimed.",
        "generative_or_embedding_model_calls_in_this_program": 0,
        "model_evaluation_status": "not_run",
    })
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--setup", action="store_true", help="Acquire and export tokenizer tables; permits network access only for this explicit setup step.")
    args = parser.parse_args()
    try:
        config, task, records, source_manifest = load_design()
        if args.setup:
            setup_tokenizers(config)
            return 0
        with deny_python_network():
            summary = run_pilot(config, task, records, source_manifest)
        print(f"Prepared {summary['requests']['count']} prompts from all {summary['record_count']} source rows; no model evaluation was run.")
        for encoding_name in summary["encodings"]:
            totals = ", ".join(f"{condition}={summary['conditions'][condition]['tokens'][encoding_name]['total']}" for condition in CONDITIONS)
            print(f"{encoding_name}: {totals}")
        print("Results: research/results/summary.json; generated prompts: research/outputs/requests.jsonl")
        return 0
    except (ValueError, FileNotFoundError, KeyError, RuntimeError) as exc:
        print(f"Pilot failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
