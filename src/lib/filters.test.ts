import { describe, expect, it } from 'vitest'
import { skills } from '../data/skills'
import { tools } from '../data/tools'
import { filterSkills, filterTools, toggleComparison } from './filters'

describe('tool filters and comparison', () => {
  it('searches across provider and documented strengths', () => {
    expect(filterTools(tools, { search: 'source-grounded', category: '', capability: '' }).map((tool) => tool.id)).toContain('notebooklm-vt')
    expect(filterTools(tools, { search: 'Anthropic', category: '', capability: '' }).map((tool) => tool.id)).toEqual(['claude'])
  })

  it('combines category and capability filters', () => {
    const result = filterTools(tools, { search: '', category: 'Research and answer engine', capability: 'citations' })
    expect(result.map((tool) => tool.id)).toEqual(['perplexity'])
  })

  it('enforces a three-tool comparison limit and supports removal', () => {
    const selected = ['hokieai', 'gemini-vt', 'chatgpt']
    expect(toggleComparison(selected, 'claude')).toBe(selected)
    expect(toggleComparison(selected, 'gemini-vt')).toEqual(['hokieai', 'chatgpt'])
  })
})

describe('skill filters', () => {
  it('finds high-risk installable skills that execute code', () => {
    const result = filterSkills(skills, { search: '', category: '', role: '', tool: '', type: 'installable', inputType: '', risk: 'high', web: '', permission: 'code' })
    expect(result.map((skill) => skill.slug).sort()).toEqual(['claude-code-agent', 'github-copilot-agent-mode'])
  })

  it('filters by role, compatible tool, and internet need', () => {
    const result = filterSkills(skills, { search: '', category: '', role: 'faculty', tool: 'notebooklm-vt', type: '', inputType: '', risk: '', web: 'false', permission: '' })
    expect(result.map((skill) => skill.slug)).toContain('document-grounded-summary')
  })
})
