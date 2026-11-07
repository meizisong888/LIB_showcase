#!/usr/bin/env python3
"""Search the stored checked texts, returning page links and matching lines."""
import argparse,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('query');args=p.parse_args()
query=args.query.strip().lower()
if not query:p.error('Query must not be empty')
count=0
for s in json.loads((ROOT/'data/sources.json').read_text()):
    for number,line in enumerate((ROOT/'data/checked'/f"{s['id']}.txt").read_text().splitlines(),1):
        if query in line.lower():
            count+=1;print(f"Sample {s['id']} | text line {number} | {s['page_url']}\n{line}\n")
print(f'{count} matching lines.')
