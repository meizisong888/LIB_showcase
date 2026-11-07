#!/usr/bin/env python3
"""Rebuild comparisons and the offline demonstration from preserved evidence."""
import argparse
import csv
import difflib
import hashlib
import html
import json
import re
import shutil
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, value):
    (ROOT / path).write_text(value, encoding='utf-8')

def normalize(text):
    # Punctuation and uncertainty/editorial markers deliberately remain scored.
    return ' '.join(unicodedata.normalize('NFC', text).casefold().split())

def distance(reference, hypothesis):
    """Unit-cost Levenshtein distance; memory proportional to hypothesis length."""
    previous = list(range(len(hypothesis) + 1))
    for i, a in enumerate(reference, 1):
        current = [i]
        for j, b in enumerate(hypothesis, 1):
            current.append(min(current[-1] + 1, previous[j] + 1,
                               previous[j - 1] + (a != b)))
        previous = current
    return previous[-1]

def word_diff(ai, reference):
    left, right = ai.split(), reference.split()
    parts = []
    for op, a, b, c, d in difflib.SequenceMatcher(None, left, right, autojunk=False).get_opcodes():
        if op == 'equal':
            parts.append(html.escape(' '.join(left[a:b])))
        else:
            if op in ('delete', 'replace'):
                parts.append('<del><span class="sr-only">AI only: </span>' + html.escape(' '.join(left[a:b])) + '</del>')
            if op in ('insert', 'replace'):
                parts.append('<ins><span class="sr-only">Reference: </span>' + html.escape(' '.join(right[c:d])) + '</ins>')
    return ' '.join(parts)

def verify_originals():
    manifest = json.loads(read('results/evidence-sha256.json'))
    for path, expected in manifest.items():
        actual = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
        if actual != expected:
            raise ValueError(f'Preserved evidence changed: {path}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--publish-dir', type=Path, help='Copy the static showcase into an existing Pages build')
    args = parser.parse_args()
    verify_originals()
    sources = json.loads(read('data/sources.json'))
    review = json.loads(read('results/review.json'))
    rows, samples, searchable = [], [], []
    for source in sources:
        sid = source['id']
        mapping = json.loads(read(f'data/source-evidence/{sid}-mapping.json'))
        urls = [entry['url'] for entry in mapping['files']]
        assert source['image_url'] in urls and source['reference_url'] in urls
        assert mapping['image_number'] == source['image_number']
        assert Path(source['image_url']).stem == Path(source['reference_url']).stem
        ai = read(f'data/ai-original/{sid}.txt')
        reference = read(f'data/reference/{sid}.txt')
        checked = read(f'data/checked/{sid}.txt')
        assert ai.strip() and reference.strip() and checked.strip()
        norm_ref, norm_ai = normalize(reference), normalize(ai)
        ce = distance(norm_ref, norm_ai)
        we = distance(norm_ref.split(), norm_ai.split())
        row = dict(id=sid,condition=source['label'],reference_characters=len(norm_ref),
                   character_edits=ce,CER=ce/len(norm_ref),reference_words=len(norm_ref.split()),
                   word_edits=we,WER=we/len(norm_ref.split()),
                   uncertainty_markers=len(re.findall(r'\[(?:uncertain:|illegible\])',ai)))
        rows.append(row)
        unified = ''.join(difflib.unified_diff(ai.splitlines(True),reference.splitlines(True),
                          fromfile=f'{sid}: AI original',tofile=f'{sid}: public reference'))
        write(f'results/{sid}-line-diff.txt', unified or 'No differences.\n')
        diff = word_diff(ai, reference)
        write(f'results/{sid}-word-diff.html', '<!doctype html><html lang="en"><meta charset="utf-8">'
              f'<title>Sample {sid}: AI to reference differences</title><h1>Sample {sid}: word differences</h1>'
              '<p>Deletions (struck through) are AI text; insertions (underlined) are reference text. '
              'This is a text comparison, not an adjudication of the handwriting.</p><p>'+diff+'</p></html>')
        samples.append(dict(**source,ai=ai,reference=reference,checked=checked,
                            notes=read(f'data/ai-original/{sid}-notes.txt'),diff=diff,metrics=row,**review[sid]))
        searchable.append(f"SAMPLE {sid} | {source['label']} | {source['page_url']}\n{checked}")
    with (ROOT/'results/comparison.csv').open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    write('results/searchable-text.txt','\n\n'.join(searchable))
    table = '\n'.join(f"| [{r['id']}](data/checked/{r['id']}.txt) | {r['condition']} | {r['reference_words']} | {r['CER']:.2%} ({r['character_edits']}/{r['reference_characters']}) | {r['WER']:.2%} ({r['word_edits']}/{r['reference_words']}) | {r['uncertainty_markers']} |" for r in rows)
    template=read('site/index.template.html')
    cards=[]
    for s in samples:
        e=html.escape
        cards.append(f'''<article class="sample" id="sample-{s['id']}" data-id="{s['id']}">
<header class="sample-header"><div><span class="eyebrow">Sample {s['id']} · {e(s['label'])}</span><h2>{e(s['short_title'])}</h2></div><a href="{e(s['page_url'])}">View original at LOC ↗</a></header>
<p>{e(s['summary'])}</p><p class="source-meta">{e(s['page_description'])} · {e(s['reference_status'])}</p>
<div class="viewer"><figure><a href="{s['image_path']}" target="_blank" rel="noopener"><img src="{s['image_path']}" alt="{e(s['alt'])}" width="{s['width']}" height="{s['height']}" loading="lazy"></a><figcaption>Full LOC scan, image {s['image_number']} (file {s['page_identifier']}). Click to enlarge. <a href="{e(s['image_url'])}">Download from LOC</a> · <a href="{e(s['rights_url'])}">Rights</a>.</figcaption></figure>
<section class="text-panel" aria-label="Sample {s['id']} transcription"><label for="version-{s['id']}">Text version</label><select id="version-{s['id']}" class="version"><option value="checked">Checked against reference · AI prepared</option><option value="ai">AI first pass · unchanged</option><option value="reference">Public reference · By the People</option><option value="diff">AI ↔ reference differences</option></select>
<p class="version-note">Checked against the reference by AI.</p>
<pre class="transcript" tabindex="0">{e(s['checked'])}</pre><div class="diff" hidden></div>
<div class="downloads"><a href="data/ai-original/{s['id']}.txt" download>AI TXT</a><a href="data/reference/{s['id']}.txt" download>Reference TXT</a><a href="data/checked/{s['id']}.txt" download>Checked TXT</a></div></section></div>
<details><summary>Review notes and measured differences</summary><p>CER {s['metrics']['CER']:.2%}; WER {s['metrics']['WER']:.2%}. These measure disagreement with the published reference.</p><ul>{''.join('<li>'+e(x)+'</li>' for x in s['review_notes'])}</ul><p><a href="{e(s['reference_page_url'])}">LOC reference view</a> · <a href="{e(s['reference_url'])}">LOC reference download</a> · <a href="results/{s['id']}-line-diff.txt">Full line diff</a></p><h3>First-pass model notes</h3><pre>{e(s['notes'])}</pre></details></article>''')
    payload=json.dumps(samples,ensure_ascii=False).replace('<','\\u003c')
    for key,value in {'samples':'\n'.join(cards),'data':payload}.items():
        template=template.replace('{{'+key+'}}',value)
    assert '{{' not in template
    write('index.html','\n'.join(line.rstrip() for line in template.splitlines())+'\n')
    readme=read('site/readme.template.md').replace('{{results}}',table)
    for s in samples:
        for key in ['ai','reference','checked']:
            readme=readme.replace('{{'+s['id']+'_'+key+'}}',s[key].rstrip())
    assert '{{' not in readme
    write('README.md','\n'.join(line.rstrip() for line in readme.splitlines())+'\n')
    if args.publish_dir:
        output=args.publish_dir/'library_handwriting';output.mkdir(parents=True,exist_ok=True)
        for name in ['index.html','showcase.css','showcase.js','images','data','results','README.md','staff-guide.md','prompts.md']:
            origin=ROOT/name
            if origin.is_dir():shutil.copytree(origin,output/name,dirs_exist_ok=True)
            else:shutil.copy2(origin,output/name)
    print('Verified 3 image/reference mappings and evidence hashes; rebuilt comparisons, search text, README and HTML.')
    for row in rows:print(f"{row['id']}: CER {row['CER']:.2%}; WER {row['WER']:.2%}")

if __name__=='__main__':main()
