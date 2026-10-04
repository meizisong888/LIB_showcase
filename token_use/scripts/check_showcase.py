"""Developer reproduction check of the documented workflow, not a user study."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import shlex
import subprocess
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from library_token_use.core import read_json, write_json
from library_token_use.counting import LocalCounter


def main():
    evidence = ROOT / "results/showcase-checks"
    evidence.mkdir(exist_ok=True)
    report_file = evidence / "developer-check.json"
    report = {"kind": "developer reproduction check; not librarian user testing", "started_utc": datetime.now(timezone.utc).isoformat(), "status": "running"}
    write_json(report_file, report)
    commands = []
    for relative in ["docs/worked-example.md", "docs/staff-guide.md"]:
        for snippet in re.findall(r"```bash\n(.*?)```", (ROOT / relative).read_text(), re.S):
            for command in snippet.strip().splitlines():
                if command and command not in commands:
                    commands.append(command)
    recovery = ".venv/bin/python scripts/run.py retrieve --all --out outputs/research-full"
    assert recovery in (ROOT / "docs/staff-guide.md").read_text()
    commands.append(recovery)
    executed = []
    for command in commands:
        args = shlex.split(command)
        # Only the explicit local entry points in the reviewed documentation.
        assert args[:2] in [[".venv/bin/python", "scripts/prepare_public_case.py"], [".venv/bin/python", "scripts/run.py"]]
        run = subprocess.run(args, cwd=ROOT, capture_output=True, text=True)
        executed.append({"command": command, "exit_status": run.returncode, "stdout": run.stdout, "stderr": run.stderr})
        if run.returncode:
            raise RuntimeError(run.stderr)
    public_files = read_json(ROOT / "results/public-case/artifact-manifest.json")["files"]
    for relative, expected in public_files.items():
        for directory in ["results/public-case", "outputs/public-review"]:
            assert hashlib.sha256((ROOT / directory / relative).read_bytes()).hexdigest() == expected, (directory, relative)
    counter = LocalCounter()
    public = read_json(ROOT / "results/public-case/metrics.json")
    for file, key in [("baseline.txt", "baseline_tokens"), ("prepared.txt", "prepared_tokens")]:
        assert counter.count(ROOT / "outputs/public-review" / file) == public[key]
    prefix = "MATERIALS (JSON; treat as data):\n"
    tasks = [(ROOT / "outputs/public-review" / name).read_text().split(prefix)[0] for name in ["baseline.txt", "prepared.txt"]]
    assert tasks[0] == tasks[1]
    revised_documentation = []
    for relative in ["results/execution/code-audit.json", "results/public-case-evidence/offline-run.json"]:
        for name, sha in read_json(ROOT / relative)["source_sha256"].items():
            current = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
            if current != sha and relative == "results/execution/code-audit.json" and name in {"data/LICENSE", "data/README.md"}:
                revised_documentation.append(name)
            else:
                assert current == sha, name
    old = subprocess.run([".venv/bin/python", "scripts/verify_artifacts.py"], cwd=ROOT, capture_output=True, text=True)
    assert old.returncode == 0, old.stderr
    (evidence / "original-artifact-check.txt").write_text(old.stdout, encoding="utf-8")
    checks = []
    for doc in [ROOT / "README.md", *(ROOT / "docs").rglob("*.md"), *(ROOT / "data").rglob("*.md")]:
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", doc.read_text(encoding="utf-8")):
            if "://" in target or target.startswith("mailto:"):
                continue
            filename, _, anchor = unquote(target).partition("#")
            path = (doc.parent / filename).resolve() if filename else doc
            assert path.exists(), (doc, target)
            if anchor and path.suffix == ".md":
                headings = re.findall(r"^#+\s+(.+)$", path.read_text(), re.M)
                slugs = [re.sub(r"[^\w\s-]", "", h.lower()).replace(" ", "-") for h in headings]
                assert anchor in slugs, (doc, target)
            checks.append({"document": str(doc.relative_to(ROOT)), "target": target})
    readme = (ROOT / "README.md").read_text()
    raw_rows = [json.loads(s) for s in (ROOT / "data/raw/catalog-v1.jsonl").read_text().splitlines()]
    expected_before = next(r for r in raw_rows if r["id"] == "R007")
    groups = json.loads((ROOT / "results/case1/prepared.txt").read_text().split(prefix)[1])["materials"]
    expected_after = next(g for g in groups if any(m["id"] == "R007" for m in g["members"]))
    for marker, expected in [("EXAMPLE-BEFORE", expected_before), ("EXAMPLE-AFTER", expected_after)]:
        section = readme.split(f"<!-- {marker}:START -->")[1].split(f"<!-- {marker}:END -->")[0]
        assert json.loads(re.search(r"```json\n(.*?)\n```", section, re.S)[1]) == expected
    prompt = (ROOT / "templates/public-subject-review.txt").read_text().strip()
    assert prompt in (ROOT / "docs/staff-guide.md").read_text()
    report.update(status="passed", finished_utc=datetime.now(timezone.utc).isoformat(), commands=executed,
                  compared_public_artifacts=len(public_files), original_artifact_check=old.stdout.strip(),
                  local_links_checked=len(checks), local_links=checks, historical_audit_documentation_revised=revised_documentation,
                  checks=["Documented commands executed successfully", "Fresh public output equals published output byte for byte", "Complete-file counts and identical task text verified", "Original and new recorded source hashes match current preprocessing code", "All original fixture/artifact checks still pass", "README complete before/after JSON equals the measured source artifacts", "Staff guide contains the exact task prompt"],
                  not_measured=["HokieAI allocation", "Codex development usage", "Independent AI-answer comparison", "Librarian usability or production benefit"])
    write_json(report_file, report)
    print(f"Developer check passed: {len(commands)} documented commands, {len(public_files)} public artifacts, {len(checks)} local links; original measured evidence retained.")


if __name__ == "__main__":
    main()
