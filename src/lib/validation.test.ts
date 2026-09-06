import { describe, expect, it } from 'vitest'
import { tools } from '../data/tools'
import { validateTool } from './validation'

describe('verified VT tool records', () => {
  it('validates every shipped record', () => {
    expect(tools.flatMap((tool) => validateTool(tool).errors)).toEqual([])
  })

  it('keeps exactly five core student tools and one fully conditional ARC option', () => {
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

  it('binds every capability to resolvable specific official source IDs', () => {
    tools.forEach((tool) => {
      const sourceIds = new Set(tool.officialSources.map((source) => source.id))
      tool.verifiedCapabilities.forEach((record) => {
        expect(record.sourceIds.length).toBeGreaterThan(0)
        expect(record.evidenceSummary).not.toBe('')
        record.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true))
      })
    })
  })

  it('binds every task fit, including every strong fit, to resolvable source IDs', () => {
    tools.forEach((tool) => {
      const sourceIds = new Set(tool.officialSources.map((source) => source.id))
      tool.supportedTasks.forEach((record) => {
        expect(record.sourceIds.length).toBeGreaterThan(0)
        expect(record.evidenceSummary).not.toBe('')
        record.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true))
      })
    })
  })

  it('rejects missing evidence, unknown source IDs, and non-VT evidence domains', () => {
    expect(validateTool({ ...tools[0], officialSources: [] }).valid).toBe(false)
    const unknownCapabilitySource = {
      ...tools[0],
      verifiedCapabilities: [{ ...tools[0].verifiedCapabilities[0], sourceIds: ['missing-source'] }, ...tools[0].verifiedCapabilities.slice(1)],
    }
    expect(validateTool(unknownCapabilitySource).errors).toContain(`Capability ${tools[0].verifiedCapabilities[0].capability} references unknown source missing-source.`)
    const invalidSource = { ...tools[0].officialSources[0], url: 'https://example.com/tool' }
    expect(validateTool({ ...tools[0], officialSources: [invalidSource, ...tools[0].officialSources.slice(1)] }).errors).toContain(`Unapproved evidence domain for ${invalidSource.id}.`)
  })

  it('rejects employee-only and limited-pilot records from the recommendation catalog', () => {
    const employee = { ...tools[0], id: 'employee-fixture', status: 'employee-only' as const, studentAvailability: 'employee-only' as const }
    const pilot = { ...tools[0], id: 'pilot-fixture', status: 'limited-pilot' as const, studentAvailability: 'limited-pilot' as const }
    expect(validateTool(employee).valid).toBe(false)
    expect(validateTool(pilot).valid).toBe(false)
  })
})
