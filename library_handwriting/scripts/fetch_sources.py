#!/usr/bin/env python3
"""Re-download exact source files into a new directory; never overwrite evidence."""
import argparse,hashlib,json
from pathlib import Path
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,required=True);args=p.parse_args()
args.output.mkdir(parents=True,exist_ok=False)
for s in json.loads((ROOT/'data/sources.json').read_text()):
    for kind,url,suffix,expected_path in [('image',s['image_url'],'.jpg',ROOT/s['image_path']),('reference',s['reference_url'],'.txt',ROOT/'data/reference'/f"{s['id']}-download.txt")]:
        with urlopen(Request(url,headers={'User-Agent':'LibraryHandwritingShowcase/1.0'}),timeout=60) as response:content=response.read()
        path=args.output/f"{s['id']}-{kind}{suffix}"
        with path.open('xb') as f:f.write(content)
        digest=hashlib.sha256(content).hexdigest();same=digest==hashlib.sha256(expected_path.read_bytes()).hexdigest()
        print(f'{path.name}: sha256={digest}; matches preserved source={same}')
