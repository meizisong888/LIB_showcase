import { describe, expect, it } from 'vitest'
import { profileForGoal } from '../data/tasks'
import { tools } from '../data/tools'
import type { TaskGoal, TaskProfile, Tool } from '../types'
import { FIT_DISCLAIMER, NO_MATCH, recommendTools, requiredCapabilities } from './recommend'

const taskProfile = (goal: TaskGoal, overrides: Partial<TaskProfile> = {}): TaskProfile => ({ ...profileForGoal(goal), ...overrides })
const shownIds = (profile: TaskProfile, catalog = tools) => {
  const result = recommendTools(profile, catalog)
  return [...result.topMatches, ...result.alternatives].map((item) => item.tool.id)
}
const topIds = (profile: TaskProfile, catalog = tools) => recommendTools(profile, catalog).topMatches.map((item) => item.tool.id)

describe('deterministic ranking and ties', () => {
  it('returns the same recommendation for repeated identical input', () => {
    const profile = taskProfile('brainstorm-first-draft')
    const signature = () => {
      const result = recommendTools(profile)
      return { kind: result.kind, top: result.topMatches.map((item) => item.tool.id), alternatives: result.alternatives.map((item) => item.tool.id) }
    }
    expect(signature()).toEqual(signature())
    expect(signature()).toEqual(signature())
  })

  it('keeps the same highest-match set for reversed and shuffled catalog orders', () => {
    const profile = taskProfile('brainstorm-first-draft')
    const expected = topIds(profile)
    const shuffled = [tools[3], tools[0], tools[5], tools[2], tools[4], tools[1]]
    expect(topIds(profile, [...tools].reverse())).toEqual(expected)
    expect(topIds(profile, shuffled)).toEqual(expected)
  })

  it('labels genuine top ties and returns every tied tool alphabetically', () => {
    const result = recommendTools(taskProfile('brainstorm-first-draft'))
    expect(result.kind).toBe('tie')
    expect(result.message).toBe('Equally suitable verified matches')
    expect(result.topMatches.map((item) => item.tool.id)).toEqual(['gemini-vt', 'hokieai', 'copilot-chat-vt'])
    expect(FIT_DISCLAIMER).toContain('not a Virginia Tech ranking')
  })
})

describe('independent mandatory capabilities', () => {
  it('makes NotebookLM the unique top match for source-grounded file work', () => {
    const result = recommendTools(taskProfile('questions-provided-sources'))
    expect(result.kind).toBe('unique')
    expect(result.topMatches.map((item) => item.tool.id)).toEqual(['notebooklm-vt'])
  })

  it('keeps only tools with separately verified web-search and citation capabilities', () => {
    const result = recommendTools(taskProfile('research-web-citations'))
    expect(shownIds(taskProfile('research-web-citations'))).toEqual(['copilot-chat-vt'])
    expect(result.requirements.map((item) => item.capability)).toEqual(['web-search', 'citations'])
    expect(result.notSelected.find((item) => item.tool.id === 'arc-llm-gateway')?.exclusionReason).toContain('Citations')
  })

  it('does not turn a coding task into an API requirement', () => {
    const profile = taskProfile('coding-debugging')
    expect(requiredCapabilities(profile).map((item) => item.capability)).toEqual(['coding'])
    expect(topIds(profile)).toEqual(['arc-llm-gateway', 'hokieai'])
  })

  it('does not let coding-only tools pass an API requirement', () => {
    const result = recommendTools(taskProfile('api-research-workflow'))
    expect(result.topMatches.map((item) => item.tool.id)).toEqual(['arc-llm-gateway'])
    expect(result.notSelected.find((item) => item.tool.id === 'hokieai')?.exclusionStage).toBe('required-capability')
  })

  it('does not let image-generation-only tools pass multimodal input', () => {
    const result = recommendTools(taskProfile('multimodal-understanding'))
    expect(result.topMatches.map((item) => item.tool.id)).toEqual(['arc-llm-gateway', 'gemini-vt'])
    expect(result.notSelected.find((item) => item.tool.id === 'hokieai')?.exclusionReason).toContain('Understand an image')
    expect(result.notSelected.find((item) => item.tool.id === 'copilot-chat-vt')?.exclusionStage).toBe('required-capability')
  })

  it('does not assume image generation requires or proves image understanding', () => {
    const generationOnly = taskProfile('image-generation')
    expect(requiredCapabilities(generationOnly).map((item) => item.capability)).toEqual(['image-generation'])
    expect(topIds(generationOnly)).toContain('hokieai')
    expect(tools.find((tool) => tool.id === 'hokieai')!.verifiedCapabilities.map((item) => item.capability)).not.toContain('multimodal-input')
    const editingExistingInput = taskProfile('image-generation', { needsMultimodalInput: true })
    expect(topIds(editingExistingInput)).not.toContain('hokieai')
  })
})

describe('access, ARC, and data hard filters', () => {
  it('never recommends employee-only or limited-pilot records', () => {
    const employeeOnly: Tool = { ...tools[0], id: 'employee-only-fixture', name: 'Employee fixture', status: 'employee-only', studentAvailability: 'employee-only' }
    const limitedPilot: Tool = { ...tools[0], id: 'pilot-fixture', name: 'Pilot fixture', status: 'limited-pilot', studentAvailability: 'limited-pilot' }
    const ids = shownIds(taskProfile('brainstorm-first-draft'), [employeeOnly, limitedPilot, ...tools])
    expect(ids).not.toContain(employeeOnly.id)
    expect(ids).not.toContain(limitedPilot.id)
  })

  it('excludes ARC Open OnDemand without an ARC account', () => {
    const result = recommendTools(taskProfile('api-research-workflow'))
    expect(shownIds(taskProfile('api-research-workflow'))).not.toContain('arc-open-ondemand')
    expect(result.notSelected.find((item) => item.tool.id === 'arc-open-ondemand')?.exclusionStage).toBe('arc-conditions')
  })

  it('still excludes ARC Open OnDemand with an account but no allocation', () => {
    const profile = taskProfile('api-research-workflow', { hasArcAccount: true })
    expect(shownIds(profile)).not.toContain('arc-open-ondemand')
    expect(recommendTools(profile).notSelected.find((item) => item.tool.id === 'arc-open-ondemand')?.exclusionReason).toContain('active ARC allocation')
  })

  it('makes Open OnDemand the top match only for a fully qualified dedicated workflow', () => {
    const profile = taskProfile('api-research-workflow', {
      needsDedicatedInstance: true,
      hasArcAccount: true,
      hasArcAllocation: true,
      canUseVtNetworkOrVpn: true,
    })
    expect(topIds(profile)).toEqual(['arc-open-ondemand'])
  })

  it('returns zero tools for export-controlled data or CUI', () => {
    const result = recommendTools(taskProfile('brainstorm-first-draft', { sensitivity: 'controlled' }))
    expect(result.halted).toBe(true)
    expect(result.kind).toBe('none')
    expect(result.topMatches).toEqual([])
    expect(result.alternatives).toEqual([])
    expect(result.message).toBe(NO_MATCH)
    expect(result.safetyMessage).toContain('not authorized')
  })

  it('uses the canonical no-match state instead of weakening mandatory features', () => {
    const result = recommendTools(taskProfile('api-research-workflow', { needsCoding: true, needsDedicatedInstance: true }))
    expect(result.halted).toBe(true)
    expect(result.message).toBe(NO_MATCH)
  })
})

describe('official access targets', () => {
  it('stores the exact direct href and action label for every catalog tool', () => {
    expect(Object.fromEntries(tools.map((tool) => [tool.id, [tool.accessCta, tool.accessUrl]]))).toEqual({
      hokieai: ['Open HokieAI', 'https://hokie.ai.vt.edu/'],
      'gemini-vt': ['Open Gemini with your VT account', 'https://gemini.google.com/'],
      'notebooklm-vt': ['Open NotebookLM with your VT account', 'https://notebooklm.google.com/'],
      'copilot-chat-vt': ['Open Copilot Chat with your VT account', 'https://copilot.microsoft.com/'],
      'arc-llm-gateway': ['Open ARC LLM Gateway', 'https://llm.arc.vt.edu/'],
      'arc-open-ondemand': ['Open ARC Open OnDemand', 'https://ood.arc.vt.edu/'],
    })
  })
})
