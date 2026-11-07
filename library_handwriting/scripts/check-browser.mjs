import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = process.argv[2] || 'http://127.0.0.1:8766/library_handwriting/'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
try {
  const response = await page.goto(url)
  if (response) assert.equal(response.status(), 200)
  await page.locator('.sample').last().scrollIntoViewIfNeeded()
  assert.equal(await page.locator('.sample').count(), 3)
  await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0))
  for (const query of ['Lincoln', 'Worcester', 'Arago']) {
    await page.locator('#query').fill(query)
    await page.locator('#search-form button').click()
    assert.ok(await page.locator('.hit').count() > 0, query)
    assert.ok((await page.locator('#search-status').textContent()).includes(query))
  }
  await page.locator('#query').fill('aRagO')
  await page.locator('#search-form button').click()
  assert.equal(await page.locator('.hit').count(), 1)
  assert.ok((await page.locator('.hit').textContent()).includes('Arago, to run between here and'))
  await page.locator('#version-03').selectOption('ai')
  assert.ok((await page.locator('#sample-03 .transcript').textContent()).includes('George to run'))
  for (const id of ['01', '02', '03']) {
    for (const version of ['reference', 'diff', 'checked', 'ai']) {
      await page.locator(`#version-${id}`).selectOption(version)
      const target = version === 'diff' ? '.diff' : '.transcript'
      assert.ok(await page.locator(`#sample-${id} ${target}`).isVisible())
      assert.ok((await page.locator(`#sample-${id} ${target}`).textContent()).trim())
    }
  }
  await page.locator('#layout').selectOption('image')
  assert.equal(await page.locator('#sample-01 .text-panel').isVisible(), false)
  await page.locator('#layout').selectOption('text')
  assert.equal(await page.locator('#sample-01 figure').isVisible(), false)
  // A search result must return to the checked text alongside the matching image.
  await page.locator('.hit > a').first().click()
  assert.equal(await page.locator('#version-03').inputValue(), 'checked')
  assert.equal(await page.locator('#layout').inputValue(), 'side')
  assert.ok(await page.locator('#sample-03 figure').isVisible())
  await page.locator('#query').fill('<img src=x onerror=alert(1)>')
  await page.locator('#search-form button').click()
  assert.equal(await page.locator('#search-results img').count(), 0)
  assert.match(await page.locator('#search-status').textContent(), /No matches/)
  await page.locator('#query').fill(' ')
  await page.locator('#search-form button').click()
  assert.match(await page.locator('#search-status').textContent(), /Enter a word/)
  await page.locator('#query').focus()
  await page.keyboard.type('Lincoln')
  await page.keyboard.press('Enter')
  assert.equal(await page.locator('.hit').count(), 1)
  await page.evaluate(() => scrollTo(0, 0))
  await page.screenshot({ path: '/tmp/lib-handwriting-desktop.png', fullPage: true })
  const desktopAxe = await new AxeBuilder({ page }).analyze()
  assert.deepEqual(desktopAxe.violations.map(v => ({ id: v.id, impact: v.impact })), [])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: '/tmp/lib-handwriting-mobile.png', fullPage: true })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile horizontal overflow')
  const mobileAxe = await new AxeBuilder({ page }).analyze()
  assert.deepEqual(mobileAxe.violations.map(v => ({ id: v.id, impact: v.impact })), [])
  assert.deepEqual(errors, [])
  // Local-file operation is part of the offline promise.
  await page.goto(pathToFileURL(resolve('library_handwriting/index.html')).href)
  await page.locator('#query').fill('Arago')
  await page.locator('#search-form button').click()
  assert.equal(await page.locator('.hit').count(), 1)
  console.log(JSON.stringify({url,samples:3,search:'passed',versions:'passed',layouts:'passed',keyboard:'passed',mobile_overflow:false,axe_violations:0,console_errors:errors,offline_file_search:'passed'},null,2))
} finally {
  await browser.close()
}
