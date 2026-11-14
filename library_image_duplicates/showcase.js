/* Precomputed evidence only. No image inference, uploads, or network APIs. */
async function start() {
  const response = await fetch('results/report.json')
  if (!response.ok) throw new Error(`Saved report unavailable (${response.status})`)
  const data = await response.json()
  const variants = { original: 'Original', copy: 'Exact copy', resize: 'Smaller (40%)', compressed: 'JPEG quality 18', crop: 'Crop (~25% removed)', crop_upscale: 'Crop, enlarged again' }
  const node = (tag, text, className) => {
    const el = document.createElement(tag)
    if (text !== undefined) el.textContent = text
    if (className) el.className = className
    return el
  }
  const byPair = new Map(data.pairs.map(p => [[p.a, p.b].sort().join('|'), p]))
  const link = (text, url) => { const a = node('a', text); a.href = url; return a }
  function imageFigure(fid) {
    const f = data.files[fid]
    const s = data.sources[f.identity]
    const figure = node('figure')
    const img = node('img')
    img.src = `images/${fid}`
    img.alt = `${variants[f.variant] || f.variant}: ${s.title}`
    img.loading = 'lazy'
    img.width = 520; img.height = 380
    const caption = node('figcaption', `${variants[f.variant] || f.variant} · `)
    caption.append(link(`LOC ${f.identity}`, s.source_page))
    figure.append(img, caption)
    return figure
  }
  const select = document.querySelector('#photo-select')
  function updateGallery() {
    const id = select.value
    const cards = []
    for (const [variant, title] of Object.entries(variants)) {
      const fid = `${id}__${variant}.jpg`
      const f = data.files[fid]
      const card = node('article', undefined, 'variant-card')
      const image = imageFigure(fid).querySelector('img')
      const badges = node('div', undefined, 'badges')
      if (variant === 'original') badges.append(node('span', 'Reference photograph', 'tag neutral'))
      else {
        const pair = byPair.get([`${id}__original.jpg`, fid].sort().join('|'))
        for (const method of ['A', 'B', 'C', 'D']) badges.append(node('span', `${method}: ${pair.selected[method] ? 'Found' : 'Missed'}`, `tag ${pair.selected[method] ? '' : 'miss'}`))
      }
      card.append(image, node('strong', title), badges, node('p', `${f.size[0]} × ${f.size[1]} pixels · ${f.bytes.toLocaleString('en-US')} bytes`, 'small'))
      cards.push(card)
    }
    document.querySelector('#variant-gallery').replaceChildren(...cards)
    const s = data.sources[id]
    document.querySelector('#photo-source').replaceChildren(document.createTextNode(`Photograph: ${s.title} `), link('Source record', s.source_page), document.createTextNode(' · '), link('Rights', s.rights_url))
  }
  select.addEventListener('change', updateGallery)
  const methodSelect = document.querySelector('#method-filter')
  const outcomeSelect = document.querySelector('#outcome-filter')
  const list = document.querySelector('#pair-list')
  const more = document.querySelector('#more-pairs')
  let limit = 12
  function renderPairs(reset = false) {
    if (reset) limit = 12
    const method = methodSelect.value
    const mode = outcomeSelect.value
    const filtered = data.pairs.filter(p => mode === 'all' || (mode === 'candidate' && p.selected[method]) || (mode === 'tp' && p.selected[method] && p.truth) || (mode === 'fn' && !p.selected[method] && p.truth) || (mode === 'fp' && p.selected[method] && !p.truth))
    filtered.sort((a, b) => method === 'B' ? a.scores[method] - b.scores[method] : b.scores[method] - a.scores[method])
    const cards = filtered.slice(0, limit).map(p => {
      const card = node('article', undefined, 'pair-card')
      const images = node('div', undefined, 'pair-images')
      images.append(imageFigure(p.a), imageFigure(p.b))
      const scoreName = method === 'A' ? 'Verified identical bytes' : method === 'B' ? 'pHash distance (lower is closer)' : 'AI similarity (higher is closer)'
      const outcome = p.truth ? (p.selected[method] ? 'Correctly found' : 'Missed duplicate') : (p.selected[method] ? 'False match' : 'Correctly left out')
      card.append(images, node('p', `${scoreName}: ${p.scores[method]}`, 'score'), node('span', outcome, `tag ${(!p.selected[method] && p.truth) || (p.selected[method] && !p.truth) ? 'miss' : 'neutral'}`), node('p', `${p.a} ↔ ${p.b}`))
      return card
    })
    if (!cards.length) cards.push(node('p', `No ${mode === 'fp' ? 'false matches' : 'pairs'} observed for this filter. No examples have been invented.`))
    list.replaceChildren(...cards)
    document.querySelector('#pair-count').textContent = `${filtered.length.toLocaleString('en-US')} pairs · showing ${Math.min(limit, filtered.length)} · method ${method} · answers known for this experiment`
    more.hidden = filtered.length <= limit
  }
  methodSelect.addEventListener('change', () => renderPairs(true))
  outcomeSelect.addEventListener('change', () => renderPairs(true))
  more.addEventListener('click', () => { limit += 12; renderPairs() })
  renderPairs()
}
start().catch(error => {
  document.querySelector('#pair-count').textContent = `The saved pair explorer could not load: ${error.message}. The measured tables and downloadable prediction files remain available.`
  document.querySelector('#more-pairs').hidden = true
})
