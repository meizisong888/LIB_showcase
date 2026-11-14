"""Build source evidence from fresh Highsmith metadata and existing repository LOC snapshots.
The committed sources.json is the reproducible selection; prepare.py needs no catalog search.
"""
import hashlib,json,re,time
from pathlib import Path
import requests
from PIL import Image,ImageDraw
from common import ROOT,read,write,digest
REPO=ROOT.parent
ORDER=['2010630676','2010630677','2010630765','2020720205','2011631173','2018701036','2011636061','2010630616','2017882041','2010630408','2018663548']
def main():
    if (ROOT/'data/sources.json').exists():
        raise SystemExit('Frozen sources.json already exists. Use prepare.py to reproduce; discovery does not overwrite it.')
    started=time.perf_counter();rows=[]
    for pid in ORDER:
        raw=read(ROOT/'data/metadata'/f'{pid}.json');it=raw['item'];res=raw['resources'][0]
        rows.append(dict(identity=pid,source_page=raw['links']['html'],metadata_url=raw['links']['json'],download_url=res['large'].replace('https://cdn.loc.gov/service/','https://tile.loc.gov/storage-services/service/'),title=it['title'],collection_title=raw['collection']['title'],creator=it['creators'],rights_statement=it['rights_information'],rights_url=raw['collection']['rights'],resource_id=res['id'],metadata_provenance='Fetched 2026-11-14 from LOC Pictures API; full response saved.'))
    snapshot=REPO/'token_use/data/public-loc/records.jsonl'
    for line in snapshot.read_text().splitlines():
        it=json.loads(line);pid=it['id'];write(ROOT/'data/metadata'/f'{pid}.json',it)
        rows.append(dict(identity=pid,source_page=it['link'],metadata_url=it['link']+'?fo=json',download_url=it['service_medium'].replace('r.jpg','v.jpg'),title=it['title'],collection_title=it['part_of'],creator=it['creators'],rights_statement=it['rights_information'],rights_url='https://www.loc.gov/collections/fsa-owi-color-photographs/about-this-collection/rights-and-access/',resource_id=it['digital_id'][0],metadata_provenance='Unchanged LOC item snapshot in token_use/data/public-loc/records.jsonl, acquired 2026-10-04; catalog API limited requests during this experiment.'))
    snapshot2=REPO/'token_use/research/data/loc-sample.json';sample=read(snapshot2)
    for index in [0,1,4,9,10,14,15,21,24]:
        it=sample[index];pid=it['Lccn'];write(ROOT/'data/metadata'/f'{pid}.json',it)
        rights='\n'.join(it['Rights']);urls=re.findall(r'https?://[^\s<>\"]+',rights)
        download=next((u.split('#')[0] for u in it['Preview_url'] if 'v.jpg' in u),next(u.split('#')[0] for u in it['Preview_url'] if 'r.jpg' in u))
        rows.append(dict(identity=pid,source_page=it['Id'].replace('http:','https:'),metadata_url=it['Id'].replace('http:','https:')+'?fo=json',download_url=download,title=it['Title'],collection_title='; '.join(it['Source_collection']),creator=it.get('Creators'),rights_statement=rights,rights_url=urls[0] if urls else it['Id'].replace('http:','https:'),resource_id=download,metadata_provenance=f'Existing LOC snapshot token_use/research/data/loc-sample.json, index {index}; exact record copied. Parent snapshot hash retained in collection-preparation.json.'))
    assert len(rows)==32 and len(set(x['identity'] for x in rows))==32
    for i,s in enumerate(rows):
        assert 'No known restrictions' in s['rights_statement'] or 'public domain' in s['rights_statement'].lower()
        t=time.perf_counter();r=requests.get(s['download_url'],timeout=45);r.raise_for_status()
        s.update(download_utc=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),download_seconds=time.perf_counter()-t,sha256=digest(r.content),bytes=len(r.content),role='base' if i<30 else 'incremental_new')
        path=ROOT/'work/originals'/f"{s['identity']}.jpg";path.write_bytes(r.content)
        with Image.open(path) as im: s['size']=list(im.size)
        print(i+1,s['identity'],s['title'][:60],flush=True)
    write(ROOT/'data/sources.json',rows)
    write(ROOT/'data/collection-preparation.json',{'wall_seconds_successful_manifest_download':time.perf_counter()-started,'source_snapshots':{str(p.relative_to(REPO)):digest(p.read_bytes()) for p in [snapshot,snapshot2]},'selection':'11 fresh Highsmith items (two deliberately paired memorial views), 12 existing FSA/OWI color records, 9 photographic records from existing 100-record LOC snapshot. First 30 base; final 2 new independent increment files. Convenience sample, not random or representative.','acquisition_limit':'LOC catalog API returned HTTP 429 after 11 successful records. Retained original responses and used already saved official item metadata for remaining records; image download endpoints succeeded. API search retry time excluded from detection.','metadata_note':'Original metadata acquisition dates differ from image download dates. Per-record provenance is explicit.'})
    canvas=Image.new('RGB',(1000,8*190),'#eee');draw=ImageDraw.Draw(canvas)
    for i,s in enumerate(rows):
        im=Image.open(ROOT/'work/originals'/f"{s['identity']}.jpg");im.thumbnail((245,155));x=(i%4)*250;y=(i//4)*190;canvas.paste(im,(x,y));draw.text((x+4,y+156),f"{i+1}: {s['identity']}",fill='black')
    canvas.save(ROOT/'work/contact-sheet.jpg')
if __name__=='__main__':main()
