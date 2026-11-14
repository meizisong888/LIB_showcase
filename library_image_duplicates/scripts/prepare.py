"""Download exact public source bytes, verify them, and construct real variants."""
import argparse, math, random, shutil, time
from pathlib import Path
import requests
from PIL import Image, ImageOps
from common import ROOT, read, write, digest
SEED=20261114

def download(url,path,expected):
    if path.exists():
        assert digest(path.read_bytes())==expected, f'Checksum mismatch: {path}'
        return False
    r=requests.get(url,timeout=90); r.raise_for_status()
    assert digest(r.content)==expected, f'Source changed: {url}'
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(r.content);return True

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--model-only',action='store_true');args=parser.parse_args()
    start=time.perf_counter();m=read(ROOT/'data/model.json')
    fetched=download(m['url'],ROOT/'models/sscd_disc_mixup.torchscript.pt',m['sha256'])
    if args.model_only: print('Model verified');return
    sources=read(ROOT/'data/sources.json');downloads=0
    for s in sources: downloads+=download(s['download_url'],ROOT/'work/originals'/f"{s['identity']}.jpg",s['sha256'])
    download_seconds=time.perf_counter()-start;start=time.perf_counter()
    base=[s for s in sources if s['role']=='base'];ids=[s['identity'] for s in base]
    # Keep each deliberately selected hard-negative pair in one partition.
    factory=['2017877451','2017877452','2017877454'];creek=['2017877477','2017877478']
    remaining=[i for i in ids[4:] if i not in factory+creek];random.Random(SEED).shuffle(remaining)
    calibration=set(ids[:2]+factory+remaining[:7]);test=set(ids[2:4]+creek+remaining[7:])
    rng=random.Random(SEED);records=[]
    folder=ROOT/'work/files';folder.mkdir(exist_ok=True)
    def save(identity,variant,im=None,copy=None,params=None,split=None):
        filename=f'{identity}__{variant}.jpg';path=folder/filename
        if copy: shutil.copyfile(copy,path)
        else: im.save(path,'JPEG',quality=(params or {}).get('jpeg_quality',92),subsampling=0)
        with Image.open(path) as pic: size=list(pic.size)
        records.append(dict(id=filename,identity=identity,variant=variant,split=split or ('calibration' if identity in calibration else 'test'),path=f'work/files/{filename}',sha256=digest(path.read_bytes()),bytes=path.stat().st_size,size=size,parameters=params or {}))
    for s in base:
        pid=s['identity'];path=ROOT/'work/originals'/f'{pid}.jpg'
        with Image.open(path) as src: im=ImageOps.exif_transpose(src).convert('RGB')
        w,h=im.size;cw,ch=round(w*math.sqrt(.75)),round(h*math.sqrt(.75));x=rng.randint(0,w-cw);y=rng.randint(0,h-ch);box=[x,y,x+cw,y+ch];crop=im.crop(box)
        save(pid,'original',copy=path,params={'operation':'unaltered downloaded LOC large JPEG'})
        save(pid,'copy',copy=path,params={'operation':'byte-for-byte copy; filename changed'})
        size=[max(1,round(w*.4)),max(1,round(h*.4))]
        save(pid,'resize',im.resize(size,Image.Resampling.LANCZOS),params={'scale':.4,'size':size,'resample':'LANCZOS','jpeg_quality':92})
        save(pid,'compressed',im,params={'jpeg_quality':18,'subsampling':0})
        cp={'box':box,'retained_area':cw*ch/(w*h),'jpeg_quality':92}
        save(pid,'crop',crop,params=cp)
        save(pid,'crop_upscale',crop.resize((w,h),Image.Resampling.LANCZOS),params={**cp,'output_size':[w,h],'resample':'LANCZOS'})
    for i,pid in enumerate(sorted(test)[:3]):
        path=ROOT/'work/originals'/f'{pid}.jpg';im=Image.open(path).convert('RGB');w,h=im.size
        if i==0: save(pid,'added_copy',copy=path,split='incremental',params={'operation':'byte-for-byte copy'})
        if i==1: save(pid,'added_resize',im.resize((round(w*.6),round(h*.6)),Image.Resampling.LANCZOS),split='incremental',params={'scale':.6,'jpeg_quality':92,'resample':'LANCZOS'})
        if i==2:
            box=[0,0,round(w*.8),round(h*.8)];save(pid,'added_crop',im.crop(box),split='incremental',params={'box':box,'jpeg_quality':92})
    for s in sources:
        if s['role']=='incremental_new': save(s['identity'],'new_original',copy=ROOT/'work/originals'/f"{s['identity']}.jpg",split='incremental',params={'operation':'new independent LOC photograph'})
    manifest={'seed':SEED,'construction':'real collection photographs + synthetic variants','calibration_identities':sorted(calibration),'test_identities':sorted(test),'files':records}
    old=ROOT/'data/manifest.json'
    if old.exists(): assert read(old)==manifest,'Transform reproduction differs from frozen manifest; check Pillow and dependencies.'
    else: write(old,manifest)
    write(ROOT/'work/preparation-latest.json',{'download_seconds':download_seconds,'transformation_seconds':time.perf_counter()-start,'downloaded_images':downloads,'downloaded_model':fetched,'files':len(records)})
    print(f'Verified and prepared {len(records)} files; {len(calibration)} calibration / {len(test)} test identities.')
if __name__=='__main__': main()
