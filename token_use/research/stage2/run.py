"""Execute only the locked 80 generation / 20 evaluation cases, with resume checks."""
from pathlib import Path
import argparse
import fcntl
import hashlib
import json
import sys

import transport

ROOT=Path(__file__).resolve().parent
RESEARCH=ROOT.parent

def sha(data):return hashlib.sha256(data).hexdigest()
def read(path):return json.loads(path.read_text())
def write(path,value):path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def frozen():
    lock=read(ROOT/'design-lock.json')
    for name,digest in lock['files'].items():
        if sha((RESEARCH/name).read_bytes())!=digest:raise ValueError(f'Frozen stage-two file changed: {name}')
    return read(ROOT/'settings.json')

def generation():
    rows=[json.loads(l) for l in (RESEARCH/'outputs/pilot-requests.jsonl').read_text().splitlines()]
    assert [r['request_id'] for r in rows]==read(ROOT/'generation-order.json')['request_ids']
    for r in rows:assert sha(r['prompt'].encode())==r['prompt_sha256']
    return rows

def evaluation():
    source=read(RESEARCH/'data/loc-sample.json')
    refs=read(ROOT/'reference-facts.json')['records'];key=read(ROOT/'blind-key.json')['records']
    rows=[]
    for ref in refs:
        record_key=ref['record_key'];candidates=[]
        for label,condition in key[record_key].items():
            request_id=f'{record_key}--{condition}'
            attempts=sorted((ROOT/'runs/generation'/request_id).glob('attempt-*'))
            if not attempts:raise ValueError('Complete generation attempts before evaluation')
            last=attempts[-1]
            status=read(last/'status.json')
            response=(last/'response.txt').read_text() if (last/'response.txt').exists() else ''
            candidates.append({'label':label,'answer':response})
        body={'source_record':source[int(record_key[4:])-1],
              'reference_facts_human_confirmed':False,'reference_facts':ref['facts'],
              'candidates':candidates}
        prompt=(ROOT/'evaluation-prompt.txt').read_text()+json.dumps(body,ensure_ascii=False,indent=2)+'\n'
        rows.append({'request_id':record_key,'record_key':record_key,'prompt':prompt,'prompt_sha256':sha(prompt.encode())})
    return rows

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('mode',choices=['generate','evaluate'])
    p.add_argument('--limit',type=int,help='Max new attempts this invocation, without changing the locked schedule')
    args=p.parse_args();policy=frozen()
    folder='generation' if args.mode=='generate' else 'evaluation'
    rows=generation() if args.mode=='generate' else evaluation()
    root=ROOT/'runs'/folder;root.mkdir(parents=True,exist_ok=True)
    # Prevent concurrent invocations from duplicating calls; lock is ignored by git.
    lockfile=(RESEARCH/'outputs/stage2.lock').open('a')
    fcntl.flock(lockfile,fcntl.LOCK_EX|fcntl.LOCK_NB)
    launched=0
    for r in rows:
        path=root/r['request_id'];previous=sorted(path.glob('attempt-*'))
        for old in previous:
            assert (old/'prompt.txt').read_text()==r['prompt']
            if not (old/'status.json').exists():raise RuntimeError(f'Unresolved started attempt; do not repeat automatically: {old}')
        if previous:
            last=read(previous[-1]/'status.json')
            # A completed backend turn is final even when JSON, refusal or text fails checks.
            if last['status']=='completed':continue
            if folder=='evaluation':continue
            retry_count=sum(max(0,len(list(q.glob('attempt-*')))-1) for q in root.iterdir() if q.is_dir())
            if last['status']!='transport_error':raise RuntimeError(f'Terminal/uncertain status requires inspection: {r["request_id"]}: {last["status"]}')
            if len(previous)>=2 or retry_count>=policy['max_extra_generation_retries']:continue
        if args.limit is not None and launched>=args.limit:break
        if folder=='evaluation' and len(list(root.glob('*/attempt-*')))>=policy['max_evaluation_calls']:break
        dest=path/f'attempt-{len(previous)+1:02d}'
        print('Starting',folder,r['request_id'],dest.name,flush=True)
        result=transport.run(policy,r['prompt'],dest,evaluation=folder=='evaluation')
        write(dest/'request.json',{k:v for k,v in r.items() if k!='prompt'})
        print('Finished',r['request_id'],result['status'],result['usage'],flush=True)
        launched+=int(result['launched'])
        if result['status'] not in ('completed','transport_error'):
            raise RuntimeError(f'Stopped on {result["status"]}; no further calls started')
    print('Invocation finished; new model launches:',launched,flush=True)

if __name__=='__main__':main()
