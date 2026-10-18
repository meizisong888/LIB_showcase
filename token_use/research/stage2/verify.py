"""Audit saved calls, isolation evidence, frozen inputs and blank human sheets locally."""
from pathlib import Path
import csv
import contextlib
import io
import json
import re
import subprocess
import sys
from unittest.mock import patch
from urllib.parse import unquote
from datetime import datetime, timezone

import run
import transport

ROOT = Path(__file__).resolve().parent
R = ROOT.parent


def read(path):
    return json.loads(path.read_text())


def anchors(path):
    result = set()
    seen = {}
    fenced = False
    for line in path.read_text().splitlines():
        if line.startswith('```'):
            fenced = not fenced
        if fenced or not re.match(r'^#{1,6} ', line):
            continue
        title = re.sub(r'^#+ ', '', line).strip().lower()
        title = re.sub(r'[^\w\- ]', '', title).replace(' ', '-')
        count = seen.get(title, 0)
        seen[title] = count + 1
        result.add(title + (f'-{count}' if count else ''))
    return result


def main():
    policy = run.frozen()
    generation = run.generation()
    evaluation = run.evaluation()
    source = read(R / 'data/loc-sample.json')
    for ref in read(ROOT / 'reference-facts.json')['records']:
        record = source[int(ref['record_key'][4:]) - 1]
        for fact in ref['facts']:
            assert fact['source_values'] == {k: record[k] for k in fact['source_fields']}
    thread_ids = []
    counts = {}
    observations = []
    for phase, requests in [('generation', generation), ('evaluation', evaluation)]:
        attempts = completed = retries = 0
        expected = {r['request_id'] for r in requests}
        assert {p.name for p in (ROOT / 'runs' / phase).iterdir() if p.is_dir()} == expected
        for request in requests:
            folders = sorted((ROOT / 'runs' / phase / request['request_id']).glob('attempt-*'))
            assert 1 <= len(folders) <= (2 if phase == 'generation' else 1)
            retries += len(folders) - 1
            for folder in folders:
                prompt = (folder / 'prompt.txt').read_text()
                assert prompt == request['prompt']
                assert run.sha(prompt.encode()) == request['prompt_sha256']
                assert read(folder / 'request.json') == {k: v for k, v in request.items() if k != 'prompt'}
                status = read(folder / 'status.json')
                attempts += int(status['launched'])
                completed += status['status'] == 'completed'
                invocation = read(folder / 'invocation.json')
                assert invocation['codex_args'] == [
                    'exec', '--strict-config', '--ignore-user-config', '--ephemeral',
                    '--skip-git-repo-check', '--json', '--color', 'never',
                    '--output-last-message', '/out/final.txt'
                ] + transport.options(policy, phase == 'evaluation') + ['-']
                assert invocation['source_files_mounted'] is False
                assert invocation['user_prompt_count'] == 1
                events = [json.loads(line) for line in (folder / 'events.jsonl').read_text().splitlines()]
                assert all(e.get('item', {}).get('type') in (None, 'agent_message', 'reasoning', 'error') for e in events)
                assert status['tool_event_count'] == 0
                thread_ids.extend(status['thread_ids'])
                turns = [e for e in events if e.get('type') == 'turn.completed']
                if status['status'] == 'completed':
                    assert len(turns) == 1 and turns[0]['usage'] == status['usage']
                    answers = [e['item']['text'] for e in events if e.get('type') == 'item.completed' and e.get('item', {}).get('type') == 'agent_message']
                    assert len(answers) == 1
                    # CLI final-file writer may append a newline; raw answer content must agree.
                    assert (folder / 'response.txt').read_text().rstrip('\n') == answers[0].rstrip('\n')
                observations.append({'phase': phase, 'request_id': request['request_id'],
                                     'status': status['status'], 'prompt_sha256': request['prompt_sha256']})
        counts[phase] = {'planned': len(requests), 'attempts': attempts, 'completed': completed, 'retries': retries}
    assert counts['generation']['retries'] <= 4
    assert counts['evaluation']['attempts'] <= 20
    assert len(thread_ids) == len(set(thread_ids)), 'A backend thread was reused'
    first_start = min(read(p)['started_at_utc'] for p in (ROOT / 'runs/generation').glob('*/attempt-*/status.json'))
    assert read(ROOT / 'design-lock.json')['created_at_utc'] < first_start
    resume = {}
    if counts['generation']['completed'] == 80 and counts['evaluation']['completed'] == 20:
        # Exercise actual completed-run resume with transport mocked to fail if
        # invoked: this check itself cannot submit an accidental model request.
        for mode in ['generate', 'evaluate']:
            output = io.StringIO()
            with patch.object(sys, 'argv', ['run.py', mode]), patch.object(
                transport, 'run', side_effect=AssertionError('Resume tried to call the backend')
            ), contextlib.redirect_stdout(output):
                run.main()
            assert 'new model launches: 0' in output.getvalue()
            resume[mode] = output.getvalue().strip()

    # Rebuild evaluation prompts from original records and actual answers; only A-D
    # labels enter candidate objects. No condition key/counts/order enters the prompt.
    prefix = (ROOT / 'evaluation-prompt.txt').read_text()
    for request in evaluation:
        body = json.loads(request['prompt'][len(prefix):])
        assert set(body) == {'source_record', 'reference_facts_human_confirmed', 'reference_facts', 'candidates'}
        assert [c['label'] for c in body['candidates']] == list('ABCD')
        assert all(set(c) == {'label', 'answer'} for c in body['candidates'])
        assert body['reference_facts_human_confirmed'] is False
        assert all(name not in request['prompt'] for name in ['full_pretty', 'full_compact', 'task_fields', 'title_subjects'])

    rating_columns = ['unsupported_claims', 'lost_qualifiers', 'acceptable', 'salient_facts_available',
                      'salient_facts_covered', 'informativeness_notes', 'editing_seconds', 'notes']
    for reviewer in [1, 2]:
        with (ROOT / 'human-review' / f'reviewer-{reviewer}.csv').open() as handle:
            rows = list(csv.DictReader(handle))
        assert len(rows) == 80
        assert all(not row[column] for row in rows for column in rating_columns)
        assert 'condition' not in rows[0]

    # The historical input experiment remains unchanged, including its original logs.
    base = '4c088916c3add2e769e049e8abda508d98fa0cbb'
    repo = R.parent.parent
    old_files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', base, 'token_use/research/results'], cwd=repo, text=True).splitlines()
    for name in old_files:
        old = subprocess.check_output(['git', 'show', f'{base}:{name}'], cwd=repo)
        assert (repo / name).read_bytes() == old, f'Historical result changed: {name}'

    manifest = {str(p.relative_to(ROOT)): run.sha(p.read_bytes()) for p in sorted((ROOT / 'runs').rglob('*')) if p.is_file()}
    (ROOT / 'results' / 'run-file-hashes.json').write_text(json.dumps(manifest, indent=2) + '\n')

    # Check local Markdown targets; URLs and headings are not filesystem paths.
    broken = []
    for path in [R.parent / 'README.md', *R.glob('*.md'), *ROOT.rglob('*.md')]:
        for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
            target = target.split(' "', 1)[0].strip('<>')
            if re.match(r'\w+://|mailto:', target):
                continue
            location, _, anchor = target.partition('#')
            dest = path.parent / unquote(location) if location else path
            # This audit's own result is written only after all checks pass.
            if dest.resolve() == (ROOT / 'results/verification.json').resolve():
                continue
            if not dest.exists():
                broken.append({'file': str(path.relative_to(R.parent)), 'target': target})
            elif anchor and dest.suffix == '.md' and unquote(anchor) not in anchors(dest):
                broken.append({'file': str(path.relative_to(R.parent)), 'missing_anchor': target})
    assert not broken, broken
    result = {'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'kind': 'Developer reproduction and evidence audit; not a librarian user test',
              'counts': counts, 'unique_thread_ids': len(set(thread_ids)), 'observed_tool_events': 0,
              'resume_with_backend_disabled': resume,
              'frozen_hashes_pass': True, 'exact_prompts_and_anonymous_evaluation_inputs_pass': True,
              'raw_responses_match_events': True, 'human_ratings': 'pending; two blank sheets verified',
              'historical_result_files_unchanged': len(old_files), 'broken_local_links': broken,
              'network_isolation': 'Not attempted for online model inference',
              'syscall_tracking': 'Not performed', 'attempts': observations}
    (ROOT / 'results' / 'verification.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'attempts'}, indent=2))


if __name__ == '__main__':
    main()
