import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173/LIB_showcase/'
const browser = await chromium.launch({ headless: true })
const problems = []

async function inspect(name, path, viewport, prepare) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') problems.push(`${name} console: ${message.text()}`) })
  page.on('pageerror', (error) => problems.push(`${name} page: ${error.message}`))
  const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' })
  if (!response?.ok()) problems.push(`${name} HTTP ${response?.status()}`)
  if (prepare) await prepare(page)
  const metrics = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }))
  if (!metrics.h1) problems.push(`${name} has no h1`)
  if (metrics.horizontalOverflow) problems.push(`${name} has horizontal overflow at ${viewport.width}px`)
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  accessibility.violations.forEach((violation) => problems.push(`${name} accessibility ${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`))
  await page.screenshot({ path: `/tmp/vt-student-ai-${name.replaceAll(' ', '-')}.png`, fullPage: true })
  await context.close()
  return metrics
}

const submit = async (page) => page.getByRole('button', { name: 'Show verified matches' }).click()
const results = []
for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  const size = viewport.width > 1000 ? 'desktop' : 'mobile'
  results.push(await inspect(`home ${size}`, './', viewport))
  results.push(await inspect(`recommender ${size}`, './recommend?goal=questions-provided-sources&sensitivity=internal', viewport, submit))
  results.push(await inspect(`tools ${size}`, './tools', viewport))
  results.push(await inspect(`responsible ${size}`, './responsible-use', viewport))
}

const interaction = await browser.newPage({ viewport: { width: 390, height: 844 } })
interaction.on('console', (message) => { if (message.type() === 'error') problems.push(`interaction console: ${message.text()}`) })
interaction.on('pageerror', (error) => problems.push(`interaction page: ${error.message}`))
await interaction.goto(baseUrl, { waitUntil: 'networkidle' })
await interaction.getByRole('button', { name: 'Open menu' }).click()
if (!(await interaction.getByRole('navigation', { name: 'Primary navigation' }).isVisible())) problems.push('Mobile navigation did not open')
await interaction.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Task Recommender' }).click()
await interaction.getByRole('radio', { name: /Export-controlled data or CUI/i }).check()
if (!(await interaction.getByRole('heading', { name: 'Do not use an AI tool for this data' }).isVisible())) problems.push('Controlled-data stop did not render')
await interaction.close()
await browser.close()

console.log(JSON.stringify({ baseUrl, results, problems }, null, 2))
if (problems.length) process.exitCode = 1
