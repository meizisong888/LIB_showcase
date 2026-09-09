import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173/LIB_showcase/'
const browser = await chromium.launch({ headless: true })
const officialToolsUrl = 'https://ai.vt.edu/tools.html'
const problems = []
const results = []
const toolUrls = [
  'https://hokie.ai.vt.edu/', 'https://gemini.google.com/', 'https://notebooklm.google.com/',
  'https://copilot.microsoft.com/', 'https://llm.arc.vt.edu/', 'https://ood.arc.vt.edu/',
]
const sourceUrls = [
  'https://ai.vt.edu/tools.html', 'https://ai.vt.edu/tools/hokieai.html',
  ...['KB0016456', 'KB0016244', 'KB0014762', 'KB0015697'].map(id => `https://4help.vt.edu/sp?id=kb_article&sysparm_article=${id}`),
  'https://docs.arc.vt.edu/ai/010_llm_arc_vt_edu.html', 'https://docs.arc.vt.edu/ai/020_ood_arc_vt_edu.html',
]
const submit = async page => {
  await page.getByRole('button', { name: 'Show verified matches' }).click()
  await page.locator('#recommendation-results').waitFor({ state: 'visible' })
}

function watchErrors(page, name) {
  page.on('console', message => { if (message.type() === 'error') problems.push(`${name} console: ${message.text()}`) })
  page.on('pageerror', error => problems.push(`${name} page: ${error.message}`))
}

async function checkLayout(page) {
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false, 'Horizontal overflow')
  assert.doesNotMatch(await page.locator('body').innerText(), /Responsible Use|Academic integrity|Citation ethics|AI may make mistakes/i)
  assert.equal(await page.locator('a[href*="responsible-use"]').count(), 0)
}

async function checkResultLinks(page) {
  for (const card of await page.locator('.result-card').all()) {
    assert.ok(toolUrls.includes(await card.locator('.access-link').getAttribute('href')))
    assert.match(await card.locator('time').getAttribute('datetime'), /^\d{4}-\d{2}-\d{2}$/)
    await card.locator('summary').click()
    assert.ok(await card.getByRole('list', { name: 'Official sources' }).isVisible())
    const links = await card.locator('.source-links a').evaluateAll(nodes => nodes.map(node => node.href))
    assert.ok(links.length > 0)
    assert.ok(links.every(url => sourceUrls.includes(url)))
  }
}

async function inspect(name, path, viewport, prepare) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  watchErrors(page, name)
  try {
    const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' })
    assert.equal(response?.status(), 200)
    const reload = await page.reload({ waitUntil: 'networkidle' })
    assert.equal(reload?.status(), 200, 'Hash route refresh must return HTTP 200')
    const nav = page.getByRole('navigation', { name: 'Primary navigation', includeHidden: true })
    assert.deepEqual(await nav.locator('a').allTextContents(), ['Task Recommender', 'VT AI Tools'])
    if (prepare) await prepare(page)
    await checkLayout(page)
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    accessibility.violations.forEach(violation => problems.push(`${name} accessibility ${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`))
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: `/tmp/vt-student-ai-${name.replaceAll(' ', '-')}.png`, fullPage: true })
    results.push({ name, url: page.url(), h1: await page.locator('h1').innerText(), refreshStatus: reload.status() })
    console.log(`PASS ${name}`)
  } catch (error) {
    problems.push(`${name}: ${error.message}`)
    console.error(`FAIL ${name}: ${error.message}`)
  } finally {
    await context.close()
  }
}

async function questionnaire(page) {
  const nav = page.getByRole('navigation', { name: 'Primary navigation', includeHidden: true })
  const menu = page.getByRole('button', { name: 'Open menu' })
  if (await menu.isVisible()) await menu.click()
  assert.ok(await nav.isVisible())
  assert.equal(await nav.getByRole('link', { name: 'VT AI Tools', exact: true }).getAttribute('href'), officialToolsUrl)
  await nav.getByRole('link', { name: 'Task Recommender', exact: true }).click()
  await nav.locator('a[aria-current="page"]').waitFor({ state: 'attached' })
  if (await menu.isVisible()) assert.equal(await menu.getAttribute('aria-expanded'), 'false')
  await page.getByRole('link', { name: 'Skip to main content' }).focus()
  await page.keyboard.press('Enter')
  assert.equal(new URL(page.url()).hash, '#/recommend')
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content')
  const goals = await page.locator('input[name="goal"]').evaluateAll(nodes => nodes.map(node => node.value))
  assert.equal(goals.length, 10)
  for (const goal of goals) {
    await page.locator(`input[name="goal"][value="${goal}"]`).check()
    await submit(page)
    assert.ok(await page.locator('.result-card').count() > 0, `${goal} must return verified matches`)
    await checkResultLinks(page)
    await checkLayout(page)
    if (goal === 'brainstorm-first-draft') assert.equal(await page.getByText('Equally suitable verified match', { exact: true }).count(), 3)
    if (goal === 'questions-provided-sources') {
      assert.match(await page.locator('.primary-result h3').innerText(), /NotebookLM/)
      assert.ok(await page.getByText('Eligible alternative', { exact: true }).count() > 0)
    }
  }
  await page.locator('input[name="goal"][value="api-research-workflow"]').check()
  await page.getByRole('checkbox', { name: /Dedicated or high-throughput instance/ }).check()
  const confirmations = [
    'Do you already have an ARC account?',
    'Do you have an active ARC allocation with service units?',
    'Can you connect through the VT network or VPN?',
  ]
  for (const question of confirmations) {
    await submit(page)
    assert.equal(await page.locator('.result-card').count(), 0, `Open OnDemand must be excluded before: ${question}`)
    assert.ok(await page.locator('.halt-card').isVisible())
    await page.getByRole('group', { name: question, exact: true }).getByRole('radio', { name: 'Yes', exact: true }).check()
  }
  await submit(page)
  assert.equal(await page.locator('.primary-result .access-link').getAttribute('href'), 'https://ood.arc.vt.edu/')
  await page.getByRole('radio', { name: /Export-controlled data or CUI/i }).check()
  assert.ok(await page.getByRole('heading', { name: 'Do not use an AI tool for this data' }).isVisible())
  assert.equal(await page.locator('.result-card').count(), 0)
  assert.equal(await page.getByRole('link', { name: /Read the VT restriction/ }).getAttribute('href'), 'https://ai.vt.edu/tools.html')
  await checkLayout(page)
}

async function inspectOfficialTools(viewport, legacy) {
  const name = `official tools ${legacy ? 'legacy redirect' : 'navigation'} ${viewport.width}px`
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  try {
    await page.goto(new URL('./#/recommend', baseUrl).href, { waitUntil: 'networkidle' })
    if (legacy) {
      await page.goto(new URL('./#/tools', baseUrl).href, { waitUntil: 'domcontentloaded' })
    } else {
      const menu = page.getByRole('button', { name: 'Open menu' })
      if (await menu.isVisible()) await menu.click()
      await page.getByRole('navigation').getByRole('link', { name: 'VT AI Tools', exact: true }).click()
    }
    await page.waitForURL(officialToolsUrl, { waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { name: 'AI Tools & Access at Virginia Tech', exact: true }).waitFor()
    assert.equal(context.pages().length, 1, 'Tools should open in the same tab')
    const response = await page.reload({ waitUntil: 'domcontentloaded' })
    assert.equal(response?.status(), 200)
    await page.goBack({ waitUntil: 'domcontentloaded' })
    await page.waitForURL(url => url.hash === '#/recommend')
    await page.getByRole('heading', { name: 'Find a VT-supported AI tool for your task', exact: true }).waitFor()
    results.push({ name, destination: officialToolsUrl, refreshStatus: response.status(), backToRecommender: true })
    console.log(`PASS ${name}`)
  } catch (error) {
    problems.push(`${name}: ${error.message}`)
    console.error(`FAIL ${name}: ${error.message}`)
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 800 }]) {
    const size = `${viewport.width}px`
    await inspect(`recommender ${size}`, './#/recommend', viewport)
    await inspect(`results ${size}`, './#/recommend?goal=questions-provided-sources&sensitivity=internal', viewport, async page => {
      await submit(page)
      await checkResultLinks(page)
    })
    await inspectOfficialTools(viewport, false)
    await inspectOfficialTools(viewport, true)
    await inspect(`questionnaire ${size}`, './#/', viewport, questionnaire)
    for (const path of ['/', '/responsible-use', '/safety', '/methodology']) {
      await inspect(`redirect ${path.slice(1) || 'root'} ${size}`, `./#${path}`, viewport, async page => {
        await page.waitForURL(url => url.hash === '#/recommend')
        assert.ok(await page.getByRole('button', { name: 'Show verified matches' }).isVisible())
      })
    }
  }
} finally {
  await browser.close()
}
console.log(JSON.stringify({ baseUrl, results, problems }, null, 2))
if (problems.length) process.exitCode = 1
