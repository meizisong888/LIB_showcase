import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173/LIB_showcase/'
const url = new URL('skillprompt/', baseUrl).href
const source = new URL('../skillprompt/', import.meta.url)
const conversation = JSON.parse(await readFile(new URL('demo/conversation.json', source), 'utf8'))
const finalPrompt = await readFile(new URL('demo/final-prompt.txt', source), 'utf8')
const browser = await chromium.launch({ headless: true })
const problems = []
const layouts = [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 800 }]

async function layout(page) {
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false, 'Page must not overflow horizontally')
}

async function accessibility(page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  assert.deepEqual(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [])
}

async function walkFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory)
    if (entry.isDirectory()) files.push(...await walkFiles(child))
    else files.push(child)
  }
  return files
}

try {
  // Verify relative links in documentation, including supplied files.
  for (const file of (await walkFiles(source)).filter(file => file.pathname.endsWith('.md'))) {
    const markdown = await readFile(file, 'utf8')
    for (const [, target] of markdown.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|#)/.test(target)) continue
      const link = new URL(target, file)
      link.hash = ''
      assert.ok((await stat(link)).isFile(), `Broken Markdown link: ${fileURLToPath(file)} -> ${target}`)
    }
  }
  console.log('PASS relative documentation links')

  for (const viewport of layouts) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    const page = await context.newPage()
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => { if (message.type() === 'error') problems.push(message.text()) })
    assert.equal((await page.goto(url))?.status(), 200)
    assert.equal((await page.reload())?.status(), 200)
    await page.getByRole('link', { name: 'Skip to main content' }).focus()
    await page.keyboard.press('Enter')
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content')
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto')
    await layout(page)
    await accessibility(page)

    for (let round = 1; round <= 3; round++) {
      if (round > 1) {
        await page.getByRole('button', { name: 'Next turn' }).focus()
        await page.keyboard.press('Enter')
        assert.equal(await page.evaluate(() => document.activeElement?.id), `round-title-${round}`)
      }
      assert.equal(await page.locator('.round:visible').count(), 1)
      const article = page.locator(`#round-${round}`)
      for (const message of conversation.messages.filter(message => message.round === round)) {
        const text = article.locator(`[data-message-id="${message.id}"]`)
        const disclosure = text.locator('..').locator('summary')
        await disclosure.focus()
        await page.keyboard.press('Enter')
        assert.ok(await text.isVisible())
        assert.equal(await text.textContent(), message.content, `Original wording: ${message.id}`)
      }
      await layout(page)
    }
    await page.getByRole('button', { name: 'Previous turn' }).click()
    assert.ok(await page.locator('#round-2').isVisible())
    await page.locator('[data-step="0"]').focus()
    await page.keyboard.press('Enter')
    assert.ok(await page.locator('#round-1').isVisible())
    await page.locator('[data-step="2"]').click()
    assert.equal(await page.locator('#prompt-text').inputValue(), finalPrompt)

    // Exercise real clipboard permission where supported, then rejection fallback.
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.getByRole('button', { name: 'Copy final prompt' }).click()
    await page.waitForFunction(() => document.getElementById('copy-status').textContent === 'Final prompt copied.')
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), finalPrompt)
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Blocked for fallback test')) } })
    })
    await page.getByRole('button', { name: 'Copy final prompt' }).click()
    await page.waitForFunction(() => document.getElementById('copy-status').textContent.includes('Automatic copying is unavailable'))
    assert.equal(await page.locator('#prompt-text').evaluate(element => element.selectionEnd - element.selectionStart), finalPrompt.length)
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'prompt-text')

    await page.getByText('View all 16 cards and their pinned sources', { exact: true }).click()
    assert.equal(await page.locator('.source-table tbody tr').count(), 16)
    assert.equal(await page.locator('.source-table a[href*="/blob/"]').count(), 17)
    await layout(page)
    await accessibility(page)

    if (viewport.width === 1440) {
      // Request every local asset/download and compare bytes, so an SPA fallback
      // returning HTTP 200 for a missing download cannot pass this check.
      const links = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(nodes => nodes.map(node => node.href || node.src))
      for (const target of new Set(links)) {
        const link = new URL(target)
        if (link.origin !== new URL(url).origin) continue
        if (link.pathname === new URL(url).pathname) {
          if (link.hash) assert.equal(await page.locator(`[id="${decodeURIComponent(link.hash.slice(1))}"]`).count(), 1, `Missing anchor: ${link.hash}`)
          continue
        }
        const relative = link.pathname.slice(new URL(url).pathname.length)
        if (!link.pathname.startsWith(new URL(url).pathname)) continue
        const response = await context.request.get(link.href)
        assert.equal(response.status(), 200, `Asset status: ${link.href}`)
        const file = ['showcase.css', 'walkthrough.js'].includes(relative) ? `site/${relative}` : relative
        assert.deepEqual(await response.body(), await readFile(new URL(file, source)), `Asset bytes: ${file}`)
      }
      console.log('PASS local links, anchors, downloads, and asset bytes')
    }
    await page.evaluate(() => { document.querySelectorAll('details').forEach(detail => { detail.open = false }); window.scrollTo(0, 0) })
    await page.screenshot({ path: `/tmp/skillprompt-${viewport.width}.png`, fullPage: true })
    console.log(`PASS ${viewport.width}px: transcript, keyboard, clipboard/fallback, reflow, accessibility, reduced motion`)
    await context.close()
  }

  const context = await browser.newContext({ javaScriptEnabled: false, viewport: layouts[2] })
  const page = await context.newPage()
  assert.equal((await page.goto(url))?.status(), 200)
  assert.equal(await page.locator('.round:visible').count(), 3)
  for (const summary of await page.locator('.message summary').all()) await summary.click()
  assert.equal(await page.locator('[data-message-id]:visible').count(), 6)
  assert.equal(await page.locator('#prompt-text').inputValue(), finalPrompt)
  assert.equal(await page.getByRole('button', { name: 'Copy final prompt' }).count(), 0)
  await layout(page)
  await context.close()
  console.log('PASS JavaScript-disabled transcript and final-prompt fallback')

  const direct = await browser.newPage()
  await direct.goto(`${url}#round-2`)
  assert.ok(await direct.locator('#round-2').isVisible())
  await direct.goto(new URL('#/recommend', baseUrl).href)
  await direct.getByRole('heading', { name: 'Find a VT-supported AI tool for your task', exact: true }).waitFor()
  await direct.getByRole('link', { name: 'SkillPrompt showcase' }).click()
  await direct.waitForURL(url)
  console.log('PASS direct turn link and guide-to-showcase navigation')
  assert.deepEqual(problems, [], 'Browser errors')
} finally {
  await browser.close()
}
