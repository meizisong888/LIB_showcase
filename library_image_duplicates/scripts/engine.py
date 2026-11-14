"""Read-only pair screening: SHA-256+bytes, standard pHash, SSCD, or exact reuse+SSCD."""
import hashlib, importlib.metadata, io, itertools, time
from collections import defaultdict
from contextlib import contextmanager
from pathlib import Path
from common import ROOT, canonical, digest, read, write
ALGORITHM_VERSION='1.0.0'
PREPROCESS={'color':'EXIF transpose then RGB','resize':[320,320],'interpolation':'Pillow BILINEAR','aspect_ratio':'direct square resize, no crop','scale':1/255,'mean':[.485,.456,.406],'std':[.229,.224,.225],'output':'L2 normalize float32; cosine dot product rounded to 8 decimals'}

def configuration(method):
    versions={k:importlib.metadata.version(k) for k in ['Pillow','numpy','ImageHash','scipy','torch']}
    return {'algorithm_version':ALGORITHM_VERSION,'method':method,'phash':{'hash_size':8,'highfreq_factor':4},'model':read(ROOT/'data/model.json')['sha256'],'preprocessing':PREPROCESS,'dependencies':versions,'device':'cpu','torch_threads':2,'interop_threads':1,'batch_size':1}

def cache_key(content_hash, config, file_id=None):
    # C intentionally caches each file separately; D shares only byte-verified representatives.
    return digest(canonical({'content_sha256':content_hash,'configuration':config,'file_scope':file_id}))

@contextmanager
def measured(stats,stage):
    start=time.perf_counter()
    try: yield
    finally: stats[stage]+=time.perf_counter()-start

def detect(files,method,cache,thresholds):
    config=configuration(method);stages=defaultdict(float);cache=Path(cache);cache.mkdir(parents=True,exist_ok=True)
    counters={'files':len(files),'files_read':0,'files_decoded':0,'sha256_computations':0,'phash_computations':0,'ai_extractions':0,'cache_hits':0,'exact_reuses':0,'byte_comparisons':0}
    raw={};hashes={};rep={};buckets=defaultdict(list)
    for f in files:
        fid=f['id']
        with measured(stages,'file_read_s'): raw[fid]=Path(f['path']).read_bytes();counters['files_read']+=1
        with measured(stages,'content_hash_s'): hashes[fid]=digest(raw[fid]);counters['sha256_computations']+=1
        rep[fid]=fid
        if method in ['A','D']:
            with measured(stages,'byte_verify_s'):
                for other in buckets[hashes[fid]]:
                    counters['byte_comparisons']+=1
                    if raw[fid]==raw[other]: rep[fid]=other;counters['exact_reuses']+=1;break
                else: buckets[hashes[fid]].append(fid)
    values={};pending=[];cache_paths={}
    targets=[f['id'] for f in files if method!='D' or rep[f['id']]==f['id']]
    if method!='A':
        with measured(stages,'cache_read_s'):
            import numpy as np
            for fid in targets:
                key=cache_key(hashes[fid],config,None if method=='D' else fid)
                cp=cache/f'{key}.npy';cache_paths[fid]=cp
                if cp.exists():
                    v=np.load(cp,allow_pickle=False)
                    expected=(64,) if method=='B' else (512,)
                    if v.shape!=expected or not np.isfinite(v).all(): raise ValueError(f'Invalid cached feature: {cp}')
                    values[fid]=v;counters['cache_hits']+=1
                else: pending.append(fid)
        if pending:
            with measured(stages,'image_library_import_s'):
                from PIL import Image,ImageOps
            if method=='B':
                with measured(stages,'phash_library_import_s'): import imagehash
            else:
                with measured(stages,'model_integrity_s'):
                    model_path=ROOT/'models/sscd_disc_mixup.torchscript.pt'
                    assert digest(model_path.read_bytes())==config['model'],'Model weight checksum mismatch'
                with measured(stages,'torch_import_s'): import torch
                with measured(stages,'model_load_s'):
                    torch.set_num_threads(2);torch.set_num_interop_threads(1)
                    torch.use_deterministic_algorithms(True)
                    model=torch.jit.load(str(model_path),map_location='cpu').eval()
                    mean=np.array(PREPROCESS['mean'],dtype=np.float32)[None,None,:]
                    std=np.array(PREPROCESS['std'],dtype=np.float32)[None,None,:]
            for fid in pending:
                with measured(stages,'decode_s'):
                    with Image.open(io.BytesIO(raw[fid])) as src: im=ImageOps.exif_transpose(src).convert('RGB')
                    counters['files_decoded']+=1
                if method=='B':
                    with measured(stages,'phash_s'):
                        v=imagehash.phash(im,hash_size=8,highfreq_factor=4).hash.reshape(-1)
                        counters['phash_computations']+=1
                else:
                    with measured(stages,'preprocess_s'):
                        im=im.resize((320,320),Image.Resampling.BILINEAR)
                        arr=(np.asarray(im,dtype=np.float32)/255-mean)/std
                        tensor=torch.from_numpy(arr.transpose(2,0,1).copy()).unsqueeze(0)
                    with measured(stages,'feature_extract_s'):
                        with torch.inference_mode(): v=model(tensor)[0].numpy().copy()
                        v=v/np.linalg.norm(v);counters['ai_extractions']+=1
                values[fid]=v
                with measured(stages,'cache_write_s'):
                    tmp=cache_paths[fid].with_suffix('.tmp')
                    with tmp.open('wb') as handle: np.save(handle,v,allow_pickle=False)
                    tmp.replace(cache_paths[fid])
    pairs=[]
    with measured(stages,'compare_s'):
        # Expand representative scores to every original unordered file pair. No transitive closure.
        representative_scores={}
        for a,b in itertools.combinations([f['id'] for f in files],2):
            exact=rep[a]==rep[b] if method in ['A','D'] else None
            if method=='A': score=int(exact);candidate=exact
            elif method=='B': score=int(np.count_nonzero(values[a]!=values[b]));candidate=score<=thresholds['phash_max_distance']
            else:
                ra,rb=(rep[a],rep[b]) if method=='D' else (a,b)
                key=tuple(sorted((ra,rb)))
                if key not in representative_scores:
                    representative_scores[key]=1.0 if ra==rb else round(float(np.dot(values[ra],values[rb])),8)
                score=representative_scores[key]
                candidate=bool(exact) or score>=thresholds['ai_min_cosine']
            pairs.append({'a':a,'b':b,'score':score,'candidate':bool(candidate),'exact_verified':bool(exact)})
        counters['ai_vector_comparisons']=sum(a!=b for a,b in representative_scores)
        counters['ai_score_pairs_including_exact_groups']=len(representative_scores)
    # Report zeros explicitly for unused stages.
    for s in ['file_read_s','content_hash_s','byte_verify_s','cache_read_s','image_library_import_s','phash_library_import_s','torch_import_s','model_integrity_s','model_load_s','decode_s','phash_s','preprocess_s','feature_extract_s','cache_write_s','compare_s']: stages[s]+=0
    return {'method':method,'configuration':config,'thresholds':thresholds,'files':[{'id':f['id'],'sha256':hashes[f['id']]} for f in files],'representatives':rep if method in ['A','D'] else None,'pairs':pairs,'counters':counters,'stages':dict(stages),'torch_runtime_version':str(torch.__version__) if method in ['C','D'] and pending else None}
