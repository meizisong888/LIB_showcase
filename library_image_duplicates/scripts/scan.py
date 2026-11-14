"""Screen a user-owned image folder without changing, moving, or deleting its files."""
import argparse, html, itertools
from pathlib import Path
from common import ROOT,read,write
from experiment import run

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('folder',type=Path);p.add_argument('--output',type=Path,required=True);p.add_argument('--method',choices=list('ABCD'),default='D');p.add_argument('--phash-distance',type=int);p.add_argument('--ai-threshold',type=float);args=p.parse_args()
    folder=args.folder.resolve();output=args.output.resolve()
    if output==folder or folder in output.parents: p.error('Choose an output directory outside the input folder.')
    files=[{'id':str(f.relative_to(folder)),'path':str(f)} for f in sorted(folder.rglob('*')) if f.is_file() and f.suffix.lower() in {'.jpg','.jpeg','.png','.webp','.tif','.tiff','.bmp'}]
    if len(files)<2:p.error('Need at least two readable image files.')
    thresholds=dict(read(ROOT/'results/thresholds.json')['thresholds'])
    if args.phash_distance is not None:thresholds['phash_max_distance']=args.phash_distance
    if args.ai_threshold is not None:thresholds['ai_min_cosine']=args.ai_threshold
    result=run(files,args.method,output/'cache',thresholds,'user-scan')
    candidates=[p for p in result.pop('pairs') if p['candidate']]
    result['candidate_pairs']=candidates;result['mode']='Unknown images: candidates for human review; no ground-truth or correctness labels.'
    write(output/'candidates.json',result)
    e=html.escape
    rows=''.join(f'<tr><td>{e(x["a"])}</td><td>{e(x["b"])}</td><td>{x["score"]}</td><td>{"Bytes verified identical" if x["exact_verified"] else "Needs review"}</td></tr>' for x in candidates)
    (output/'index.html').write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Image candidates for review</title><style>body{{font:18px system-ui;max-width:1000px;margin:3rem auto;padding:1rem}}td,th{{padding:12px;text-align:left;border-bottom:1px solid #ccc}}table{{width:100%;overflow-wrap:anywhere}}</style><h1>Image candidates for review</h1><p>{len(files)} files; {len(candidates)} candidate pairs. Method {args.method}.</p><p>These are unknown images. Similarity is evidence to inspect, not a confirmed photo identity. No files were modified. Thresholds came from a small controlled experiment and may not transfer to your collection.</p><p>File hash: 1 = bytes verified identical. pHash: lower distance is closer. AI: higher cosine is closer.</p><p><a href="candidates.json">Scores, configuration and run record</a></p><table><caption>Candidate pairs</caption><thead><tr><th>File A</th><th>File B</th><th>Score</th><th>Review status</th></tr></thead><tbody>{rows}</tbody></table></html>')
    print(f'Wrote {output}/index.html. Input images were read only.')
if __name__=='__main__':main()
