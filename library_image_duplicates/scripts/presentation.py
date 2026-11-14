"""Plain-language presentation of saved evidence; never performs inference."""
import html
import statistics
from pathlib import Path

NAMES = {'A': 'File hash', 'B': 'pHash', 'C': 'SSCD', 'D': 'Exact-copy reuse + SSCD'}


def staff_content(files, source, pairs, metrics, runs, incremental, env, identity, md_table, html_table):
    def pair(a, b):
        key = tuple(sorted((a, b)))
        assert files[a]['identity'] == files[b]['identity']
        return {m: pairs[m][key] for m in 'ABCD'}

    def outcome(predictions):
        found = [m for m in 'ABCD' if predictions[m]['candidate']]
        if len(found) == 4:
            return 'All four methods found this pair.'
        if not found:
            return 'None of the four methods found this pair.'
        def names(methods):
            values = [NAMES[m] for m in methods]
            return ' and '.join(values) if len(values) <= 2 else ', '.join(values[:-1]) + ' and ' + values[-1]
        return names(found) + ' found it. ' + names([m for m in 'ABCD' if m not in found]) + ' missed it.'

    original = f'{identity}__original.jpg'
    crop = f'{identity}__crop.jpg'
    # Select actual false negatives from the preserved predictions, not invented examples.
    miss = next(p for p in pairs['D'].values() if not p['candidate'] and files[p['a']]['identity'] == files[p['b']]['identity'] and {files[p['a']]['variant'], files[p['b']]['variant']} == {'compressed', 'crop'})
    cases = [
        ('Same image, different filename', original, f'{identity}__copy.jpg',
         'Only the filename changed.', 'An exact copy needs no AI to identify it.'),
        ('Same photograph, cropped', original, crop,
         'About a quarter of the picture was removed.', 'AI can help when an edit changes the overall picture.'),
        ('A difficult case: a missed match', miss['a'], miss['b'],
         'One version was compressed; the other was cropped.', 'Even AI can miss two edited copies of the same photograph.'),
    ]

    def image_pair(a, b, labels, markdown=False):
        if markdown:
            images = ' '.join(f'<img src="images/{html.escape(fid)}" width="45%" alt="{html.escape(label)}" />' for fid, label in zip((a, b), labels))
            return f'<p>{images}</p>\n\n{labels[0]} (left); {labels[1].lower()} (right). [Source photograph]({source[files[a]["identity"]]["source_page"]}).'
        return '<div class="pair-images">' + ''.join(
            f'<figure><img src="images/{html.escape(fid)}" width="520" height="380" loading="lazy" alt="{html.escape(label)}"><figcaption>{html.escape(label)} · <a href="{html.escape(source[files[fid]["identity"]]["source_page"])}">Source</a></figcaption></figure>'
            for fid, label in zip((a, b), labels)) + '</div>'

    labels = [('Original', 'Renamed copy'), ('Original', 'Cropped version'), ('Compressed version', 'Cropped version')]
    md, web = [], []
    for i, ((title, a, b, change, lesson), captions) in enumerate(zip(cases, labels), 1):
        predictions = pair(a, b)
        finding = outcome(predictions)
        md.append(f'### {i}. {title}\n\n{image_pair(a, b, captions, True)}\n\n**What changed?** {change}\n\n**What did the methods find?** {finding}\n\n**What does this show?** {lesson}\n')
        selected = ''.join(m for m in 'ABCD' if predictions[m]['candidate'])
        web.append(f'<article class="case" data-a="{a}" data-b="{b}" data-selected="{selected}"><h3>{i}. {html.escape(title)}</h3>{image_pair(a, b, captions)}<p><strong>What changed?</strong> {html.escape(change)}</p><p><strong>What did the methods find?</strong> {html.escape(finding)}</p><p><strong>What does this show?</strong> {html.escape(lesson)}</p></article>')
    result_headers = ['Method', 'Duplicate pairs found', 'False matches', 'Missed pairs']
    result_rows = [[NAMES[m], metrics[m]['tp'], metrics[m]['fp'], metrics[m]['fn']] for m in 'ABCD']
    # Fail on internal inconsistencies; numbers are always read from the artifacts.
    total = metrics['C']['tp'] + metrics['C']['fn']
    assert all(metrics[m]['tp'] + metrics[m]['fn'] == total for m in 'ABCD')
    findings = [
        'File hashes found exact copies.',
        'pHash found more edited copies but also produced false matches.',
        f'SSCD found {metrics["C"]["tp"]} of {total} duplicate pairs, with ' + ('no false matches in this test.' if metrics['C']['fp'] == 0 else f'{metrics["C"]["fp"]} false matches in this test.'),
        'Reusing exact-copy features preserved these results while reducing processing time.',
    ]
    med = lambda m: statistics.median(r['process_wall_s'] for r in runs if r['method'] == m and r['mode'] == 'first')
    inc = {mode: statistics.median(r['process_wall_s'] for r in incremental if r['mode'] == mode) for mode in ['full', 'reuse']}
    timing = [
        ['First run: SSCD → exact-copy reuse + SSCD', f'{med("C"):.2f} s', f'{med("D"):.2f} s'],
        ['Adding five files: full recalculation → saved-feature reuse', f'{inc["full"]:.2f} s', f'{inc["reuse"]:.2f} s'],
    ]
    return {
        'README_HERO': image_pair(original, crop, ('Original', 'Cropped version'), True),
        'README_EXAMPLES': '\n'.join(md), 'STAFF_EXAMPLES': ''.join(web),
        'SIMPLE_RESULTS_MD': md_table(result_headers, result_rows),
        'SIMPLE_RESULTS_HTML': html_table('Known duplicate pairs in the test set', result_headers, result_rows),
        'SIMPLE_TIME_HTML': html_table('Measured processing time', ['Comparison', 'Without reuse', 'With reuse'], timing),
        'PLAIN_FINDINGS_MD': '\n'.join('- ' + x for x in findings),
        'PLAIN_FINDINGS_HTML': '<ul>' + ''.join('<li>' + html.escape(x) + '</li>' for x in findings) + '</ul>',
        'FIRST_BASELINE': f'{med("C"):.2f}', 'FIRST_REUSE': f'{med("D"):.2f}',
        'INCREMENTAL_BASELINE': f'{inc["full"]:.2f}', 'INCREMENTAL_REUSE': f'{inc["reuse"]:.2f}',
        'CPU_SHORT': env['cpu_model'].replace('(R)', '').replace('CPU ', ''),
    }


def build_documents(root, bindings, md_table, env):
    bindings = dict(bindings)
    bindings['ENVIRONMENT_MD'] = md_table(['Item', 'Recorded value'], [
        ['Run date (UTC)', env['run_utc']], ['CPU', env['cpu_model']],
        ['Device used', env['device']], ['Platform', env['platform']],
        ['Python', env['python'].replace('|', '/')], ['PyTorch runtime', env['torch_runtime_version']],
        ['CPU affinity', str(env['affinity'])],
        ['Threads', '; '.join(f'{k}: {v}' for k, v in env['threads'].items())],
        ['Repetitions per condition', env['repeats']],
    ])
    bindings['DEPENDENCIES_MD'] = md_table(['Package', 'Version'], list(env['dependencies'].items()))
    for template in sorted((root / 'site/docs').glob('*.template.md')):
        content = template.read_text()
        for key, value in bindings.items():
            content = content.replace('{{' + key + '}}', value)
        assert '{{' not in content, template
        (root / 'docs' / template.name.replace('.template', '')).write_text(content)
