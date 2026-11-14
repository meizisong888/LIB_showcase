"""Calibrate first, freeze thresholds, then test; benchmark cold/warm/incremental runs."""
import argparse, importlib.metadata, itertools, os, platform, random, shutil, statistics, subprocess, sys, time
from pathlib import Path
from common import ROOT, read, write, digest, canonical
from evaluate import evaluate, metrics
METHODS='ABCD';SEED=20261114

def run(files,method,cache,thresholds,label):
    out=ROOT/'work/runs'/f'{label}.json';job=ROOT/'work/job.json'
    write(job,{'files':[{**f,'path':str(ROOT/f['path'])} for f in files],'method':method,'cache':str(cache),'thresholds':thresholds,'output':str(out)})
    start=time.perf_counter()
    child=subprocess.Popen([sys.executable,str(ROOT/'scripts/worker.py'),'--job',str(job)],cwd=ROOT)
    _,status,usage=os.wait4(child.pid,0)
    child.returncode=os.waitstatus_to_exitcode(status)
    if child.returncode: raise subprocess.CalledProcessError(child.returncode,child.args)
    wall=time.perf_counter()-start;result=read(out);result['process_wall_s']=wall
    result['worker_cpu_before_output_s']=result['cpu_s']
    result['cpu_s']=usage.ru_utime+usage.ru_stime
    result['peak_rss_mib']=usage.ru_maxrss/1024
    result['utc']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());result['label']=label
    print(label,round(wall,3),'seconds',result['counters'],flush=True)
    return result

def tune(pairs,identities,kind):
    rows=[]
    thresholds=range(65) if kind=='phash' else [i/100 for i in range(101)]
    for t in thresholds:
        pred=[{**p,'candidate':p['score']<=t if kind=='phash' else p['score']>=t} for p in pairs]
        m=metrics(pred,identities);denom=2*m['tp']+m['fp']+m['fn'];f1=2*m['tp']/denom if denom else 0
        rows.append({'threshold':t,'f1':f1,**m})
    best=max(rows,key=lambda x:(x['f1'],x['precision'] or 0, -x['threshold'] if kind=='phash' else x['threshold']))
    return best['threshold'],rows

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--repeats',type=int,default=3);parser.add_argument('--frozen-thresholds',action='store_true');args=parser.parse_args();assert args.repeats>=3
    manifest=read(ROOT/'data/manifest.json');cal=[f for f in manifest['files'] if f['split']=='calibration'];test=[f for f in manifest['files'] if f['split']=='test'];added=[f for f in manifest['files'] if f['split']=='incremental']
    assert {x['identity'] for x in cal}.isdisjoint({x['identity'] for x in test})
    results=ROOT/'results';pred_dir=results/'predictions';pred_dir.mkdir(exist_ok=True)
    # Calibration never reads test labels or scores. The split and grid are predetermined.
    defaults={'phash_max_distance':0,'ai_min_cosine':1.0};calout={}
    for m in 'BC':
        cache=ROOT/'work/cal-cache'/m;shutil.rmtree(cache,ignore_errors=True)
        calout[m]=run(cal,m,cache,defaults,f'calibration-{m}')
        write(pred_dir/f'calibration-{m}.json',calout[m])
    ids={f['id']:f['identity'] for f in cal}
    p,pr=tune(calout['B']['pairs'],ids,'phash');a,ar=tune(calout['C']['pairs'],ids,'ai')
    frozen={'phash_max_distance':p,'ai_min_cosine':a}
    threshold_record={'thresholds':frozen,'selection':'Maximize calibration pair F1; then precision; then stricter threshold. pHash integer 0..64; cosine 0..1 step 0.01. C and D share AI threshold.','seed':SEED,'calibration_identities':manifest['calibration_identities'],'manifest_sha256':digest((ROOT/'data/manifest.json').read_bytes()),'frozen_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'grid':{'phash':pr,'ai':ar}}
    if args.frozen_thresholds:
        existing=read(results/'thresholds.json')
        assert existing['thresholds']==frozen,'Final calibration differs from frozen policy result; stop rather than tune to test.'
        assert existing['manifest_sha256']==threshold_record['manifest_sha256']
        write(results/'calibration-confirmation.json',{'frozen_thresholds_unchanged':True,'confirmation_utc':threshold_record['frozen_utc'],'thresholds':frozen,'configuration':calout['C']['configuration'],'grid':threshold_record['grid']})
    else:
        write(results/'thresholds.json',threshold_record)
    frozen_sha=digest((results/'thresholds.json').read_bytes()); print('FROZEN before test:',frozen,frozen_sha,flush=True)
    runs=[];predictions={};rng=random.Random(SEED)
    for repeat in range(args.repeats):
        order=list(METHODS);rng.shuffle(order)
        for m in order:
            cache=ROOT/'work/benchmark-cache'/m;shutil.rmtree(cache,ignore_errors=True)
            first=run(test,m,cache,frozen,f'test-{m}-first-{repeat}')
            warm=run(test,m,cache,frozen,f'test-{m}-warm-{repeat}')
            assert first['pairs']==warm['pairs']
            if repeat==0:
                predictions[m]=first;write(pred_dir/f'test-{m}.json',first)
            else: assert predictions[m]['pairs']==first['pairs'],'Nondeterministic outputs'
            for result,mode in [(first,'first'),(warm,'warm')]:
                runs.append({k:v for k,v in result.items() if k not in ['pairs','files','representatives']}|{'repeat':repeat,'mode':mode})
    assert digest((results/'thresholds.json').read_bytes())==frozen_sha
    write(results/'metrics.json',evaluate(predictions,test));write(results/'benchmark-runs.json',runs)
    incremental=[]
    for repeat in range(args.repeats):
        cache=ROOT/'work/incremental-cache';shutil.rmtree(cache,ignore_errors=True)
        # Seed from established results outside the measured incremental operation.
        run(test,'D',cache,frozen,f'incremental-seed-{repeat}')
        full_cache=ROOT/'work/full-cache';shutil.rmtree(full_cache,ignore_errors=True)
        tasks=['reuse','full'];rng.shuffle(tasks);res={}
        for mode in tasks: res[mode]=run(test+added,'D',cache if mode=='reuse' else full_cache,frozen,f'incremental-{mode}-{repeat}')
        assert res['reuse']['pairs']==res['full']['pairs'],'Incremental differs from full recomputation'
        assert res['reuse']['representatives']==res['full']['representatives']
        for mode,result in res.items():
            if repeat==0:write(pred_dir/f'incremental-{mode}.json',result)
            incremental.append({k:v for k,v in result.items() if k not in ['pairs','files','representatives']}|{'repeat':repeat,'mode':mode})
    write(results/'incremental-runs.json',incremental)
    env={'run_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'python':sys.version,'platform':platform.platform(),'machine':platform.machine(),'cpu_model':next((s.split(':',1)[1].strip() for s in Path('/proc/cpuinfo').read_text().splitlines() if s.startswith('model name')),'unknown'),'cpu_count':os.cpu_count(),'affinity':runs[0]['affinity'],'threads':{'OMP_NUM_THREADS':2,'MKL_NUM_THREADS':2,'OPENBLAS_NUM_THREADS':2,'torch_intraop':2,'torch_interop':1},'torch_runtime_version':predictions['C']['torch_runtime_version'],'device':'CPU only; no GPU used','dependencies':{p:importlib.metadata.version(p) for p in ['torch','numpy','Pillow','ImageHash','scipy','PyWavelets','requests','psutil']},'repeats':args.repeats,'thresholds_sha256':frozen_sha,'timing_scope':'Parent wall: complete fresh subprocess, imports + file reads + content hashes + cache validation + model integrity/load when needed + extraction + comparison + JSON output. Model/data downloads excluded. CPU + peak RSS: Linux wait4 resource usage for the complete child, including output serialization.','limitations':['Application cache cleared for first/full runs; OS page cache not cleared.','Shared host; fixed CPU affinity and threads do not isolate other workloads.','Sequential single-image inference; first forward/JIT costs included.','Cold/warm describe application feature cache, not OS cache.','Model loaded lazily only when features are missing.','Incremental run rehashes all files to detect changes; it extracts only new content.','No energy, monetary cost, FLOPs, or GPU measurements.']}
    write(results/'environment.json',env)
    write(results/'experiment-complete.json',{'thresholds_sha256':frozen_sha,'test_pairs':len(predictions['A']['pairs']),'test_files':len(test),'added_files':len(added),'incremental_equal':True,'first_warm_equal':True,'repeated_predictions_equal':True})
    print('Experiment complete.',flush=True)
if __name__=='__main__':main()
