import { describe, expect, it } from 'vitest'
import type { FinderAnswers } from '../types'
import { recommendTools } from './recommend'

const base: FinderAnswers = {
  role: 'student', taskId: 'research', inputType: 'documents', outputType: 'brief', needsWeb: true,
  citations: true, editFiles: false, coding: false, collaborationMode: 'individual', ecosystem: 'none', sensitivity: 'public', access: 'any',
}

describe('recommendTools', () => {
  it('stops before scoring when classification is unknown', () => {
    const result = recommendTools({ ...base, sensitivity: 'unknown' })
    expect(result.halted).toBe(true)
    expect(result.primary).toBeUndefined()
    expect(result.safetyMessage).toContain('Do not upload')
  })

  it('excludes consumer-only products for internal data', () => {
    const result = recommendTools({ ...base, sensitivity: 'internal' })
    const ids = [result.primary, ...result.alternatives].filter(Boolean).map((item) => item!.tool.id)
    expect(result.halted).toBe(false)
    expect(ids).not.toContain('chatgpt')
    expect(ids).not.toContain('claude')
    expect(ids).not.toContain('perplexity')
  })

  it('prefers source-grounded NotebookLM for a VT Google research workflow', () => {
    const result = recommendTools({ ...base, sensitivity: 'restricted', ecosystem: 'google', access: 'vt' })
    expect(result.primary?.tool.id).toBe('notebooklm-vt')
    expect(result.primary?.reasons.some((reason) => reason.label === 'Source trail' && reason.points > 0)).toBe(true)
  })

  it('prefers GitHub Copilot for a public repository coding task', () => {
    const result = recommendTools({
      ...base, taskId: 'coding', inputType: 'code', outputType: 'code', needsWeb: false, citations: false,
      editFiles: true, coding: true, collaborationMode: 'repository-collaboration', ecosystem: 'github', access: 'free',
    })
    expect(result.primary?.tool.id).toBe('github-copilot')
    expect(result.installableSkill?.slug).toBe('github-copilot-agent-mode')
  })

  it('returns at most two alternatives and an audit checklist', () => {
    const result = recommendTools(base)
    expect(result.alternatives.length).toBeLessThanOrEqual(2)
    expect(result.humanChecklist.length).toBeGreaterThanOrEqual(5)
    expect(result.workflowReasons.length).toBeGreaterThan(0)
    expect(result.mustDoManually.length).toBeGreaterThan(0)
  })

  it('returns named safety exclusions and a user-facing fit band', () => {
    const result = recommendTools({ ...base, sensitivity: 'internal', access: 'vt' })
    expect(result.primary?.fit).toMatch(/strong|capable|conditional/)
    expect(result.excludedTools.map((item) => item.tool.id)).toContain('chatgpt')
    expect(result.excludedTools[0].exclusions[0]).toContain('Not eligible')
  })
})
