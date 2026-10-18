"""Verify regenerated pilot artifacts and local documentation links; no network use."""
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    verified = []
    for manifest in ("design-lock.json", "results/artifact-manifest.json"):
        for name, expected in read_json(ROOT / manifest)["files"].items():
            actual = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
            if actual != expected:
                raise ValueError(f"Hash mismatch in {manifest}: {name}")
            verified.append({"manifest": manifest, "file": name, "sha256": actual})

    summary = read_json(ROOT / "results/summary.json")
    rows = list(csv.DictReader((ROOT / "results/per-record.csv").open(encoding="utf-8")))
    totals, sizes = Counter(), Counter()
    for row in rows:
        pair = row["encoding"], row["condition"]
        totals[pair] += int(row["input_text_tokens"])
        sizes[pair] += 1
    expected_totals = {(encoding, condition): values["total"]
                       for condition, info in summary["conditions"].items()
                       for encoding, values in info["tokens"].items()}
    assert dict(totals) == expected_totals
    assert all(size == summary["record_count"] for size in sizes.values())
    requests = [json.loads(line) for line in (ROOT / "outputs/requests.jsonl").read_text().splitlines()]
    inventory = read_json(ROOT / "results/prompt-inventory.json")
    assert len(requests) == inventory["count"] == summary["requests"]["count"]
    assert len({row["request_id"] for row in requests}) == len(requests)
    assert [{key: row[key] for key in ("request_id", "record_key", "condition", "prompt_sha256")}
            for row in requests] == inventory["requests"]
    for row in requests:
        assert hashlib.sha256(row["prompt"].encode()).hexdigest() == row["prompt_sha256"]
    pilot = read_json(ROOT / "results/quality-pilot.json")
    selected = [json.loads(line) for line in (ROOT / "outputs/pilot-requests.jsonl").read_text().splitlines()]
    assert len(selected) == pilot["selected_count"] * len(pilot["conditions"]) == summary["quality_requests"]["count"]
    assert {row["request_id"] for row in selected} == {
        f"{row['record_key']}--{condition}" for row in pilot["records"] for condition in pilot["conditions"]}

    showcase = ROOT.parent
    documents = sorted([showcase / "README.md", *ROOT.glob("*.md"),
                        *(ROOT / "data").glob("*.md"),
                        *(showcase / "docs").rglob("*.md"),
                        *(showcase / "data").rglob("*.md")])
    links = []
    for doc in documents:
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", doc.read_text(encoding="utf-8")):
            if "://" in target or target.startswith("mailto:"):
                continue
            filename, _, anchor = unquote(target).partition("#")
            path = (doc.parent / filename).resolve() if filename else doc
            if not path.exists():
                raise ValueError(f"Missing link in {doc.name}: {target}")
            if anchor and path.suffix == ".md":
                headings = re.findall(r"^#+\s+(.+)$", path.read_text(encoding="utf-8"), re.M)
                slugs = [re.sub(r"[^\w\s-]", "", h.lower()).replace(" ", "-") for h in headings]
                if anchor not in slugs:
                    raise ValueError(f"Missing anchor in {doc.name}: {target}")
            links.append({"document": str(doc.relative_to(showcase)), "target": target})
    print(json.dumps({"status": "passed", "hash_checks": verified,
                      "count_rows": len(rows), "requests": len(requests),
                      "selected_requests": len(selected), "local_links": links,
                      "scope": "Hashes, counts, identities and local links; no external-link, model-quality or OS-network verification."}, indent=2))


if __name__ == "__main__":
    main()
