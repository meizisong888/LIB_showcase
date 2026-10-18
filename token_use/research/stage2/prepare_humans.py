"""Import actual outputs and create two unscored, blinded reviewer packets."""
from pathlib import Path
import csv
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
R = ROOT.parent


def main():
    admin = ROOT / 'results' / 'review-administration'
    if not admin.exists():
        subprocess.run([sys.executable, str(R / 'prepare_review.py'), '--responses',
                        str(ROOT / 'results' / 'generation-responses.jsonl'),
                        '--out', str(admin)], check=True)
    audit = json.loads((admin / 'response-audit.json').read_text())
    if audit['observed_quality_requests'] != 80:
        raise ValueError('Prepare the final packets only after all 80 requests have observations')
    # Canonicalize CSV row separators only; preserve every parsed response value.
    csv_path = admin / 'blinded-review.csv'
    with csv_path.open(newline='') as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames
        imported_rows = list(reader)
    with csv_path.open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator='\n')
        writer.writeheader()
        writer.writerows(imported_rows)
    folder = ROOT / 'human-review'
    folder.mkdir(exist_ok=True)
    for reviewer in [1, 2]:
        dest = folder / f'reviewer-{reviewer}.csv'
        if not dest.exists():  # Never overwrite any scores entered later.
            shutil.copyfile(admin / 'blinded-review.csv', dest)
    selected = json.loads((R / 'results/quality-pilot.json').read_text())['records']
    sources = json.loads((R / 'data/loc-sample.json').read_text())
    subset = {r['record_key']: sources[int(r['record_key'][4:]) - 1] for r in selected}
    sourcefile = folder / 'source-records.json'
    if not sourcefile.exists():
        sourcefile.write_text(json.dumps(subset, ensure_ascii=False, indent=2) + '\n')
    for reviewer in [1, 2]:
        dest = folder / f'reviewer-{reviewer}-source-facts.csv'
        if dest.exists():
            continue
        with dest.open('w', newline='') as handle:
            writer = csv.DictWriter(handle, fieldnames=['record_key', 'source_url', 'salient_facts', 'source_fields', 'uncertainties'], lineterminator='\n')
            writer.writeheader()
            for key, source in subset.items():
                writer.writerow({'record_key': key, 'source_url': source['Id']})
    print('Existing importer accepted 80 actual observations. Two reviewer sheets and source-fact sheets remain unscored.')


if __name__ == '__main__':
    main()
