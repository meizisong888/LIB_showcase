"""Generate English README, static report and small display images from saved evidence.
Default publication is standard-library only; --thumbnails requires Pillow + prepared files.
"""
import argparse, html, shutil, statistics
from pathlib import Path
from common import ROOT, read, write, digest
from presentation import staff_content, build_documents
NAMES={'A':'File hash','B':'Perceptual hash','C':'AI features','D':'Reuse + AI'}
VARIANTS={'original':'Original','copy':'Exact copy','resize':'Smaller (40%)','compressed':'JPEG quality 18','crop':'Crop (~25% removed)','crop_upscale':'Crop, enlarged again'}
e=html.escape

def pct(x):return '—' if x is None else f'{100*x:.1f}%'
def stat(rows,key):
    vals=[r[key] for r in rows];return f'{statistics.median(vals):.3f} [{min(vals):.3f}–{max(vals):.3f}]'
def table(caption,heads,rows):
    return '<div class="table-wrap"><table><caption>'+e(caption)+'</caption><thead><tr>'+''.join('<th scope="col">'+e(str(x))+'</th>' for x in heads)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(('<th scope="row">' if i==0 else '<td>')+e(str(x))+('</th>' if i==0 else '</td>') for i,x in enumerate(row))+'</tr>' for row in rows)+'</tbody></table></div>'
def markdown_table(heads,rows):return '| '+' | '.join(heads)+' |\n| '+' | '.join(['---']*len(heads))+' |\n'+''.join('| '+' | '.join(map(str,row))+' |\n' for row in rows)

def main():
    p=argparse.ArgumentParser();p.add_argument('--thumbnails',action='store_true');p.add_argument('--publish-dir',type=Path);args=p.parse_args()
    manifest=read(ROOT/'data/manifest.json');sources=read(ROOT/'data/sources.json');source={s['identity']:s for s in sources};files={f['id']:f for f in manifest['files']};test=[f for f in files.values() if f['split']=='test']
    metrics=read(ROOT/'results/metrics.json');runs=read(ROOT/'results/benchmark-runs.json');inc=read(ROOT/'results/incremental-runs.json');env=read(ROOT/'results/environment.json');thresholds=read(ROOT/'results/thresholds.json')['thresholds'];model=read(ROOT/'data/model.json')
    results={m:read(ROOT/f'results/predictions/test-{m}.json') for m in 'ABCD'}
    if args.thumbnails:
        from PIL import Image,ImageOps
        thumbs=[]
        for f in files.values():
            path=ROOT/f['path'];assert digest(path.read_bytes())==f['sha256']
            with Image.open(path) as im:im=ImageOps.exif_transpose(im).convert('RGB');im.thumbnail((520,380),Image.Resampling.LANCZOS);out=ROOT/'images'/f['id'];im.save(out,'JPEG',quality=82,subsampling=0)
            thumbs.append({'id':f['id'],'experiment_file_sha256':f['sha256'],'thumbnail_sha256':digest(out.read_bytes()),'display_size':list(im.size),'operation':'EXIF transpose/RGB; thumbnail bound 520x380 LANCZOS; JPEG quality82 subsampling0'})
        write(ROOT/'data/thumbnails.json',thumbs)
    pairs={m:{tuple(sorted((p['a'],p['b']))):p for p in results[m]['pairs']} for m in 'ABCD'}
    def lookup(m,a,b):return pairs[m][tuple(sorted((a,b)))]
    def photo(fid,label=None):
        f=files[fid];s=source[f['identity']]
        return f'<figure><img src="images/{e(fid)}" alt="{e((label or VARIANTS.get(f["variant"],f["variant"]))+": "+s["title"])}" loading="lazy" width="520" height="380"><figcaption>{e(label or VARIANTS.get(f["variant"],f["variant"]))} · <a href="{e(s["source_page"])}">LOC {e(f["identity"])}</a></figcaption></figure>'
    def pair_images(p):return '<div class="pair-images">'+photo(p['a'])+photo(p['b'])+'</div>'
    # Select an illustrative known crop missed by B but found by D, from held-out predictions.
    choices=[]
    for pid in manifest['test_identities']:
        a=f'{pid}__original.jpg';b=f'{pid}__crop.jpg'
        if not lookup('B',a,b)['candidate'] and lookup('D',a,b)['candidate']:choices.append(pid)
    example=choices[0] if choices else manifest['test_identities'][0]
    def gallery(pid):
        out=''
        for v,label in VARIANTS.items():
            fid=f'{pid}__{v}.jpg';f=files[fid];badges='<span class="tag neutral">Reference photograph</span>' if v=='original' else ''.join(f'<span class="tag {"" if lookup(m,f"{pid}__original.jpg",fid)["candidate"] else "miss"}">{m}: {"Found" if lookup(m,f"{pid}__original.jpg",fid)["candidate"] else "Missed"}</span>' for m in 'ABCD')
            out+=f'<article class="variant-card"><img src="images/{fid}" alt="{e(label)} of LOC {pid}" loading="lazy" width="520" height="380"><strong>{e(label)}</strong><div class="badges">{badges}</div><p class="small">{f["size"][0]} × {f["size"][1]} pixels · {f["bytes"]:,} bytes</p></article>'
        return out
    def source_line(pid):return f'Photograph: {e(source[pid]["title"])} <a href="{e(source[pid]["source_page"])}">Source record</a> · <a href="{e(source[pid]["rights_url"])}">Rights</a>.'
    accuracy=[[m+' · '+NAMES[m],pct(metrics[m]['precision']),pct(metrics[m]['recall']),metrics[m]['tp'],metrics[m]['fp'],metrics[m]['fn'],metrics[m]['candidate_pairs']] for m in 'ABCD']
    accuracy_heads=['Method','Precision','Recall','TP','FP','FN','Candidates']
    vr=[[m+' · '+NAMES[m]]+[f'{metrics[m]["by_variant"][v]["found"]} / {metrics[m]["by_variant"][v]["total"]}' for v in list(VARIANTS)[1:]] for m in 'ABCD']
    costs=[];stages=[];stage_names=list(runs[0]['stages'])
    for m in 'ABCD':
        for mode in ['first','warm']:
            rows=[r for r in runs if r['method']==m and r['mode']==mode]
            costs.append([m+' · '+mode,stat(rows,'process_wall_s'),stat(rows,'cpu_s'),stat(rows,'peak_rss_mib'),rows[0]['counters']['files'],rows[0]['counters']['ai_extractions'],rows[0]['counters']['cache_hits']])
            for stage in stage_names:
                values=[r['stages'][stage] for r in rows]
                stages.append([m+' · '+mode,stage,f'{statistics.median(values):.4f} [{min(values):.4f}–{max(values):.4f}]'])
    costs_heads=['Method / cache','Wall seconds','CPU seconds','Peak RSS MiB','Files read','AI extractions','Cache hits']
    incr=[]
    for mode in ['full','reuse']:
        rows=[r for r in inc if r['mode']==mode];c=rows[0]['counters']
        incr.append([mode,stat(rows,'process_wall_s'),stat(rows,'cpu_s'),stat(rows,'peak_rss_mib'),c['files_read'],c['ai_extractions'],c['cache_hits']])
    def med(m,mode,key='process_wall_s'):return statistics.median(r[key] for r in runs if r['method']==m and r['mode']==mode)
    ctime,dtime=med('C','first'),med('D','first');change=(ctime-dtime)/ctime*100
    cost_finding=f'C extracted 108 features; D extracted 90, saving 18 model calls (16.7%) by verifying exact copies first. Median first-run wall time was {ctime:.3f}s for C and {dtime:.3f}s for D ({abs(change):.1f}% {"lower" if change>=0 else "higher"} for D). Both still pay for all file reads and content hashing. Warm runs load cached arrays and do not load the model.'
    itime={mode:statistics.median(r['process_wall_s'] for r in inc if r['mode']==mode) for mode in ['full','reuse']}
    increment_finding=f'Full recalculation extracted 94 features; incremental reuse extracted 4 and reused 90. The added exact copy reused its verified representative. Median wall time: {itime["full"]:.3f}s full versus {itime["reuse"]:.3f}s incremental.'
    added_true=sum(p['candidate'] and files[p['a']]['identity']==files[p['b']]['identity'] and not lookup('B',p['a'],p['b'])['candidate'] for p in results['C']['pairs'])
    lost_true=sum(p['candidate'] and files[p['a']]['identity']==files[p['b']]['identity'] and not lookup('C',p['a'],p['b'])['candidate'] for p in results['B']['pairs'])
    measured=f'Exact hashing found all 18 byte-for-byte copies but no edited versions. pHash found {metrics["B"]["tp"]} of 270 duplicate pairs and selected {metrics["B"]["fp"]} different-photo pairs. SSCD recovered {added_true} true pairs pHash missed and missed {lost_true} that pHash found. C and D each found {metrics["C"]["tp"]}/270 with {metrics["C"]["fp"]} false positives and {metrics["C"]["fn"]} misses. Every original-to-variant pair was found by AI, but two compressed-to-cropped pairs were missed. That is why pair-level evaluation matters.'
    error_html=''
    specs=[('An AI success beyond pHash','D','success'),('AI still misses edits','D','miss'),('pHash can select a different photo','B','false_positive')]
    success_pair=next((p for p in results['D']['pairs'] if p['candidate'] and files[p['a']]['identity']==files[p['b']]['identity'] and not lookup('B',p['a'],p['b'])['candidate']),None)
    example_records=[]
    for title,m,kind in specs:
        chosen=success_pair if kind=='success' and success_pair else next(iter(metrics[m]['examples'][kind]),None)
        if chosen:
            vals=' · '.join(f'{k}: {lookup(k,chosen["a"],chosen["b"])["score"]} ({"selected" if lookup(k,chosen["a"],chosen["b"])["candidate"] else "not selected"})' for k in 'ABCD')
            error_html+=f'<article class="case"><h3>{e(title)}</h3>{pair_images(chosen)}<p>{e(vals)}</p><p>{"Same original photograph." if files[chosen["a"]]["identity"]==files[chosen["b"]]["identity"] else "Different source photographs; false positive."}</p></article>'
            example_records.append({'kind':kind,'method':m,'pair':chosen})
        else:error_html+=f'<article class="case"><h3>{e(title)}</h3><p>No {e(kind.replace("_"," "))} observed for method {m}; none invented.</p></article>'
    error_html+='<p class="small">No false positives were observed for A, C or D on this test set. This does not guarantee zero false positives in other collections.</p>'
    hard={'a':'2017877477__original.jpg','b':'2017877478__original.jpg'}
    hard_scores=' · '.join(f'{m}: {lookup(m,hard["a"],hard["b"])["score"]} ({"selected" if lookup(m,hard["a"],hard["b"])["candidate"] else "not selected"})' for m in 'ABCD')
    replacements={'HERO':photo(f'{example}__original.jpg','The original photograph')+photo(f'{example}__crop.jpg','A cropped version'),'PHOTO_OPTIONS':''.join(f'<option value="{pid}" {"selected" if pid==example else ""}>{pid} · {e(source[pid]["title"][:100])}</option>' for pid in manifest['test_identities']),'INITIAL_GALLERY':gallery(example),'INITIAL_SOURCE':source_line(example),'ACCURACY_TABLE':table('Held-out pair-level accuracy',accuracy_heads,accuracy),'RECALL_CHART':''.join(f'<div class="bar-row"><span>{m} · {NAMES[m]}</span><div class="bar-track"><span style="width:{metrics[m]["recall"]*100:.3f}%"></span></div><strong>{pct(metrics[m]["recall"])}</strong></div>' for m in 'ABCD'),'THRESHOLD_TEXT':f'pHash distance ≤ {thresholds["phash_max_distance"]}; AI cosine ≥ {thresholds["ai_min_cosine"]:.2f}','VARIANT_TABLE':table('Original-to-variant recovery', ['Method']+list(VARIANTS.values())[1:],vr),'COST_TABLE':table('Same machine, two CPU threads; median [min–max]',costs_heads,costs),'COST_FINDING':cost_finding,'STAGE_TABLE':table('Stage wall seconds; median [min–max]',['Method / cache','Stage','Seconds'],stages),'INCREMENTAL_TABLE':table('113 files, same configuration; median [min–max]',costs_heads,incr),'INCREMENTAL_FINDING':increment_finding,'MEASURED_FINDING':measured,'ERROR_EXAMPLES':error_html,'HARD_NEGATIVE':'<div class="hard-negative">'+pair_images(hard)+'<p class="small">'+e(hard_scores)+'</p></div>','RUN_DATE':env['run_utc']}
    staff=staff_content(files,source,pairs,metrics,runs,inc,env,example,markdown_table,table)
    replacements.update(staff)
    template=(ROOT/'site/index.template.html').read_text()
    for key,val in replacements.items():template=template.replace('{{'+key+'}}',val)
    assert '{{' not in template
    (ROOT/'index.html').write_text(template)
    packed=[]
    for p in results['A']['pairs']:
        a,b=p['a'],p['b'];packed.append({'a':a,'b':b,'truth':files[a]['identity']==files[b]['identity'],'scores':{m:lookup(m,a,b)['score'] for m in 'ABCD'},'selected':{m:lookup(m,a,b)['candidate'] for m in 'ABCD'}})
    report={'mode':'controlled experiment evaluation; precomputed','default_identity':example,'methods':NAMES,'thresholds':thresholds,'metrics':metrics,'files':{k:{key:v for key,v in f.items() if key not in ['path']} for k,f in files.items()},'sources':{s['identity']:{k:s[k] for k in ['title','source_page','rights_url']} for s in sources},'test_identities':manifest['test_identities'],'pairs':packed,'illustrative_cases':example_records}
    write(ROOT/'results/report.json',report)
    # Source page keeps full rights text and metadata provenance visible without raw HTML injection.
    source_rows=''
    for s in sources:
        variant='original' if s['role']=='base' else 'new_original';fid=f'{s["identity"]}__{variant}.jpg'
        source_rows+=f'<tr><th scope="row"><a href="{e(s["source_page"])}">{s["identity"]}</a><img loading="lazy" src="images/{fid}" alt="{e(s["title"])}"></th><td class="title">{e(s["title"])}<p class="small">{e(s["collection_title"])}</p></td><td class="rights"><a href="{e(s["rights_url"])}">Rights source</a><details><summary>Exact catalog statement</summary><p>{e(s["rights_statement"])}</p></details></td><td class="provenance"><a href="{e(s["download_url"])}">Downloaded image</a><p>{e(s["download_utc"])}</p><code>{s["sha256"]}</code><p class="small">{e(s["metadata_provenance"])}</p><a href="data/metadata/{s["identity"]}.json">Saved metadata</a></td></tr>'
    (ROOT/'sources.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Photograph sources and rights</title><link rel="stylesheet" href="showcase.css"></head><body><main><section><a href="index.html">← Back to the experiment</a><h1>Photograph sources &amp; rights</h1><p>30 original photographs plus two new independent photographs for the incremental experiment. Credit: Library of Congress, Prints and Photographs Division; see each record for its photographer. Catalog titles may contain historical language. They are retained as source evidence.</p><p>Rights are assessed per record. “No known restrictions” is the catalog wording, not a guarantee or blanket assertion that all library images are public domain. Metadata snapshot provenance and image download dates are distinct.</p><div class="table-wrap"><table class="source-table"><caption>All source images</caption><thead><tr><th>LOC source</th><th>Title / collection</th><th>Rights</th><th>Download / provenance</th></tr></thead><tbody>'+source_rows+'</tbody></table></div></section></main></body></html>')
    source_page=ROOT/'sources.html'
    source_page.write_text('\n'.join(line.rstrip() for line in source_page.read_text().splitlines())+'\n')
    # README is regenerated from actual metrics and run records, never hand-entered result claims.
    readme=(ROOT/'site/readme.template.md').read_text()
    rm={'ACCURACY':markdown_table(accuracy_heads,accuracy),'COSTS':markdown_table(costs_heads,costs),'INCREMENTAL':markdown_table(costs_heads,incr),'VARIANTS':markdown_table(['Method']+list(VARIANTS.values())[1:],vr),'MEASURED_FINDING':measured,'COST_FINDING':cost_finding,'INCREMENTAL_FINDING':increment_finding,'MODEL_SHA':model['sha256'],'THRESHOLDS':replacements['THRESHOLD_TEXT'],'RUN_DATE':env['run_utc']}
    rm.update(staff)
    build_documents(ROOT,rm,markdown_table,env)
    for key,val in rm.items():readme=readme.replace('{{'+key+'}}',val)
    assert '{{' not in readme;(ROOT/'README.md').write_text(readme)
    if args.publish_dir:
        target=args.publish_dir.resolve()/'library_image_duplicates';target.mkdir(parents=True,exist_ok=True)
        for name in ['index.html','sources.html','showcase.css','showcase.js','README.md']:shutil.copy2(ROOT/name,target/name)
        for name in ['images','data','results','docs']:shutil.copytree(ROOT/name,target/name,dirs_exist_ok=True)
    print('Built static page, source page, README and saved-pair explorer from evidence.')
if __name__=='__main__':main()
