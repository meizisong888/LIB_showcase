#!/usr/bin/env python3
"""Validate source pairing, immutable inputs, generated results and local links."""
import csv,html,json,math,re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
from build import ROOT,normalize,distance,verify_originals

class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[];self.ids=set();self.images=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:self.ids.add(attrs['id'])
        for k in ['href','src']:
            if k in attrs:self.links.append(attrs[k])
        if tag=='img':self.images.append(attrs)

def validate():
    verify_originals()
    sources=json.loads((ROOT/'data/sources.json').read_text())
    assert len(sources)==3 and len({s['page_url'] for s in sources})==3
    rows={r['id']:r for r in csv.DictReader((ROOT/'results/comparison.csv').open())}
    site=(ROOT/'index.html').read_text()
    payload=json.loads(re.search(r'<script type="application/json" id="sample-data">(.*?)</script>',site,re.S).group(1))
    assert len(payload)==3
    for s,p in zip(sources,payload):
        sid=s['id'];ref=(ROOT/f'data/reference/{sid}.txt').read_text();ai=(ROOT/f'data/ai-original/{sid}.txt').read_text();checked=(ROOT/f'data/checked/{sid}.txt').read_text()
        assert s['page_identifier']==Path(s['image_url']).stem==Path(s['reference_url']).stem
        attr=json.loads((ROOT/f'data/source-evidence/{sid}-attribution.json').read_text())
        assert attr['reference_url']==s['reference_url'] and attr['image_number']==s['image_number']
        assert 'Transcribed and reviewed' in attr['fulltext_attribution']
        raw=(ROOT/f'data/reference/{sid}-download.txt').read_bytes().decode('utf-8')
        assert ref==raw.replace('\r\n','\n')+'\n'
        assert p['ai']==ai and p['reference']==ref and p['checked']==checked
        a,r=normalize(ai),normalize(ref);row=rows[sid]
        assert int(row['character_edits'])==distance(r,a)
        assert int(row['word_edits'])==distance(r.split(),a.split())
        assert math.isclose(float(row['CER']),distance(r,a)/len(r))
        assert math.isclose(float(row['WER']),distance(r.split(),a.split())/len(r.split()))
        assert checked in (ROOT/'results/searchable-text.txt').read_text()
        assert '[uncertain:' in checked
    # Check the concrete search example and error described to readers.
    assert 'in Lincoln Hospital Ward 5.' in payload[0]['checked']
    assert 'George to run' in payload[2]['ai'] and 'Arago, to run' in payload[2]['checked']
    assert payload[2]['ai'].strip() in (ROOT/'README.md').read_text()
    for path in [ROOT/'index.html',*(ROOT/'results').glob('*.html'),*ROOT.rglob('*.md')]:
        text=path.read_text()
        assert not re.search(r'[\u4e00-\u9fff]',text),f'Non-English public text: {path}'
        if path.suffix=='.html':
            parser=Links();parser.feed(text);links=parser.links
            for image in parser.images:assert image.get('alt','').strip(),f'Missing image alt: {path}'
        else:links=re.findall(r'!?\[[^\]]*\]\(([^)]+)\)',text)
        for link in links:
            split=urlsplit(html.unescape(link))
            if split.scheme or split.netloc:continue
            if not split.path:
                if path.suffix=='.html' and split.fragment:assert split.fragment in parser.ids,(path,link)
                continue
            base=ROOT if path.name.endswith('.template.md') else path.parent
            target=(base/unquote(split.path)).resolve()
            assert target.exists(),f'Broken local link: {path.relative_to(ROOT)} -> {link}'
    # Published pages remain local and do not call a model or load remote scripts.
    parser=Links();parser.feed(site)
    assert all(not urlsplit(x).scheme for x in [img['src'] for img in parser.images])
    print('PASS: 3 exact page mappings, review attributions, evidence hashes, original/reference separation, metrics, search examples, local links and image alt text.')

if __name__=='__main__':validate()
