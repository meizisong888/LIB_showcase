"""Summarize observed generation and AI judgments; never fill missing observations."""
from pathlib import Path
from collections import Counter
import csv
import json
import re
import statistics
import sys

ROOT=Path(__file__).resolve().parent
R=ROOT.parent
sys.path.insert(0,str(R))
from prepare_review import structural_check

CONDITIONS=['full_pretty','full_compact','task_fields','title_subjects']
USAGE=['input_tokens','output_tokens','cached_input_tokens','reasoning_output_tokens','cache_write_input_tokens']

def read(p):return json.loads(p.read_text())
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def rows(p):return [json.loads(l) for l in p.read_text().splitlines() if l.strip()]
def mean(xs):return statistics.mean(xs) if xs else None

def usage_total(attempts):
    result={}
    for k in USAGE:
        values=[a.get('usage',{}).get(k) if a.get('usage') else None for a in attempts]
        result[k]={'known_sum':sum(v for v in values if v is not None),
                   'reported_attempts':sum(v is not None for v in values),'total_attempts':len(values),
                   'complete_total':sum(values) if values and all(v is not None for v in values) else None}
    return result

def quoted(quote,text):
    if not isinstance(quote,str) or not quote:return False
    if quote in text:return True
    # Search decoded JSON strings too: JSON escaping is not a quotation error.
    try:
        obj=json.loads(text)
        def strings(x):
            if isinstance(x,str):return [x]
            if isinstance(x,list):return sum((strings(v) for v in x),[])
            if isinstance(x,dict):return sum((strings(v) for v in x.values()),[])
            return []
        return any(quote in s for s in strings(obj))
    except ValueError:return False

def source_quote_found(value, fields, source):
    """Accept verbatim source quotations represented as text or field/value objects."""
    def fragment(original, excerpt):
        if original == excerpt:return True
        if isinstance(original,list):return any(fragment(x,excerpt) for x in original)
        if isinstance(original,dict) and isinstance(excerpt,dict):
            return bool(excerpt) and all(k in original and fragment(original[k],v) for k,v in excerpt.items())
        return isinstance(original,str) and isinstance(excerpt,str) and bool(excerpt) and excerpt in original
    if isinstance(value,dict):
        return bool(value) and all(k in fields and k in source and fragment(source[k],v) for k,v in value.items())
    if isinstance(value,list):
        return bool(value) and all(source_quote_found(v,fields,source) for v in value)
    return isinstance(value,str) and any(quoted(value,json.dumps(source[k],ensure_ascii=False)) for k in fields if k in source)

def main():
    out=ROOT/'results';out.mkdir(exist_ok=True)
    requests=rows(R/'outputs/pilot-requests.jsonl')
    strata={s['record_key']:s['description_nonempty'] for s in read(R/'results/quality-pilot.json')['records']}
    policy=read(ROOT/'settings.json')
    original_counts=list(csv.DictReader((R/'results/per-record.csv').open()))
    local_counts={(r['record_key'],r['condition'],r['encoding']):int(r['input_text_tokens']) for r in original_counts}
    checks=[];exports=[];all_attempts=[];request_by_id={r['request_id']:r for r in requests}
    for r in requests:
        dirs=sorted((ROOT/'runs/generation'/r['request_id']).glob('attempt-*'))
        attempts=[]
        for d in dirs:
            if not (d/'status.json').exists():continue
            a=read(d/'status.json');a['path']=str(d.relative_to(ROOT));attempts.append(a)
            assert (d/'prompt.txt').read_text()==r['prompt']
        if not attempts:continue
        all_attempts.extend(a for a in attempts if a['launched'])
        a=attempts[-1];last=ROOT/a['path'];text=(last/'response.txt').read_text() if (last/'response.txt').exists() else ''
        try:obj=json.loads(text);valid_json=True
        except ValueError:obj=None;valid_json=False
        fields=set(json.loads(r['prompt'][len((R/'task.txt').read_text()):]))
        desc=obj.get('description') if isinstance(obj,dict) else None
        word_count=len(desc.split()) if isinstance(desc,str) else None
        ef=obj.get('evidence_fields') if isinstance(obj,dict) else None
        ef_valid=isinstance(ef,list) and all(isinstance(x,str) for x in ef)
        missing=sorted(set(ef)-fields) if ef_valid else None
        row={'request_id':r['request_id'],'record_key':r['record_key'],'condition':r['condition'],
            'description_present':strata[r['record_key']],'planned':True,'attempted':any(t['launched'] for t in attempts),
            'attempts':sum(t['launched'] for t in attempts),'retries':max(0,sum(t['launched'] for t in attempts)-1),
            'backend_status':a['status'],'backend_completed':a['status']=='completed',
            'valid_json':valid_json,'record_id_correct':isinstance(obj,dict) and obj.get('record_id')==r['source_id'],
            'description_word_count':word_count,'description_within_limit':word_count is not None and 0<word_count<=80,
            'evidence_fields_not_supplied':missing,'evidence_fields_valid':ef_valid and not missing,
            'importer_structure_pass':structural_check(text,r['source_id']),
            'empty_response':not text.strip(),
            'refusal_text_flag':bool(re.search(r"\b(?:I cannot comply|I can.t comply|I.m unable to help|I cannot assist|I.m sorry)\b",text,re.I)),
            'provider_refusal_status':None,'provider_truncation_status':None,
            'client_timeout':a['status']=='timeout','usage':usage_total([t for t in attempts if t['launched']]),
            'latency_seconds_all_attempts':sum(t['latency_seconds'] for t in attempts if t['launched']),
            'raw_response_path':str((last/'response.txt').relative_to(ROOT)),
            'local_input_tokens':{e:local_counts[r['record_key'],r['condition'],e] for e in ['cl100k_base','o200k_base']}}
        row['all_automatic_checks_pass']=row['backend_completed'] and row['importer_structure_pass'] and row['evidence_fields_valid']
        checks.append(row)
        u=row['usage'];usage={k:u[k]['complete_total'] for k in ['input_tokens','output_tokens']}
        if any(v is None for v in usage.values()):usage=None
        if row['attempted']:
            exports.append({'request_id':r['request_id'],'prompt_sha256':r['prompt_sha256'],'model':policy['model'],
                'settings':{'reasoning_effort':policy['generation_reasoning_effort'],'backend':policy['backend'],
                            'cli_version':policy['cli_version'],'backend_max_output_tokens':None,'description_word_limit':80},
                'status':'success' if a['status']=='completed' and text.strip() else 'error','response':text,
                'attempts':row['attempts'],'usage':usage,'latency_seconds':row['latency_seconds_all_attempts']})
    write(out/'generation-checks.json',{'kind':'Automatic structure checks, not factual accuracy','records':checks})
    (out/'generation-responses.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in exports))
    gen={x['request_id']:x for x in checks}
    eval_attempts=[];ratings=[];eval_issues=[]
    blind=read(ROOT/'blind-key.json')['records'];refs={r['record_key']:r for r in read(ROOT/'reference-facts.json')['records']}
    sources=read(R/'data/loc-sample.json')
    for key in refs:
        dirs=sorted((ROOT/'runs/evaluation'/key).glob('attempt-*'))
        if not dirs or not (dirs[-1]/'status.json').exists():continue
        d=dirs[-1];a=read(d/'status.json')
        if a['launched']:eval_attempts.append(a)
        if a['status']!='completed':eval_issues.append({'record_key':key,'issue':a['status']});continue
        raw=(d/'response.txt').read_text()
        try:answer=json.loads(raw)
        except ValueError:eval_issues.append({'record_key':key,'issue':'Invalid evaluator JSON; not repaired'});continue
        candidates=answer.get('candidates') if isinstance(answer,dict) else None
        if not isinstance(candidates,list) or not all(isinstance(c,dict) for c in candidates) or sorted(c.get('label','') for c in candidates)!=list('ABCD'):
            eval_issues.append({'record_key':key,'issue':'Missing/duplicate anonymous labels; not repaired'});continue
        for c in candidates:
            condition=blind[key][c['label']];request_id=f'{key}--{condition}'
            issues=[];source=sources[int(key[4:])-1];g=gen[request_id];text=(ROOT/g['raw_response_path']).read_text()
            try:parsed=json.loads(text)
            except ValueError:parsed={}
            supplied=json.loads(request_by_id[request_id]['prompt'][len((R/'task.txt').read_text()):])
            fact_ids=[f['fact_id'] for f in refs[key]['facts']];facts=c.get('facts',[])
            if sorted(f.get('fact_id','') for f in facts)!=sorted(fact_ids):issues.append('Reference fact IDs incomplete or duplicated')
            for f in facts:
                if f.get('status') not in ['covered','partial','missing','uncertain']:issues.append('Invalid coverage label')
                quote=f.get('quote',f.get('answer_quote',f.get('description_quote','')))
                if f.get('status') in ['covered','partial'] and not quoted(quote,text):issues.append('Fact quote not found: '+f.get('fact_id','?'))
                if any(k not in source for k in f.get('source_fields',[])):issues.append('Unknown source field in fact')
            for kind in ['errors','qualifier_losses']:
                for item in c.get(kind,[]):
                    quote=item.get('answer_quote',item.get('quote',''))
                    if not quoted(quote,text):issues.append(kind+': answer quote not found')
                    fields=item.get('source_fields',[])
                    if any(k not in source for k in fields):issues.append(kind+': unknown source field')
                    sq=item.get('source_quote','')
                    if sq and not source_quote_found(sq,fields,source):
                        issues.append(kind+': source quote not found verbatim')
            if c.get('usable') not in ['yes','no','uncertain']:issues.append('Invalid usability label')
            if type(c.get('informativeness')) is not int or c.get('informativeness') not in range(4):issues.append('Invalid informativeness score')
            statuses=Counter(f.get('status') for f in facts)
            scoped_errors=[];scope_flags=[]
            for error in c.get('errors',[]):
                quote=error.get('answer_quote',error.get('quote',''))
                in_description=quoted(quote,json.dumps(parsed.get('description',''),ensure_ascii=False))
                in_limitations=quoted(quote,json.dumps(parsed.get('limitations',[]),ensure_ascii=False))
                scope='description' if in_description else 'limitations' if in_limitations else 'other_or_unmatched'
                scoped_errors.append({'scope':scope,'kind':error.get('kind'),'quote':quote})
                if (in_description or in_limitations) and re.search(r'\b(?:supplied|provided|missing|absent|no |not |unavailable|available metadata)',quote,re.I):
                    scope_flags.append({'quote':quote,'answer_section':scope,'fields_cited_by_evaluator':error.get('source_fields',[]),
                        'cited_fields_absent_from_generation_input':[f for f in error.get('source_fields',[]) if f not in supplied],
                        'reason':'Post-hoc scope flag, not a corrected score: this input-availability statement may describe the reduced input accurately although the evaluator sees the full record. Compare the exact generation prompt.'})
            ratings.append({'record_key':key,'condition':condition,'description_present':strata[key],
                'anonymous_label':c['label'],'raw_rating':c,'reference_concerns':answer.get('reference_concerns',[]),
                'citation_or_schema_flags':issues,'reference_fact_count':len(fact_ids),
                'covered':statuses['covered'],'partial':statuses['partial'],'missing':statuses['missing'],'uncertain':statuses['uncertain'],
                'coverage':statuses['covered']/len(fact_ids),
                'error_count':sum(e.get('kind') in ('unsupported','contradicted') for e in c.get('errors',[])),
                'error_quote_scopes':scoped_errors,'input_scope_review_flags':scope_flags,
                'description_error_count':sum(e['scope']=='description' and e['kind'] in ('unsupported','contradicted') for e in scoped_errors),
                'limitation_error_count':sum(e['scope']=='limitations' and e['kind'] in ('unsupported','contradicted') for e in scoped_errors),
                'uncertain_error_count':sum(e.get('kind')=='uncertain' for e in c.get('errors',[])),
                'qualifier_loss_count':len(c.get('qualifier_losses',[])),
                'usable':c.get('usable'),'informativeness':c.get('informativeness')})
    write(out/'ai-evaluation.json',{'kind':'AI-assisted judgments, not human gold labels; raw evidence retained',
        'same_model_self_evaluation_risk':True,'records':ratings,'parse_or_execution_issues':eval_issues})
    summaries={}
    for condition in CONDITIONS:
        arm=[g for g in checks if g['condition']==condition];aa=[a for g in arm for a in all_attempts if '/'+g['request_id']+'/' in a['path']]
        rated=[x for x in ratings if x['condition']==condition]
        def quality(items):
            return {'rated':len(items),'drafts_with_errors':sum(x['error_count']>0 for x in items),
                    'error_claims':sum(x['error_count'] for x in items),'uncertain_error_claims':sum(x['uncertain_error_count'] for x in items),
                    'drafts_with_description_errors':sum(x['description_error_count']>0 for x in items),
                    'description_error_claims':sum(x['description_error_count'] for x in items),
                    'limitation_error_claims':sum(x['limitation_error_count'] for x in items),
                    'drafts_with_input_scope_review_flags':sum(bool(x['input_scope_review_flags']) for x in items),
                    'drafts_with_qualifier_losses':sum(x['qualifier_loss_count']>0 for x in items),
                    'qualifier_losses':sum(x['qualifier_loss_count'] for x in items),
                    'mean_record_coverage':mean([x['coverage'] for x in items]),
                    'covered_facts':sum(x['covered'] for x in items),'reference_facts':sum(x['reference_fact_count'] for x in items),
                    'partial_facts':sum(x['partial'] for x in items),'uncertain_facts':sum(x['uncertain'] for x in items),
                    'mean_informativeness':mean([x['informativeness'] for x in items if x['informativeness'] is not None]),
                    'usable_counts':dict(Counter(x['usable'] for x in items)),
                    'ratings_with_citation_or_schema_flags':sum(bool(x['citation_or_schema_flags']) for x in items),
                    'records_with_reference_concerns':sum(bool(x['reference_concerns']) for x in items)}
        summaries[condition]={'planned':20,'attempted_requests':sum(g['attempted'] for g in arm),'attempts':len(aa),
            'backend_completed':sum(g['backend_completed'] for g in arm),
            'backend_failures':sum(g['attempted'] and not g['backend_completed'] for g in arm),
            'automatic_pass':sum(g['all_automatic_checks_pass'] for g in arm),
            'json_pass':sum(g['valid_json'] for g in arm),'identity_pass':sum(g['record_id_correct'] for g in arm),
            'word_limit_pass':sum(g['description_within_limit'] for g in arm),'evidence_fields_pass':sum(g['evidence_fields_valid'] for g in arm),
            'mean_description_words':mean([g['description_word_count'] for g in arm if g['description_word_count'] is not None]),
            'empty_answers':sum(g['empty_response'] for g in arm),'refusal_text_flags':sum(g['refusal_text_flag'] for g in arm),
            'provider_refusal_count':None,'provider_truncation_count':None,'client_timeouts':sum(g['client_timeout'] for g in arm),
            'retries':sum(g['retries'] for g in arm),'usage':usage_total(aa),
            'elapsed_seconds_all_attempts':sum(g['latency_seconds_all_attempts'] for g in arm),
            'median_request_seconds':statistics.median(g['latency_seconds_all_attempts'] for g in arm) if arm else None,
            'local_input_tokens':{e:sum(g['local_input_tokens'][e] for g in arm) for e in ['cl100k_base','o200k_base']},
            'ai_quality':quality(rated),
            'strata':{label:{'generation_requests':sum(g['description_present']==present for g in arm),
                'automatic_pass':sum(g['description_present']==present and g['all_automatic_checks_pass'] for g in arm),
                'ai_quality':quality([x for x in rated if x['description_present']==present])}
                for label,present in [('description_present',True),('description_missing',False)]}}
    pairs={}
    ratingmap={(x['record_key'],x['condition']):x for x in ratings}
    for condition in ['task_fields','full_pretty','title_subjects']:
        pr=[]
        for key in refs:
            base=ratingmap.get((key,'full_compact'));other=ratingmap.get((key,condition))
            if not base or not other:continue
            pr.append({'record_key':key,'description_present':strata[key],
                'coverage_delta':other['coverage']-base['coverage'],
                'error_claims_delta':other['error_count']-base['error_count'],
                'description_error_claims_delta':other['description_error_count']-base['description_error_count'],
                'qualifier_losses_delta':other['qualifier_loss_count']-base['qualifier_loss_count'],
                'baseline_usable':base['usable'],'condition_usable':other['usable'],
                'baseline_flags':base['citation_or_schema_flags'],'condition_flags':other['citation_or_schema_flags']})
        def paired_aggregate(xs):
            return {'pairs':len(xs),'mean_coverage_delta':mean([x['coverage_delta'] for x in xs]),
                'usable_transitions':dict(Counter(x['baseline_usable']+' -> '+x['condition_usable'] for x in xs)),
                'more_error_claims':sum(x['error_claims_delta']>0 for x in xs),'fewer_error_claims':sum(x['error_claims_delta']<0 for x in xs)}
        pairs[condition]={'baseline':'full_compact','overall':paired_aggregate(pr),
             'strata':{label:paired_aggregate([x for x in pr if x['description_present']==present]) for label,present in [('description_present',True),('description_missing',False)]},'records':pr}
    write(out/'paired-comparisons.json',pairs)
    report={'model':policy['model'],'backend':policy['backend'],'conditions':summaries,
        'generation_usage':usage_total(all_attempts),'evaluation_usage':usage_total(eval_attempts),
        'evaluation_calls':len(eval_attempts),'evaluation_completed':sum(a['status']=='completed' for a in eval_attempts),
        'evaluation_retries':max(0,len(eval_attempts)-len(refs)),
        'evaluation_elapsed_seconds':sum(a['latency_seconds'] for a in eval_attempts),
        'execution_windows':{label:{'started_at_utc':min(a['started_at_utc'] for a in aa) if aa else None,
            'completed_at_utc':max(a['completed_at_utc'] for a in aa) if aa else None}
            for label,aa in [('generation',all_attempts),('evaluation',eval_attempts)]},
        'development_usage':None,'human_review':'pending','hokieai_allocation':None,'money_cost':None,
        'notes':['Backend usage includes common CLI/runtime instructions; local tokenizer counts cover the frozen task prompt only.',
                 'Cached-input/reasoning counts are subsets; do not add them to input/output totals.',
                 'Client elapsed includes CLI startup and allowance check; provider-only latency is unavailable.',
                 'English-word check uses whitespace splitting, as in the existing importer; language correctness is not an automatic factual metric.',
                 'CLI does not expose provider refusal or truncation flags. Text heuristics are separate; absence of a flag is not proof.',
                 'AI ratings and provisional facts lack human confirmation. Citation flags require review; raw scores are not silently corrected.']}
    report['notes'].append('Post-hoc input-scope flags separate evaluator claims about limitations from description claims. A truthful statement about absent reduced-input fields may be wrongly penalized against the full-source record. Raw AI errors and usability judgments remain unchanged and require human review.')
    write(out/'summary.json',report)
    print(json.dumps({'generation_completed':sum(a['backend_completed'] for a in summaries.values()),'evaluation_calls':len(eval_attempts),'ratings':len(ratings),'evaluation_issues':eval_issues},indent=2))

if __name__=='__main__':main()
