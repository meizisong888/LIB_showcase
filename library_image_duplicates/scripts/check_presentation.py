"""Check the staff-facing text against existing evidence, without model inference."""
import re
import statistics
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from common import ROOT, read

class Presentation(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.cases=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        for key in ['href','src']:
            if attrs.get(key): self.links.append(attrs[key])
        if tag=='article' and 'data-a' in attrs: self.cases.append(attrs)

def check_presentation():
    text=(ROOT/'README.md').read_text()
    visible=re.sub(r'<[^>]+>', ' ', text)
    visible=re.sub(r'\]\([^)]+\)', ']', visible)
    words=len(re.findall(r"\b[\w]+(?:[-'][\w]+)*\b", visible))
    assert 600 <= words <= 1000, words
    expected=['Overview','What the tool does','How it works','Example outputs','Results','Tools used','Conclusion','Try it / Further details','References']
    assert re.findall(r'^## (.+)$',text,re.M)==expected
    assert text.startswith('# Finding Duplicate Images in Library Collections\n')
    first=text.split('## Overview',1)[0]
    assert first.count('<img ')==2 and '[Open the image showcase]' in first
    assert len(re.findall(r'^### [123]\. ',text,re.M))==3
    metrics=read(ROOT/'results/metrics.json');runs=read(ROOT/'results/benchmark-runs.json');inc=read(ROOT/'results/incremental-runs.json')
    labels={'A':'File hash','B':'pHash','C':'SSCD','D':'Exact-copy reuse + SSCD'}
    for method,name in labels.items():
        m=metrics[method]
        assert f'| {name} | {m["tp"]} | {m["fp"]} | {m["fn"]} |' in text
    first_times=[statistics.median(x['process_wall_s'] for x in runs if x['method']==m and x['mode']=='first') for m in ['C','D']]
    added_times=[statistics.median(x['process_wall_s'] for x in inc if x['mode']==mode) for mode in ['full','reuse']]
    for a,b in [first_times,added_times]: assert f'| {a:.2f} s | {b:.2f} s |' in text
    manifest=read(ROOT/'data/manifest.json');files=manifest['files']
    assert len({f['identity'] for f in files if f['split']!='incremental'})==30
    assert len([f for f in files if f['split']=='test'])==108
    assert len([f for f in files if f['split'] in ['test','incremental']])==113
    assert all(m['tp']+m['fn']==270 for m in metrics.values())
    html=(ROOT/'index.html').read_text();parser=Presentation();parser.feed(html)
    assert len(parser.cases)==3
    predictions={m:{frozenset((p['a'],p['b'])):p for p in read(ROOT/f'results/predictions/test-{m}.json')['pairs']} for m in 'ABCD'}
    for case in parser.cases:
        key=frozenset((case['data-a'],case['data-b']))
        found=''.join(m for m in 'ABCD' if predictions[m][key]['candidate'])
        assert case['data-selected']==found
        assert all(fid in text for fid in key)
    # Every local document/image link, including paths inside GitHub documentation URLs.
    pages=[ROOT/'index.html', ROOT/'README.md', *sorted((ROOT/'docs').glob('*.md'))]
    assert len(pages)==6
    for page in pages:
        content=page.read_text();p=Presentation();p.feed(content)
        targets=p.links+re.findall(r'\]\(([^)]+)\)',content)
        for target in targets:
            url=urlsplit(target)
            github_prefix='/meizisong888/LIB_showcase/blob/main/library_image_duplicates/'
            if url.netloc=='github.com' and url.path.startswith(github_prefix):
                dest=ROOT/unquote(url.path[len(github_prefix):])
            elif url.scheme or url.netloc or not url.path:
                continue
            else:
                dest=page.parent/unquote(url.path)
            assert dest.resolve().is_relative_to(ROOT)
            assert dest.exists(), f'{page.name}: missing {target}'
    # All illustrated source URLs must be preserved actual source records.
    source_urls={s['source_page'] for s in read(ROOT/'data/sources.json')}
    for url in re.findall(r'\[Source photograph\]\(([^)]+)\)', text): assert url in source_urls
    return {'readme_words':words,'real_examples':3,'numeric_tables_match_saved_results':True,'document_links_valid':True}

if __name__=='__main__': print(check_presentation())
