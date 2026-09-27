import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'

const source = new URL('../skillprompt/', import.meta.url)
const output = new URL('../dist/skillprompt/', import.meta.url)
const read = path => readFile(new URL(path, source), 'utf8')
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const english = text => text.split(' / ')[0]

// Fail the build if any owner-supplied evidence has been edited accidentally.
for (const line of (await read('ORIGINALS.sha256')).trim().split('\n')) {
  const [expected, path] = line.split('  ')
  const bytes = await readFile(new URL(path, source))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `Original changed: ${path}`)
}

const conversation = JSON.parse(await read('demo/conversation.json'))
const finalPrompt = await read('demo/final-prompt.txt')
assert.equal(conversation.messages.length, 6)
assert.equal(conversation.messages[5].content.match(/```text\n([\s\S]*?)\n```/)[1], finalPrompt.trimEnd())
const knowledge = await read('knowledge/SkillPrompt_Academic_Knowledge_v1.txt')
const notices = await read('sources/SkillPrompt_Sources_and_Licenses_v1.md')
// Parse repeated source fields from the canonical TXT. The supplied convenience
// index loses SK11's first source because it represents fields as object keys.
const cards = [...knowledge.matchAll(/^(SK\d{2}) \| ([^\n]+)\nCategory: ([^\n]+)\n([\s\S]*?)(?=\n={10,}|\nATTRIBUTION AND MAINTENANCE)/gm)].map(([, id, title, category, body]) => ({
  id, title: english(title), category: english(category),
  method: body.match(/^Prompt-building method: (.+)$/m)[1],
  sources: [...body.matchAll(/^Pinned source: (.+)$/gm)].map(([, url]) => {
    assert.ok(notices.includes(url), `Missing source notice: ${id}`)
    assert.match(url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[a-f0-9]{40}\/.+$/)
    const [, repository, commit, path] = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)$/)
    return { url, repository, commit, path }
  }),
}))
assert.equal(cards.length, 16)
assert.equal(cards.find(card => card.id === 'SK11').sources.length, 2)
const licenses = {
  'K-Dense-AI/scientific-agent-skills': 'MIT',
  'Orchestra-Research/AI-Research-SKILLs': 'MIT',
  'neuromechanist/research-skills': 'BSD-3-Clause',
  'ShaishavMaisuria/research-paper-lifecycle-skills': 'Apache-2.0',
}
const rounds = [
  { title: 'Understand & propose', summary: 'The user plans to upload five papers. SkillPrompt selects SK04 for thematic synthesis and SK08 for academic drafting, then proposes a more detailed request.', note: 'The proposal introduces a strict word range, a paragraph count, and a manual paper-label map. Its first SK08 quotation is not fully exact; see the review notes below.' },
  { title: 'Choose what to keep', summary: 'The user keeps thematic comparison, the five-paper boundary, and traceable references. They remove rigid length and paragraph rules, reduce evaluation detail, and ask for labels to be assigned after upload.', note: 'The revision follows those choices. Its quotations match the cards, but it still attributes plain-language tone too broadly to SK08. The user supplied that preference.' },
  { title: 'Accept & finalize', summary: 'The user accepts the revision. SkillPrompt returns a copyable final prompt without another confirmation question or an attempted literature review.', note: 'The final prompt retains the accepted scope and flexible paragraphing. No papers were uploaded in this record, and no review was executed.' },
]
const messages = rounds.map((round, i) => `<article class="round panel" id="round-${i + 1}" aria-labelledby="round-title-${i + 1}">
  <p class="eyebrow">Turn ${i + 1} of 3</p><h3 id="round-title-${i + 1}" tabindex="-1">${round.title}</h3>
  <p class="round-summary">${round.summary}</p>
  ${conversation.messages.filter(message => message.round === i + 1).map(message => `<details class="message"><summary>${message.role === 'user' ? 'User input' : 'SkillPrompt response'} · full original message</summary><pre class="transcript" data-message-id="${escape(message.id)}">${escape(message.content)}</pre></details>`).join('\n')}
  <aside class="annotation"><strong>Showcase annotation</strong><p>${round.note}</p></aside>
  <div class="round-controls" hidden>${i > 0 ? `<button type="button" data-go="${i - 1}">← Previous turn</button>` : ''}${i < 2 ? `<button type="button" data-go="${i + 1}">Next turn →</button>` : '<a href="#final-prompt">Read & copy the final prompt ↓</a>'}</div>
</article>`).join('\n')

const sourceRows = cards.map(card => `<tr><th scope="row">${card.id}<span>${escape(card.title)}</span></th><td>${escape(card.category)}</td><td>${card.sources.map(s => `<a href="https://github.com/${escape(s.repository)}">${escape(s.repository)}</a><br><a href="${escape(s.url)}">${escape(s.path)} <small>@ ${s.commit.slice(0, 12)}</small></a>`).join('<hr>')}</td><td>${licenses[card.sources[0].repository]}</td></tr>`).join('\n')
const excerpts = ['SK04', 'SK08'].map(id => {
  const card = cards.find(card => card.id === id)
  return `<details><summary>${id} · ${escape(card.title)}</summary><p class="small">Exact prompt-building method from the local knowledge card; an adaptation of the linked upstream source.</p><blockquote>${escape(card.method)}</blockquote><a href="${escape(card.sources[0].url)}">Pinned upstream source for ${id}</a></details>`
}).join('\n')
const categories = [...new Set(cards.map(card => card.category))].map(category => `<li><strong>${escape(category)}</strong><span>${cards.filter(card => card.category === category).map(card => card.id).join(' · ')}</span></li>`).join('\n')

let html = await read('site/index.html')
for (const [key, value] of Object.entries({ rounds: messages, sources: sourceRows, excerpts, categories, initial: escape(conversation.messages[0].content), final: escape(finalPrompt), provenance: escape(conversation.provenance) })) {
  html = html.replaceAll(`{{${key}}}`, value)
}
assert.doesNotMatch(html, /\{\{\w+\}\}/)
await mkdir(output, { recursive: true })
// Explicit allowlist: handoff-only files and the source archive never reach Pages.
for (const path of ['agent', 'knowledge', 'sources', 'demo', 'docs', 'evidence', 'reference', 'README.md', 'ORIGINALS.sha256']) {
  await cp(new URL(path, source), new URL(path, output), { recursive: true })
}
for (const path of ['showcase.css', 'walkthrough.js']) await cp(new URL(`site/${path}`, source), new URL(path, output))
await writeFile(new URL('index.html', output), html)
console.log('Built SkillPrompt: 6 original messages, 16 cards, 17 pinned source mappings; evidence checksums verified.')
