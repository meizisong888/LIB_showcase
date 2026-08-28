import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173/LIB_showcase/'
const browser = await chromium.launch({ headless: true })
const problems = []

async function inspect(name, path, viewport, screenshot, prepare) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`${name} console: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`${name} page: ${error.message}`))
  const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' })
  if (!response?.ok()) problems.push(`${name} HTTP ${response?.status()}`)
  if (prepare) await prepare(page)
  const metrics = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }))
  if (!metrics.h1) problems.push(`${name} has no h1`)
  if (metrics.horizontalOverflow) problems.push(`${name} has horizontal overflow at ${viewport.width}px`)
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  for (const violation of accessibility.violations) {
    problems.push(`${name} accessibility ${violation.id}: ${violation.nodes.length} affected node(s)`)
  }
  await page.screenshot({ path: `/tmp/lib-showcase-${screenshot}.png`, fullPage: true })
  await context.close()
  return metrics
}

const results = []
results.push(await inspect('home desktop', './', { width: 1440, height: 1000 }, 'home-desktop'))
results.push(await inspect('home mobile', './', { width: 390, height: 844 }, 'home-mobile'))
const submitFinder = async (page) => page.getByRole('button', { name: 'Build my recommendation' }).click()
results.push(await inspect('finder results desktop', './recommend?role=staff&taskId=meetings&inputType=documents&outputType=action-log&needsWeb=0&citations=0&editFiles=1&coding=0&collaborationMode=organization-account&ecosystem=microsoft&sensitivity=internal&access=vt', { width: 1440, height: 1000 }, 'finder-results-desktop', submitFinder))
results.push(await inspect('finder results mobile', './recommend?role=staff&taskId=meetings&inputType=documents&outputType=action-log&needsWeb=0&citations=0&editFiles=1&coding=0&collaborationMode=organization-account&ecosystem=microsoft&sensitivity=internal&access=vt', { width: 390, height: 844 }, 'finder-results-mobile', submitFinder))
results.push(await inspect('tools desktop', './tools', { width: 1440, height: 1000 }, 'tools-desktop'))
results.push(await inspect('tools matrix mobile', './tools', { width: 390, height: 844 }, 'tools-mobile'))
results.push(await inspect('skills library desktop', './skills', { width: 1440, height: 1000 }, 'skills-desktop'))
results.push(await inspect('skills library mobile', './skills', { width: 390, height: 844 }, 'skills-mobile'))
results.push(await inspect('skill example desktop', './skills/code-change-loop', { width: 1440, height: 1000 }, 'skill-example-desktop'))
results.push(await inspect('skill example mobile', './skills/code-change-loop', { width: 390, height: 844 }, 'skill-example-mobile'))
results.push(await inspect('safety decision tree desktop', './safety', { width: 1440, height: 1000 }, 'safety-desktop'))
results.push(await inspect('safety decision tree mobile', './safety', { width: 390, height: 844 }, 'safety-mobile'))
results.push(await inspect('deep route desktop', './skills/source-triangulation', { width: 1440, height: 1000 }, 'deep-route-desktop'))
results.push(await inspect('deep route mobile', './skills/source-triangulation', { width: 390, height: 844 }, 'deep-route-mobile'))

const smokeContext = await browser.newContext({ viewport: { width: 1100, height: 800 } })
const smokePage = await smokeContext.newPage()
smokePage.on('console', (message) => {
  if (message.type() === 'error') problems.push(`route smoke console: ${message.text()}`)
})
smokePage.on('pageerror', (error) => problems.push(`route smoke page: ${error.message}`))
const smokeRoutes = ['./skills', './find-a-skill', './safety', './methodology', './contribute', './skills/github-copilot-agent-mode', './missing-route']
for (const route of smokeRoutes) {
  const response = await smokePage.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle' })
  if (!response?.ok()) problems.push(`${route} HTTP ${response?.status()}`)
  if (!(await smokePage.locator('h1').count())) problems.push(`${route} has no h1`)
}
await smokeContext.close()

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
const mobilePage = await mobileContext.newPage()
await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' })
await mobilePage.getByRole('button', { name: 'Open menu' }).click()
if (!(await mobilePage.getByRole('navigation', { name: 'Primary navigation' }).isVisible())) problems.push('Mobile navigation did not open')
await mobilePage.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Compare tools' }).click()
if (!mobilePage.url().endsWith('/tools')) problems.push('Mobile navigation did not change routes')
await mobileContext.close()

const interaction = await browser.newPage({ viewport: { width: 1280, height: 900 } })
interaction.on('console', (message) => {
  if (message.type() === 'error') problems.push(`interaction console: ${message.text()}`)
})
interaction.on('pageerror', (error) => problems.push(`interaction page: ${error.message}`))
await interaction.goto(new URL('./recommend', baseUrl).href, { waitUntil: 'networkidle' })
await interaction.getByRole('radio', { name: /I’m not sure/ }).check()
await interaction.getByRole('button', { name: 'Build my recommendation' }).click()
if (!(await interaction.getByText('Pause: resolve the data boundary first').isVisible())) problems.push('Unknown-data stop result did not render')

await interaction.goto(new URL('./tools', baseUrl).href, { waitUntil: 'networkidle' })
for (let index = 0; index < 4; index += 1) {
  await interaction.getByRole('button', { name: 'Add to comparison' }).nth(index).click()
}
if (!(await interaction.getByText('3/3 selected').isVisible())) problems.push('Three-tool comparison state did not render')
if (!(await interaction.getByText(/Comparison is limited to three tools/).isVisible())) problems.push('Comparison limit feedback did not render')

await interaction.goto(new URL('./skills/source-triangulation', baseUrl).href, { waitUntil: 'networkidle' })
await interaction.getByRole('button', { name: 'Copy prompt' }).click()
try {
  await interaction.getByText('Prompt copied to your clipboard.').waitFor({ state: 'visible', timeout: 2000 })
} catch {
  problems.push('Copy feedback did not render')
}
await interaction.goto(new URL('./find-a-skill', baseUrl).href, { waitUntil: 'networkidle' })
const permissionChecks = interaction.getByRole('checkbox')
for (let index = 0; index < await permissionChecks.count(); index += 1) await permissionChecks.nth(index).check()
if (!(await interaction.getByText('Review checklist complete').isVisible())) problems.push('Permission checklist summary did not update')
await interaction.close()
await browser.close()

console.log(JSON.stringify({ baseUrl, results, problems }, null, 2))
if (problems.length) process.exitCode = 1
