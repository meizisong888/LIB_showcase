"""Download the official fixed sample; acquisition is separate from preprocessing."""
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import urllib.request

URL = "https://data.labs.loc.gov/free-to-use/sample-data/metadata.json"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True,
                        help="New directory; existing snapshots are never overwritten")
    args = parser.parse_args()
    if args.out.exists():
        parser.error("Output already exists. Choose a new directory to preserve the snapshot.")
    request = urllib.request.Request(URL, headers={
        "User-Agent": "LibraryMetadataResearch/0.1 (public metadata pilot)"})
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read()
    rows = json.loads(raw)
    if not isinstance(rows, list) or len(rows) != 100:
        raise ValueError("Expected the official 100-record sample; source may have changed")
    if not all(isinstance(row, dict) and row.get("Id") for row in rows):
        raise ValueError("Unexpected source schema")
    args.out.mkdir(parents=True)
    (args.out / "loc-sample.json").write_bytes(raw)
    manifest = {
        "source_url": URL,
        "documentation_url": "https://data.labs.loc.gov/free-to-use/README.html",
        "retrieved_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "bytes": len(raw), "record_count": len(rows),
        "sampling": "All records in the official 100-item random sample; no outcome-dependent exclusions. Original sampling seed not documented.",
    }
    (args.out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
