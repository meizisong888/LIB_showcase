import { describe, expect, it } from 'vitest'
import { tools } from '../data/tools'
import type { FinderAnswers, Tool } from '../types'
import { recommendTools } from './recommend'

const base: FinderAnswers = {
  taskId: 'brainstorming-writing',
  requiresProvidedSources: false,
  needsFileUpload: false,
  needsProgrammingOrApi: false,
  sensitivity: 'public',
  hasArcAccount: false,
}

const resultIds = (answers: FinderAnswers, catalog = tools) => {
  const result = recommendTools(answers, catalog)
  return [result.primary, ...result.alternatives].filter(Boolean).map((item) => item!.tool.id)
}

describe('student access hard filter', () => {
  it('never recommends employee-only or limited-pilot records', () => {
    const employeeOnly: Tool = { ...tools[0], id: 'employee-only-fixture', name: 'Employee fixture', status: 'employee-only', studentAvailability: 'employee-only' }
    const limitedPilot: Tool = { ...tools[0], id: 'pilot-fixture', name: 'Pilot fixture', status: 'limited-pilot', studentAvailability: 'limited-pilot' }
    const ids = resultIds(base, [employeeOnly, limitedPilot, ...tools])
    expect(ids).not.toContain(employeeOnly.id)
    expect(ids).not.toContain(limitedPilot.id)
  })

  it('does not recommend ARC Open OnDemand without an ARC account', () => {
    expect(resultIds({ ...base, taskId: 'research-api', needsProgrammingOrApi: true })).not.toContain('arc-open-ondemand')
    expect(resultIds({ ...base, taskId: 'research-api', needsProgrammingOrApi: true, hasArcAccount: true })).toContain('arc-open-ondemand')
  })
})

describe('safety and scope hard filters', () => {
  it.each([
    ['brainstorming-writing', 'hokieai'],
    ['revising-writing', 'hokieai'],
    ['summarizing-readings', 'notebooklm-vt'],
    ['source-questions', 'notebooklm-vt'],
    ['coding-debugging', 'hokieai'],
    ['research-api', 'arc-llm-gateway'],
    ['image-multimodal', 'gemini-vt'],
    ['quick-questions', 'hokieai'],
  ] as const)('returns a documented student fit for %s', (taskId, expectedId) => {
    expect(recommendTools({ ...base, taskId }).primary?.tool.id).toBe(expectedId)
  })

  it('returns no AI recommendation for export-controlled data or CUI', () => {
    const result = recommendTools({ ...base, sensitivity: 'controlled' })
    expect(result.halted).toBe(true)
    expect(result.primary).toBeUndefined()
    expect(result.alternatives).toEqual([])
    expect(result.message).toBe('No verified Virginia Tech student AI tool currently matches all of these requirements.')
    expect(result.safetyMessage).toContain('not authorized')
  })

  it('never includes excluded external products in recommendations', () => {
    const excludedNames = ['chat' + 'gpt', 'cla' + 'ude', 'per' + 'plexity', 'git' + 'hub copilot']
    const shippedNames = tools.map((tool) => tool.name.toLowerCase())
    excludedNames.forEach((name) => expect(shippedNames.some((toolName) => toolName.includes(name))).toBe(false))
    excludedNames.forEach((name) => expect(resultIds(base).some((id) => id.toLowerCase().includes(name))).toBe(false))
  })

  it('applies required capabilities before task scoring', () => {
    const result = recommendTools({ ...base, taskId: 'source-questions', requiresProvidedSources: true, needsFileUpload: true })
    expect(result.primary?.tool.id).toBe('notebooklm-vt')
    expect(result.notSelected.find((item) => item.tool.id === 'gemini-vt')?.exclusionStage).toBe('required-capability')
  })

  it('returns at most two alternatives', () => {
    expect(recommendTools(base).alternatives.length).toBeLessThanOrEqual(2)
  })

  it('returns the canonical no-match state instead of an external fallback', () => {
    const result = recommendTools({ ...base, taskId: 'research-api', requiresProvidedSources: true, needsFileUpload: true, needsProgrammingOrApi: true })
    expect(result.halted).toBe(true)
    expect(result.message).toBe('No verified Virginia Tech student AI tool currently matches all of these requirements.')
  })

  it('does not show a capability-only alternative without documented task support', () => {
    const result = recommendTools({ ...base, taskId: 'revising-writing', needsProgrammingOrApi: true, hasArcAccount: true })
    expect(result.primary?.tool.id).toBe('hokieai')
    expect(result.alternatives).toEqual([])
    expect(result.notSelected.find((item) => item.tool.id === 'arc-llm-gateway')?.exclusionStage).toBe('task-fit')
  })
})
