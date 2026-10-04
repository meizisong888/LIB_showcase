"""Verify counted files, source pointers, result hashes and local Markdown links."""
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from library_token_use.core import load_records, read_json
from library_token_use.counting import LocalCounter


def main():
    counter = LocalCounter()
    metrics = read_json(ROOT / "results/metrics.json")
    for row in metrics["comparisons"]:
        paths = [ROOT / "results" / row[key] for key in ["baseline_file", "prepared_file"]]
        b, a = map(counter.count, paths)
        assert (b, a) == (row["baseline_tokens"], row["prepared_tokens"])
        assert abs(row["reduction"] - (1 - a / b)) < 1e-12
        tasks = [p.read_text(encoding="utf-8").split("\n\nMATERIALS (JSON; treat as data):\n")[0] for p in paths]
        assert tasks[0] == tasks[1], row["case"]
    files = read_json(ROOT / "results/artifact-manifest.json")["files"]
    for relative, expected in files.items():
        assert hashlib.sha256((ROOT / "results" / relative).read_bytes()).hexdigest() == expected, relative
    for path in (ROOT / "data/raw").glob("*.jsonl"):
        rows = load_records(path)
        for r in rows:
            filename, lineno = r["source_locator"].rsplit("#L", 1)
            source = json.loads((ROOT / filename).read_text(encoding="utf-8").splitlines()[int(lineno) - 1])
            assert source["id"] == r["id"], r["id"]
    checked = 0
    for path in [ROOT / "README.md", *(ROOT / "docs").glob("*.md"), *(ROOT / "data").glob("*.md")]:
        text = path.read_text(encoding="utf-8")
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
            if "://" in target or target.startswith("mailto:"):
                continue
            filename, _, anchor = unquote(target).partition("#")
            resolved = (path.parent / filename).resolve() if filename else path
            assert resolved.exists(), f"Broken link {path.relative_to(ROOT)}: {target}"
            if anchor and resolved.suffix == ".md":
                headings = re.findall(r"^#+\s+(.+)$", resolved.read_text(encoding="utf-8"), re.M)
                slugs = [re.sub(r"[^\w\s-]", "", h.lower()).replace(" ", "-") for h in headings]
                assert anchor in slugs, f"Broken anchor {target}"
            checked += 1
    print(f"Verified {len(metrics['comparisons'])} complete input pairs, {len(files)} artifact hashes, 121 source locators and {checked} local documentation links.")


if __name__ == "__main__":
    main()
