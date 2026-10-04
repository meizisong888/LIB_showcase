"""One explicit online acquisition step, separate from local preprocessing."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
URL = "https://www.loc.gov/collections/fsa-owi-color-photographs/?fo=json&c=12&sp=1"
DEST = ROOT / "data/public-loc"


def main():
    if (DEST / "records.jsonl").exists():
        raise SystemExit("Published sample already exists; refusing to replace the frozen source.")
    request = urllib.request.Request(URL, headers={"User-Agent": "LibraryTokenUse educational metadata sample"})
    with urllib.request.urlopen(request, timeout=45) as response:
        raw = response.read()
    result = json.loads(raw)
    selected = result["results"]
    if len(selected) != 12:
        raise ValueError("Expected exactly the first 12 records; no adaptive sample-size change.")
    records = [entry["item"] for entry in selected]
    if len({r["id"] for r in records}) != 12:
        raise ValueError("Duplicate source IDs; inspect the sample before publishing.")
    if any(r.get("rights_advisory") != "No known restrictions on publication." for r in records):
        raise ValueError("Unexpected item advisory; inspect rights before publishing any sample.")
    text = "".join(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n" for r in records)
    DEST.mkdir(parents=True, exist_ok=True)
    (DEST / "records.jsonl").write_text(text, encoding="utf-8")
    manifest = {
        "acquired_utc": datetime.now(timezone.utc).isoformat(), "source_url": URL,
        "sampling": "First 12 results on collection page 1 in API-returned order; no query or content/completeness/token filtering. Fixed snapshot, not representative sampling.",
        "extraction": "Each results[i].item is retained completely and unchanged in value, serialized as one JSON object per line. Site envelopes and image derivatives are not catalog records and are not included.",
        "api_response_sha256": hashlib.sha256(raw).hexdigest(),
        "records_sha256": hashlib.sha256(text.encode()).hexdigest(),
        "rights_url": "https://www.loc.gov/collections/fsa-owi-color-photographs/about-this-collection/rights-and-access/",
        "credit_line": "Library of Congress, Prints & Photographs Division, Farm Security Administration/Office of War Information Color Photographs.",
        "rights_verification": "Official collection rights statement retrieved through web search on 2026-10-04: collection contents are public domain and free to use/reuse. Direct rights-page HTTP requests returned 403; the official indexed statement was available. All 12 native item advisories were separately checked. No images downloaded.",
        "frozen_design_sha256": {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in ["docs/public-case-design.md", "configs/public-subject-review.json", "templates/public-subject-review.txt"]},
        "records": [{"id": r["id"], "catalog_url": r["link"], "source_result_url": entry["id"],
                     "source_locator": f"data/public-loc/records.jsonl#L{i}",
                     "rights_advisory": r["rights_advisory"],
                     "record_sha256": hashlib.sha256(json.dumps(r, ensure_ascii=False, sort_keys=True).encode()).hexdigest()}
                    for i, (r, entry) in enumerate(zip(records, selected), 1)],
    }
    (DEST / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Acquired {len(records)} real public catalog records; no images. SHA256: {manifest['records_sha256']}")
    for r in records:
        print(r["id"], r["title"], "summary present:", bool(r.get("summary")))


if __name__ == "__main__":
    main()
