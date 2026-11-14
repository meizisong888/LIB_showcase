import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
const url = process.argv[2] || 'http://127.0.0.1:8767/'
const data = JSON.parse(await readFile('library_image_duplicates/results/report.json', 'utf8'))
const output = 'library_image_duplicates/work/browser'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
try {
  const response = await page.goto(url)
  assert.equal(response.status(), 200)
  await page.waitForFunction(() => document.querySelector('#pair-count').textContent.includes('pairs'))
  assert.equal(await page.locator('h1').textContent(), 'Finding Duplicate Images in Library Collections')
  assert.equal(await page.locator('.variant-card').count(), 6)
  assert.equal(await page.locator('.pair-card').count(), 12)
  assert.equal(await page.locator('.story-examples .case').count(), 3)
  for (const card of await page.locator('.story-examples .case').all()) {
    const a = await card.getAttribute('data-a'); const b = await card.getAttribute('data-b')
    const pair = data.pairs.find(p => (p.a === a && p.b === b) || (p.a === b && p.b === a))
    assert.ok(pair?.truth, 'Story examples must be known duplicates')
    assert.equal(await card.getAttribute('data-selected'), ['A', 'B', 'C', 'D'].filter(m => pair.selected[m]).join(''))
  }
  await page.locator('#all-variants > summary').click()
  const gallery = page.locator('#variant-gallery')
  await gallery.scrollIntoViewIfNeeded()
  await page.waitForFunction(() => [...document.querySelectorAll('#variant-gallery img')].every(i => i.complete && i.naturalWidth > 0))
  for (const id of data.test_identities) {
    await page.locator('#photo-select').selectOption(id)
    const actual = await page.locator('#variant-gallery .badges').allTextContents()
    assert.equal(actual.length, 6)
    const vars = ['original', 'copy', 'resize', 'compressed', 'crop', 'crop_upscale']
    for (let i = 1; i < vars.length; i++) {
      const a = `${id}__original.jpg`; const b = `${id}__${vars[i]}.jpg`
      const pair = data.pairs.find(p => (p.a === a && p.b === b) || (p.a === b && p.b === a))
      for (const m of ['A', 'B', 'C', 'D']) assert.ok(actual[i].includes(`${m}: ${pair.selected[m] ? 'Found' : 'Missed'}`))
    }
  }
  await page.locator('#photo-select').selectOption(data.default_identity)
  for (const m of ['A', 'B', 'C', 'D']) {
    await page.locator('#method-filter').selectOption(m)
    for (const [mode, count] of Object.entries({ candidate: data.metrics[m].candidate_pairs, tp: data.metrics[m].tp, fn: data.metrics[m].fn, fp: data.metrics[m].fp, all: 5778 })) {
      await page.locator('#outcome-filter').selectOption(mode)
      assert.ok((await page.locator('#pair-count').textContent()).startsWith(count.toLocaleString('en-US')))
      assert.equal(await page.locator('.pair-card').count(), Math.min(12, count))
    }
  }
  await page.locator('#method-filter').selectOption('D')
  await page.locator('#outcome-filter').selectOption('candidate')
  await page.locator('#more-pairs').click()
  assert.equal(await page.locator('.pair-card').count(), 24)
  await page.locator('#outcome-filter').selectOption('fn')
  await page.locator('#candidates').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => [...document.querySelectorAll('#pair-list img')].every(i => i.complete && i.naturalWidth > 0))
  await page.screenshot({ path: `${output}/desktop-pairs.png` })
  await page.locator('#all-variants').evaluate(el => { el.open = false })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: `${output}/desktop-top.png` })
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.length })), [])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo(0, 0))
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile horizontal overflow')
  await page.screenshot({ path: `${output}/mobile-top.png` })
  await page.locator('.story-examples').scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${output}/mobile-examples.png` })
  await page.locator('#all-variants').evaluate(el => { el.open = true })
  await gallery.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${output}/mobile-gallery.png` })
  const sourceResponse = await page.goto(new URL('sources.html', url).href)
  assert.equal(sourceResponse.status(), 200)
  assert.equal(await page.locator('tbody tr').count(), 32)
  // Fetch every displayed image directly, including images outside lazy-loading viewport.
  const imageStatuses = await page.evaluate(async () => Promise.all([...document.images].map(async i => ({ src: i.getAttribute('src'), status: (await fetch(i.src)).status }))))
  assert.ok(imageStatuses.every(x => x.status === 200))
  assert.deepEqual(errors, [])
  await writeFile(`${output}/checks.json`, JSON.stringify({ url, passed: true, desktop: [1440, 1000], mobile: [390, 844], galleryIdentities: 18, filtersChecked: 20, axeViolations: 0, sourceImages: imageStatuses.length, consoleErrors: errors }, null, 2) + '\n')
  console.log('Browser checks passed: desktop/mobile, 18 galleries, 20 filters, source images, accessibility, no console errors.')
} finally { await browser.close() }
