import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173/LIB_showcase/'
const browser = await chromium.launch({ headless: true })
const problems = []

async function inspect(name, path, viewport, screenshot) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`${name} console: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`${name} page: ${error.message}`))
  const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' })
  if (!response?.ok()) problems.push(`${name} HTTP ${response?.status()}`)
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
results.push(await inspect('finder mobile', './recommend', { width: 390, height: 844 }, 'finder-mobile'))
results.push(await inspect('tools desktop', './tools', { width: 1440, height: 1000 }, 'tools-desktop'))
results.push(await inspect('skill desktop', './skills/code-change-loop', { width: 1440, height: 1000 }, 'skill-desktop'))

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
if (!(await interaction.getByText('Pause: classify the data first').isVisible())) problems.push('Unknown-data stop result did not render')

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
await interaction.close()
await browser.close()

console.log(JSON.stringify({ baseUrl, results, problems }, null, 2))
if (problems.length) process.exitCode = 1
