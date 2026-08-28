import { describe, expect, it } from 'vitest'
import { tasks } from '../data/tasks'
import { tools } from '../data/tools'
import { fitLabels } from './toolFit'

describe('documented capability fit data', () => {
  it('defines all four human-readable levels and every task-tool cell', () => {
    expect(Object.values(fitLabels)).toEqual(['Strong', 'Capable', 'Conditional', 'Not focused'])
    tools.forEach((tool) => expect(Object.keys(tool.taskFit).sort()).toEqual(tasks.map((task) => task.id).sort()))
  })

  it('uses stable product families', () => {
    expect(new Set(tools.map((tool) => tool.family))).toEqual(new Set(['general', 'research', 'office', 'coding']))
  })
})
