"""Render tables and prespecified examples from saved observations; no model calls."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text())


def n(value):
    return 'unknown' if value is None else f'{value:,}'


def pct(value):
    return 'unknown' if value is None else f'{value * 100:.2f}%'


def change(value):
    if not value:
        return 'baseline'
    return pct(abs(value)) + (' lower' if value > 0 else ' higher')


def usage(arm, key):
    return arm['usage'][key]['complete_total']


def table(headers, rows):
    return '\n'.join(['| ' + ' | '.join(headers) + ' |',
                      '| ' + ' | '.join(['---'] * len(headers)) + ' |',
                      *['| ' + ' | '.join(str(v).replace('|', '\\|').replace('\n', ' ') for v in row) + ' |' for row in rows]]) + '\n'


def main():
    summary = read(ROOT / 'results/summary.json')
    arms = summary['conditions']
    base = arms['full_compact']
    paired = read(ROOT / 'results/paired-comparisons.json')
    overview = table(['Condition', 'Completed / planned', 'Backend input', 'Backend output',
                      'Input change vs compact', 'Structure pass', 'AI coverage', 'Raw AI usable†'], [
        [c, f"{a['backend_completed']}/{a['planned']}", n(usage(a, 'input_tokens')), n(usage(a, 'output_tokens')),
         change(1 - usage(a, 'input_tokens') / usage(base, 'input_tokens')),
         f"{a['automatic_pass']}/{a['planned']}", pct(a['ai_quality']['mean_record_coverage']),
         f"{a['ai_quality']['usable_counts'].get('yes', 0)}/{a['ai_quality']['rated']}"]
        for c, a in arms.items()])
    (ROOT / 'results/overview.md').write_text(overview)
    start = '<!-- STAGE2_TABLE_START -->'
    end = '<!-- STAGE2_TABLE_END -->'
    for entry in [ROOT.parent / 'README.md', ROOT / 'report.md']:
        content = entry.read_text()
        if start in content and end in content:
            before, rest = content.split(start, 1)
            _, after = rest.split(end, 1)
            entry.write_text(before + start + '\n' + overview + end + after)
    text = '# Observed results: 20 paired records\n\n'
    text += 'Generated from [summary.json](summary.json) and [paired-comparisons.json](paired-comparisons.json). '
    text += 'AI ratings are unconfirmed judgments, not librarian acceptance or factual accuracy rates.\n\n' + overview
    text += '\nChanges use full_compact as the denominator. Backend input includes common CLI/runtime instructions; '
    text += 'local counts below cover only the fixed task and supplied record. Cached input and reasoning output are subsets, not additional totals.\n\n'
    text += '† Some evaluator judgments wrongly treat statements about missing **supplied input** as contradictions of the full source. '
    text += 'Raw usability and error scores are preserved, with scope flags below; they are not reliable staff acceptance estimates.\n\n'
    text += '## Execution and observed backend usage\n\n'
    text += table(['Condition', 'Planned', 'Attempted requests', 'Attempts', 'Completed', 'Failed', 'Retries',
                   'Cached input', 'Reasoning output', 'Client seconds (sum)', 'Median seconds'], [
        [c, a['planned'], a['attempted_requests'], a['attempts'], a['backend_completed'], a['backend_failures'], a['retries'],
         n(usage(a, 'cached_input_tokens')), n(usage(a, 'reasoning_output_tokens')),
         f"{a['elapsed_seconds_all_attempts']:.2f}", f"{a['median_request_seconds']:.2f}"] for c, a in arms.items()])
    text += '\nElapsed time includes startup and allowance checks, not only inference. Failed and retry attempts are included in known totals.\n\n'
    text += table(['Phase', 'Actual calls', 'Input', 'Output', 'Cached input', 'Reasoning output'], [
        [name, sum(a['attempts'] for a in arms.values()) if key == 'generation_usage' else summary['evaluation_calls'],
         *[n(summary[key][k]['complete_total']) for k in ['input_tokens', 'output_tokens', 'cached_input_tokens', 'reasoning_output_tokens']]]
        for name, key in [('Generation', 'generation_usage'), ('AI-assisted evaluation', 'evaluation_usage')]])
    text += '\nDevelopment-session usage, monetary cost and HokieAI allocation: **not measured**. '
    text += f"AI evaluation completed {summary['evaluation_completed']}/{summary['evaluation_calls']} attempted calls, with {summary['evaluation_retries']} retries.\n\n"
    text += '## Local task-text counts for these same 20 records\n\n'
    text += table(['Condition', 'cl100k_base', 'o200k_base', 'cl100k_base reduction vs compact'], [
        [c, n(a['local_input_tokens']['cl100k_base']), n(a['local_input_tokens']['o200k_base']),
         pct(1 - a['local_input_tokens']['cl100k_base'] / base['local_input_tokens']['cl100k_base'])]
        for c, a in arms.items()])
    text += '\nThese reuse the frozen first-stage counts for the selected subset, not a repeat of the 100-record input experiment.\n\n'
    text += '## Automatic checks (structure only)\n\n'
    text += table(['Condition', 'Valid JSON', 'Correct ID', '1–80 words', 'Mean description words', 'Evidence fields supplied', 'Empty', 'Refusal-text flags'], [
        [c, a['json_pass'], a['identity_pass'], a['word_limit_pass'], f"{a['mean_description_words']:.2f}", a['evidence_fields_pass'], a['empty_answers'], a['refusal_text_flags']] for c, a in arms.items()])
    text += '\nWord counts use whitespace splitting. These checks do not establish factual accuracy or English-language correctness. '
    text += 'Provider refusal and truncation flags are **unknown**: the CLI does not expose them. '
    text += 'Successful JSON parsing and absence of refusal wording are narrower observations.\n\n'
    text += '## AI-assisted quality judgments\n\n'
    text += 'Coverage is the mean of each record’s fully covered provisional facts / fixed fact count. '
    text += 'Partial and uncertain facts are retained separately. Omissions and unsupported claims are distinct; '
    text += 'errors and qualifier losses can overlap and must not be added as independent error totals.\n\n'
    text += table(['Condition', 'Rated', 'Description errors: drafts (claims)', 'All raw error claims', 'Uncertain error claims', 'Limitations error claims',
                   'Input-scope flags: drafts', 'Drafts with qualifier loss (losses)',
                   'Covered / facts', 'Partial / uncertain facts', 'Mean coverage', 'Informativeness 0–3',
                   'Usable yes / no / uncertain', 'Citation/schema flags'], [
        [c, q['rated'], f"{q['drafts_with_description_errors']} ({q['description_error_claims']})", q['error_claims'], q['uncertain_error_claims'],
         q['limitation_error_claims'], q['drafts_with_input_scope_review_flags'],
         f"{q['drafts_with_qualifier_losses']} ({q['qualifier_losses']})", f"{q['covered_facts']}/{q['reference_facts']}",
         f"{q['partial_facts']}/{q['uncertain_facts']}", pct(q['mean_record_coverage']),
         'unknown' if q['mean_informativeness'] is None else f"{q['mean_informativeness']:.2f}",
         ' / '.join(str(q['usable_counts'].get(k, 0)) for k in ['yes', 'no', 'uncertain']), q['ratings_with_citation_or_schema_flags']]
        for c, a in arms.items() for q in [a['ai_quality']]])
    text += '\n“Description errors” means the evaluator’s exact flagged quotation occurs in the description, not only in limitations. '
    text += 'This post-hoc location check does not validate the judgment. Statements about unavailable metadata may occur '
    text += 'in either section. “Input-scope” flags request inspection against the actually supplied fields; '
    text += 'they do not silently replace any AI score. '
    text += 'See [individual evidence and flags](ai-evaluation.json). Citation flags identify review needs; '
    text += 'the program does not silently repair raw evaluator judgments. A nonflagged quotation is not proof of a correct judgment.\n\n'
    text += '## Description availability strata\n\n'
    text += table(['Stratum', 'Condition', 'Generated / structure pass', 'Rated', 'Description errors (drafts)',
                   'Qualifier loss (drafts)', 'Mean coverage', 'Informativeness', 'Usable yes / no / uncertain'], [
        [s, c, f"{st['generation_requests']}/{st['automatic_pass']}", q['rated'], q['drafts_with_description_errors'],
         q['drafts_with_qualifier_losses'], pct(q['mean_record_coverage']),
         'unknown' if q['mean_informativeness'] is None else f"{q['mean_informativeness']:.2f}",
         ' / '.join(str(q['usable_counts'].get(k, 0)) for k in ['yes', 'no', 'uncertain'])]
        for s in ['description_present', 'description_missing'] for c, a in arms.items()
        for st in [a['strata'][s]] for q in [st['ai_quality']]])
    text += '\nThe sample is deliberately 10/10; it does not estimate the source collection’s 31/69 mix.\n\n'
    text += '## Paired differences against full_compact\n\n'
    text += table(['Contrast', 'Stratum', 'Pairs', 'Coverage change (percentage points)', 'More / fewer error claims', 'Usability transitions'], [
        [c, label, p['pairs'], 'unknown' if p['mean_coverage_delta'] is None else f"{100 * p['mean_coverage_delta']:+.2f}",
         f"{p['more_error_claims']}/{p['fewer_error_claims']}", '; '.join(f'{k}: {v}' for k, v in p['usable_transitions'].items())]
        for c, group in paired.items() for label, p in [('all', group['overall']), *group['strata'].items()]])
    text += '\nThe primary contrast is task_fields. full_pretty is formatting; title_subjects is an aggressive stress test. '
    text += 'No significance, noninferiority or equivalence claim follows from these 20 pairs and AI ratings.\n'
    (ROOT / 'results/metrics.md').write_text(text)

    # Deterministic, declared two strata examples plus both extremes of primary
    # coverage change. Ties use the original schedule; usability is shown alongside.
    refs = read(ROOT / 'reference-facts.json')['records']
    selection = read(ROOT.parent / 'results/quality-pilot.json')['records']
    pairs = paired['task_fields']['records']
    selected = []
    def choose(key, reason):
        existing = next((r for r in selected if r['record_key'] == key), None)
        if existing:
            existing['reasons'].append(reason)
        else:
            selected.append({'record_key': key, 'reasons': [reason]})
    for flag in [True, False]:
        choose(next(r['record_key'] for r in selection if r['description_nonempty'] == flag),
               'First scheduled record with ' + ('a nonempty' if flag else 'an empty') + ' Description')
    if pairs:
        choose(max(pairs, key=lambda p: p['coverage_delta'])['record_key'], 'Largest primary coverage increase; original-order tie break')
        choose(min(pairs, key=lambda p: p['coverage_delta'])['record_key'], 'Largest primary coverage decrease; original-order tie break')
    (ROOT / 'results/example-selection.json').write_text(json.dumps(selected, indent=2) + '\n')
    checks = {r['request_id']: r for r in read(ROOT / 'results/generation-checks.json')['records']}
    ratings = {(r['record_key'], r['condition']): r for r in read(ROOT / 'results/ai-evaluation.json')['records']}
    source = read(ROOT.parent / 'data/loc-sample.json')
    examples = '# Same-record answers: selected without favoring reduction\n\n'
    examples += 'The frozen design specified the first record in each description stratum and both extremes of primary usability/coverage differences. '
    examples += 'For a deterministic operational rule, extremes below use **coverage delta** (task_fields minus full_compact), '
    examples += 'break ties by the original schedule, and report usability alongside. Duplicate selections appear once. '
    examples += 'Choosing coverage as the scalar was an analysis-time clarification of the frozen rule, not a separately preregistered formula. '
    examples += 'This is a developer inspection of raw outputs and AI judgments, not human scoring. '
    examples += 'All [80 raw answers](../runs/generation/) and [all AI judgments](ai-evaluation.json) remain available.\n\n'
    for chosen in selected:
        key = chosen['record_key']; record = source[int(key[4:]) - 1]
        examples += f"## {key}: {record['Title']}\n\nSelected because: {'; '.join(chosen['reasons'])}.\n\n"
        examples += f"[Original item]({record['Id']}) · [Frozen full source](../../data/loc-sample.json) · [Raw evaluator response](../runs/evaluation/{key}/attempt-01/response.txt)\n\n"
        ref = next(r for r in refs if r['record_key'] == key)
        examples += 'Provisional source facts, fixed before generation and not human-confirmed:\n\n```json\n'
        examples += json.dumps(ref['facts'], ensure_ascii=False, indent=2) + '\n```\n\n'
        for condition in arms:
            g = checks.get(f'{key}--{condition}')
            if not g:
                continue
            raw = (ROOT / g['raw_response_path']).read_text()
            examples += f"### {condition}\n\n[Exact prompt](../runs/generation/{key}--{condition}/attempt-01/prompt.txt) · [Raw answer](../{g['raw_response_path']})\n\n```json\n{raw.strip()}\n```\n\n"
            q = ratings.get((key, condition))
            if q:
                examples += f"Raw AI judgment: {q['covered']}/{q['reference_fact_count']} fully covered facts; {q['partial']} partial; {q['error_count']} unsupported/contradicted claims ({q['description_error_count']} quoted in description); {q['qualifier_loss_count']} qualifier losses; usable **{q['usable']}**.\n\n"
                reason = q['raw_rating'].get('usability_reason', '')
                examples += '**Evaluator’s reason (unconfirmed):** ' + (reason if isinstance(reason, str) else json.dumps(reason, ensure_ascii=False)) + '\n\n'
                if q['input_scope_review_flags']:
                    examples += '**Input-scope warning:** this evaluator flagged a limitation about supplied/missing material. '
                    examples += 'The generator may be describing its reduced input correctly; check the exact prompt. '
                    examples += 'The raw judgment above has not been repaired.\n\n'
    (ROOT / 'results/examples.md').write_text(examples.rstrip() + '\n')
    print('Rendered measured tables and deterministic example selection.')


if __name__ == '__main__':
    main()
