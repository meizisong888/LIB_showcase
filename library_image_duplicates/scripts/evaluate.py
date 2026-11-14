"""Metrics from saved pair scores and identity-based ground truth."""
import argparse, itertools
from common import ROOT, read, write, digest

def metrics(pairs,identities):
    tp=fp=fn=0
    for p in pairs:
        truth=identities[p['a']]==identities[p['b']]
        tp+=int(p['candidate'] and truth);fp+=int(p['candidate'] and not truth);fn+=int(not p['candidate'] and truth)
    return {'precision':tp/(tp+fp) if tp+fp else None,'recall':tp/(tp+fn) if tp+fn else None,'tp':tp,'fp':fp,'fn':fn,'candidate_pairs':tp+fp,'evaluated_pairs':len(pairs)}

def evaluate(results,files):
    identities={f['id']:f['identity'] for f in files};by_id={f['id']:f for f in files};output={}
    for method,result in results.items():
        expected={tuple(sorted(p)) for p in itertools.combinations(identities,2)}
        actual={tuple(sorted((p['a'],p['b']))) for p in result['pairs']}
        assert actual==expected and len(result['pairs'])==len(expected),'Pair universe differs'
        row=metrics(result['pairs'],identities);row['by_variant']={}
        for variant in ['copy','resize','compressed','crop','crop_upscale']:
            subset=[p for p in result['pairs'] if identities[p['a']]==identities[p['b']] and {by_id[p['a']]['variant'],by_id[p['b']]['variant']}=={'original',variant}]
            row['by_variant'][variant]={'found':sum(p['candidate'] for p in subset),'total':len(subset)}
        row['examples']={}
        for label,positive,predicted in [('success',True,True),('miss',True,False),('false_positive',False,True)]:
            eligible=[p for p in result['pairs'] if (identities[p['a']]==identities[p['b']])==positive and p['candidate']==predicted]
            # Deterministic illustrative selection, after evaluation; not used to tune thresholds.
            eligible.sort(key=lambda p:(not ('crop' in p['a'] or 'crop' in p['b']),p['a'],p['b']))
            row['examples'][label]=eligible[:2]
        output[method]=row
    return output

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    manifest=read(ROOT/'data/manifest.json');files=[f for f in manifest['files'] if f['split']=='test']
    saved={m:read(ROOT/f'results/predictions/test-{m}.json') for m in 'ABCD'}
    result=evaluate(saved,files)
    if args.check: assert result==read(ROOT/'results/metrics.json');print('Metrics exactly reproduced from saved predictions + identities.')
    else: write(ROOT/'results/metrics.json',result)
if __name__=='__main__':main()
