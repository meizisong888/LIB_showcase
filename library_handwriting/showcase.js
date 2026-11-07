/* The corpus is embedded in index.html so this also works from file://. */
const samples = JSON.parse(document.querySelector('#sample-data').textContent)
const sampleById = new Map(samples.map(sample => [sample.id, sample]))
const versionNotes = {
  checked: 'AI-prepared with help from the reference. Important details still need human review.',
  ai: 'AI first pass from the image only, before reading the reference. Bracketed uncertainty is unchanged.',
  reference: 'Published By the People reference. Volunteer review does not make a text infallible.',
  diff: 'Strikethrough = AI wording removed; underline = reference wording added. Differences include formatting and editorial conventions.',
}
for (const article of document.querySelectorAll('.sample')) {
  article.querySelector('.version').addEventListener('change', event => {
    const version = event.target.value
    const sample = sampleById.get(article.dataset.id)
    const transcript = article.querySelector('.transcript')
    const diff = article.querySelector('.diff')
    transcript.hidden = version === 'diff'
    diff.hidden = version !== 'diff'
    if (version === 'diff') diff.innerHTML = sample.diff // Escaped by build.py.
    else transcript.textContent = sample[version]
    article.querySelector('.version-note').textContent = versionNotes[version]
  })
}
document.querySelector('#layout').addEventListener('change', event => {
  document.body.dataset.layout = event.target.value
})
function search(query) {
  const result = document.querySelector('#search-results')
  const status = document.querySelector('#search-status')
  result.replaceChildren()
  query = query.trim()
  if (!query) { status.textContent = 'Enter a word to search all three pages.'; return }
  let matches = 0
  const pages = new Set()
  const needle = query.toLocaleLowerCase('en')
  for (const sample of samples) {
    sample.checked.split('\n').forEach((line, index) => {
      const lower = line.toLocaleLowerCase('en')
      if (!lower.includes(needle)) return
      matches++
      pages.add(sample.id)
      const hit = document.createElement('article')
      hit.className = 'hit'
      const link = document.createElement('a')
      link.href = `#sample-${sample.id}`
      link.textContent = `Sample ${sample.id} · ${sample.short_title} · text line ${index + 1}`
      link.addEventListener('click', () => {
        document.querySelector('#layout').value = 'side'
        document.body.dataset.layout = 'side'
        const select = document.querySelector(`#version-${sample.id}`)
        select.value = 'checked'
        select.dispatchEvent(new Event('change'))
      })
      const context = document.createElement('p')
      let cursor = 0, at = lower.indexOf(needle)
      while (at !== -1) {
        context.append(document.createTextNode(line.slice(cursor, at)))
        const mark = document.createElement('mark')
        mark.textContent = line.slice(at, at + query.length)
        context.append(mark)
        cursor = at + query.length
        at = lower.indexOf(needle, cursor)
      }
      context.append(document.createTextNode(line.slice(cursor)))
      const original = document.createElement('a')
      original.href = sample.page_url
      original.textContent = 'Original scan at LOC ↗'
      hit.append(link, context, original)
      result.append(hit)
    })
  }
  status.textContent = matches ? `${matches} matching line${matches === 1 ? '' : 's'} on ${pages.size} page${pages.size === 1 ? '' : 's'} for “${query}”.` : `No matches for “${query}”. Try another spelling or abbreviation.`
}
document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault()
  search(document.querySelector('#query').value)
})
for (const button of document.querySelectorAll('.example-query')) {
  button.addEventListener('click', () => {
    document.querySelector('#query').value = button.dataset.query
    search(button.dataset.query)
  })
}
