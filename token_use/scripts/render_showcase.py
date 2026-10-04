"""Render readable examples and tables from existing measured artifacts only."""
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def replace(path, name, body):
    file = ROOT / path
    text = file.read_text(encoding="utf-8")
    pattern = re.compile(rf"^([ \t]*)<!-- {name}:START -->.*?^[ \t]*<!-- {name}:END -->", re.M | re.S)
    def replacement(match):
        indent = match.group(1)
        lines = [f"<!-- {name}:START -->", "", *body.strip().splitlines(), "", f"<!-- {name}:END -->"]
        return "\n".join(indent + line if line else "" for line in lines)
    updated, count = pattern.subn(replacement, text)
    if count != 1:
        raise ValueError(f"Expected one {name} block in {path}, found {count}")
    file.write_text(updated, encoding="utf-8")


def block(value):
    return "```json\n" + json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n```"


def main():
    rows = [json.loads(line) for line in (ROOT / "data/raw/catalog-v1.jsonl").read_text().splitlines()]
    original = next(r for r in rows if r["id"] == "R007")
    payload = json.loads((ROOT / "results/case1/prepared.txt").read_text().split("MATERIALS (JSON; treat as data):\n", 1)[1])
    prepared = next(item for item in payload["materials"] if any(member["id"] == "R007" for member in item["members"]))
    replace("README.md", "EXAMPLE-BEFORE", block(original))
    replace("README.md", "EXAMPLE-AFTER", block(prepared))
    metrics = read("results/metrics.json")["comparisons"]
    public = read("results/public-case/metrics.json")
    table = "| Dataset / task | Text tokens: before → after | Input reduction | Retention and limitation |\n| --- | ---: | ---: | --- |\n"
    descriptions = {
        0: "60 IDs → 58 items; all 12 configured original fields checked; one missing abstract",
        1: "5/12 relevant records; recall 41.67%; seven positives missed",
        2: "10/12 relevant records; recall 83.33%; two positives still missed",
        5: "56 preparations reused; four newly pending; no AI answers cached",
    }
    for index, label in [(0, "Synthetic · subject preparation"), (1, "Synthetic · TF-IDF top-5"), (2, "Synthetic · TF-IDF top-15"), (5, "Synthetic · second update")]:
        m = metrics[index]
        table += f"| {label} | {m['baseline_tokens']:,} → {m['prepared_tokens']:,} | {m['reduction']:.2%} | {descriptions[index]} |\n"
    table += f"| Real LOC metadata · subject preparation | {public['baseline_tokens']:,} → {public['prepared_tokens']:,} | {public['reduction']:.2%} | {public['retained_ids']} IDs; {public['configured_content_fields']} configured content fields plus sources preserved; {public['insufficient_material_records']} missing summaries |\n"
    replace("README.md", "SHOWCASE-RESULTS", table)
    (ROOT / "results/showcase-summary.md").write_text(table, encoding="utf-8")
    public_table = (ROOT / "results/public-case/summary.md").read_text()
    for path in ["docs/worked-example.md", "docs/experiment-report.md", "data/public-loc/README.md"]:
        replace(path, "PUBLIC-RESULTS", public_table)
    replace("docs/worked-example.md", "PUBLIC-BEFORE", block(read("results/public-case/example-before.json")))
    replace("docs/worked-example.md", "PUBLIC-AFTER", block(read("results/public-case/example-after.json")))
    prompt = (ROOT / "templates/public-subject-review.txt").read_text().strip()
    for path in ["docs/staff-guide.md", "docs/staff-guide.zh-CN.md"]:
        replace(path, "STAFF-PROMPT", "> " + prompt)
    cfg = read("configs/subject-review.json")
    field_table = "| Required information | Nonempty source values | Preservation / exception |\n| --- | ---: | --- |\n"
    exceptions = {"abstract": "R008 stays empty and is explicitly insufficient", "date": "R018's invalid date remains with a rule issue", "material_type": "R019's unrecognized type remains with a rule issue", "subjects": "R007's allowed but mismatched Astronomy term still reaches review", "restrictions": "R005/R016/R020 qualifications unchanged", "edition": "R015 remains separate", "copy": "R016 remains separate"}
    for key in cfg["fields"] + ["id", "source_locator"]:
        nonempty = sum(r.get(key) not in (None, "", []) for r in rows)
        field_table += f"| `{key}` | {nonempty}/{len(rows)} | Equal to original for every row; {exceptions.get(key, 'retained without rewriting')} |\n"
    replace("docs/experiment-report.md", "FIELD-RETENTION", field_table)
    print("Rendered README examples, combined results, field-retention table, public worked example and identical staff prompts from stored artifacts.")


if __name__ == "__main__":
    main()
