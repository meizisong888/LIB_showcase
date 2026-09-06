import { describe, expect, it } from 'vitest'
import { tools } from '../data/tools'
import { validateTool } from './validation'

describe('verified VT tool records', () => {
  it('validates every shipped record', () => {
    expect(tools.flatMap((tool) => validateTool(tool).errors)).toEqual([])
  })

  it('keeps exactly five core student tools and one ARC-account option', () => {
    expect(tools.filter((tool) => tool.studentAvailability === 'all-vt-students')).toHaveLength(5)
    expect(tools.filter((tool) => tool.studentAvailability === 'arc-account-required').map((tool) => tool.id)).toEqual(['arc-open-ondemand'])
  })

  it('requires official sources and verification dates for every recommendable tool', () => {
    tools.forEach((tool) => {
      expect(tool.officialSources.length).toBeGreaterThan(0)
      expect(tool.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      tool.officialSources.forEach((source) => expect(['ai.vt.edu', '4help.vt.edu', 'docs.arc.vt.edu']).toContain(new URL(source.url).hostname))
    })
  })

  it('rejects missing evidence and a non-VT evidence domain', () => {
    expect(validateTool({ ...tools[0], officialSources: [] }).valid).toBe(false)
    const invalidSource = { ...tools[0].officialSources[0], url: 'https://example.com/tool' }
    expect(validateTool({ ...tools[0], officialSources: [invalidSource] }).errors).toContain(`Unapproved evidence domain for ${invalidSource.id}.`)
  })
})
