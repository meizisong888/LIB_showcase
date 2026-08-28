import { describe, expect, it } from 'vitest'
import { skills } from '../data/skills'
import { tools } from '../data/tools'
import type { Tool } from '../types'
import { displayStatus, validateSkill, validateTool } from './validation'

describe('content validation', () => {
  it('validates every shipped tool and skill', () => {
    expect(tools.flatMap((tool) => validateTool(tool).errors)).toEqual([])
    expect(skills.flatMap((skill) => validateSkill(skill).errors)).toEqual([])
  })

  it('prevents an incomplete item from displaying as verified', () => {
    const incomplete: Tool = { ...tools[0], sourceIds: [], verifiedAt: '' }
    const result = validateTool(incomplete)
    expect(result.valid).toBe(false)
    expect(displayStatus(incomplete.status, result)).toBe('needs-review')
  })

  it('requires permission metadata for installable skills', () => {
    const installable = skills.find((skill) => skill.type === 'installable')!
    expect(validateSkill({ ...installable, installable: undefined }).errors).toContain('Installable metadata is required.')
  })

  it('ships four complete educational workflow examples', () => {
    const examples = skills.filter((skill) => skill.example)
    expect(examples).toHaveLength(4)
    expect(examples.every((skill) => skill.provenance === 'project-curated')).toBe(true)
  })
})
