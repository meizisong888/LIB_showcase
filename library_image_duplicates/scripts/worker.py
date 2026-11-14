"""Fresh process per measured run; parent measures complete process wall time."""
import time
START=time.perf_counter()
import os
for name in ['OMP_NUM_THREADS','MKL_NUM_THREADS','OPENBLAS_NUM_THREADS','NUMEXPR_NUM_THREADS']: os.environ[name]='2'
import argparse, resource
from common import ROOT, read, write
from engine import detect
parser=argparse.ArgumentParser();parser.add_argument('--job',required=True);args=parser.parse_args();job=read(args.job)
if hasattr(os,'sched_setaffinity'):
    allowed=sorted(os.sched_getaffinity(0));os.sched_setaffinity(0,set(job.get('affinity',allowed[:2])))
result=detect(job['files'],job['method'],job['cache'],job['thresholds'])
usage=resource.getrusage(resource.RUSAGE_SELF)
result['worker_wall_s']=time.perf_counter()-START
result['cpu_s']=usage.ru_utime+usage.ru_stime
result['peak_rss_mib']=usage.ru_maxrss/1024
result['affinity']=sorted(os.sched_getaffinity(0)) if hasattr(os,'sched_getaffinity') else None
write(job['output'],result)
