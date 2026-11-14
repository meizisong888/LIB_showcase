"""Evidence consistency + meaningful implementation invariants; --static-only needs stdlib."""
import argparse, itertools, json, subprocess, sys, tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
from common import ROOT,canonical,digest,read,write
from evaluate import evaluate
class Links(HTMLParser):
    def __init__(self):super().__init__();self.targets=[]
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ['src','href'] and v:self.targets.append(v)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--static-only',action='store_true');args=parser.parse_args();checks={}
    manifest=read(ROOT/'data/manifest.json');files=manifest['files'];lookup={f['id']:f for f in files};sources=read(ROOT/'data/sources.json');base=[f for f in files if f['split']!='incremental'];test=[f for f in files if f['split']=='test'];cal=[f for f in files if f['split']=='calibration']
    assert len(base)==180 and len(files)==185 and len(sources)==32
    assert len(test)==108 and len(cal)==72 and {f['identity'] for f in test}.isdisjoint({f['identity'] for f in cal})
    for identity in {f['identity'] for f in base}:
        rows=[f for f in base if f['identity']==identity];assert len(rows)==6 and len({f['split'] for f in rows})==1
        original=lookup[f'{identity}__original.jpg'];copy=lookup[f'{identity}__copy.jpg'];assert original['sha256']==copy['sha256']
        for variant in ['resize','compressed','crop','crop_upscale']:assert lookup[f'{identity}__{variant}.jpg']['sha256']!=original['sha256']
    for pair in read(ROOT/'data/identity-review.json')['pairs']:
        assert lookup[f'{pair["a"]}__original.jpg']['split']==pair['split']==lookup[f'{pair["b"]}__original.jpg']['split']
        assert pair['same_photo'] is False
    checks['identity_split_no_leakage']=True
    for path,expected in read(ROOT/'results/implementation.json')['sha256'].items():
        assert digest((ROOT/path).read_bytes())==expected
    checks['measured_implementation_matches']=True
    thresholds=read(ROOT/'results/thresholds.json');assert digest((ROOT/'data/manifest.json').read_bytes())==thresholds['manifest_sha256']
    sha=digest((ROOT/'results/thresholds.json').read_bytes());assert sha==read(ROOT/'results/environment.json')['thresholds_sha256']==read(ROOT/'results/experiment-complete.json')['thresholds_sha256']
    saved={m:read(ROOT/f'results/predictions/test-{m}.json') for m in 'ABCD'}
    for result in saved.values():assert result['utc']>=thresholds['frozen_utc'] and result['thresholds']==thresholds['thresholds']
    recalculated=evaluate(saved,test);assert recalculated==read(ROOT/'results/metrics.json')
    checks['metrics_rederived_from_all_saved_pairs']=True;checks['frozen_threshold_hash_and_test_order']=True
    for m in 'AD':
        reps=saved[m]['representatives'];assert len(set(reps.values()))==90
        for f in test:assert lookup[reps[f['id']]]['sha256']==f['sha256']
    assert saved['C']['counters']['ai_extractions']==108 and saved['D']['counters']['ai_extractions']==90
    # D scores exact groups as 1.0; candidate flags must match the fair C baseline here.
    assert [p['candidate'] for p in saved['C']['pairs']]==[p['candidate'] for p in saved['D']['pairs']]
    checks['exact_mapping_and_extraction_counts']=True
    full=read(ROOT/'results/predictions/incremental-full.json');reuse=read(ROOT/'results/predictions/incremental-reuse.json')
    assert full['pairs']==reuse['pairs'] and full['representatives']==reuse['representatives']
    assert full['counters']['ai_extractions']==94 and reuse['counters']['ai_extractions']==4 and reuse['counters']['cache_hits']==90
    checks['incremental_vs_full_exact_output_equality']=True
    thumb_manifest=read(ROOT/'data/thumbnails.json');assert {t['id'] for t in thumb_manifest}==set(lookup)
    for thumb in thumb_manifest:
        assert thumb['experiment_file_sha256']==lookup[thumb['id']]['sha256']
        assert digest((ROOT/'images'/thumb['id']).read_bytes())==thumb['thumbnail_sha256']
    checks['thumbnail_file_binding']=True
    report=read(ROOT/'results/report.json');assert report['metrics']==recalculated and report['thresholds']==thresholds['thresholds'] and len(report['pairs'])==5778
    pair_map={m:{tuple(sorted((p['a'],p['b']))):p for p in saved[m]['pairs']} for m in 'ABCD'}
    for row in report['pairs']:
        assert row['truth']==(lookup[row['a']]['identity']==lookup[row['b']]['identity'])
        for m in 'ABCD':
            p=pair_map[m][tuple(sorted((row['a'],row['b'])))];assert row['scores'][m]==p['score'] and row['selected'][m]==p['candidate']
    for example in report['illustrative_cases']:
        p=example['pair'];actual=pair_map[example['method']][tuple(sorted((p['a'],p['b'])))];assert p==actual
    checks['page_scores_and_examples_match_experiment']=True
    # Rebuild deterministically and verify checked-in generated content was already current.
    generated=['index.html','sources.html','README.md','results/report.json'];before={f:digest((ROOT/f).read_bytes()) for f in generated}
    subprocess.run([sys.executable,str(ROOT/'scripts/build.py')],check=True)
    assert before=={f:digest((ROOT/f).read_bytes()) for f in generated}
    checks['generated_page_and_readme_current']=True
    # This output is linked on the page; allow it to be created after validating all other targets.
    for filename in ['index.html','sources.html']:
        parser=Links();parser.feed((ROOT/filename).read_text())
        for target in parser.targets:
            u=urlsplit(target)
            if u.scheme or u.netloc or not u.path:continue
            dest=(ROOT/unquote(u.path)).resolve();assert dest.is_relative_to(ROOT)
            assert dest.is_file() or u.path=='results/validation.json',f'Missing local target: {target}'
    checks['local_page_links_and_images_exist']=True
    if not args.static_only:
        for f in files:assert digest((ROOT/f['path']).read_bytes())==f['sha256']
        for s in sources:assert digest((ROOT/'work/originals'/f'{s["identity"]}.jpg').read_bytes())==s['sha256']
        checks['all_downloaded_and_transformed_bytes_match']=True
        from engine import cache_key,configuration,detect
        import engine
        cfg=configuration('D');h=test[0]['sha256'];base_key=cache_key(h,cfg)
        for field,value in [('model','different-weights'),('preprocessing',{'resize':[288,288]}),('algorithm_version','different-version'),('device','different-device')]:
            assert base_key!=cache_key(h,{**cfg,field:value})
        assert base_key!=cache_key('changed-content',cfg)
        with tempfile.TemporaryDirectory(dir=ROOT/'work') as tmp:
            tmp=Path(tmp);a=tmp/'a.jpg';b=tmp/'renamed.jpg';c=tmp/'different.jpg';a.write_bytes(b'identical bytes');b.write_bytes(a.read_bytes());c.write_bytes(b'different bytes')
            fs=[{'id':p.name,'path':str(p)} for p in [a,b,c]]
            # Deliberate hash-collision simulation: byte verification must prevent a false merge.
            original_digest=engine.digest
            try:
                engine.digest=lambda data:'forced-same-sha';result=detect(fs,'A',tmp/'cache',thresholds['thresholds'])
            finally:engine.digest=original_digest
            assert sum(p['candidate'] for p in result['pairs'])==1 and result['representatives']['renamed.jpg']=='a.jpg' and result['representatives']['different.jpg']=='different.jpg'
            checks['same_hash_requires_byte_verification']=True
            # Exercise actual cache hits and version invalidation (pHash does not require model reload).
            sample=test[0];real=[{'id':sample['id'],'path':str(ROOT/sample['path'])}]
            first=detect(real,'B',tmp/'features',thresholds['thresholds']);warm=detect(real,'B',tmp/'features',thresholds['thresholds'])
            assert first['counters']['phash_computations']==1 and warm['counters']['cache_hits']==1 and warm['counters']['phash_computations']==0
            old=engine.ALGORITHM_VERSION
            try:
                engine.ALGORITHM_VERSION+='-invalidation-check';changed=detect(real,'B',tmp/'features',thresholds['thresholds'])
            finally:engine.ALGORITHM_VERSION=old
            assert changed['counters']['cache_hits']==0 and changed['counters']['phash_computations']==1
        checks['cache_configuration_changes_invalidate']=True
    result={'mode':'static-only' if args.static_only else 'full local validation','checks':checks,'passed':True}
    if not args.static_only:write(ROOT/'results/validation.json',result)
    print(json.dumps(result,indent=2))
if __name__=='__main__':main()
