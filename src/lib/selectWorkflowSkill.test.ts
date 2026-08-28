import { describe, expect, it } from 'vitest'
import { scenarios } from '../data/scenarios'
import { selectWorkflowSkill } from './selectWorkflowSkill'

describe('selectWorkflowSkill', () => {
  it.each([
    ['student-source-brief', 'citation-verification'],
    ['faculty-lesson', 'lesson-design-review'],
    ['staff-actions', 'meeting-action-log'],
    ['researcher-audit', 'data-analysis-audit'],
  ])('selects a workflow from the full context for %s', (scenarioId, expected) => {
    const scenario = scenarios.find((item) => item.id === scenarioId)!
    expect(selectWorkflowSkill(scenario.answers).skill?.slug).toBe(expected)
  })

  it('changes the workflow when code and output needs change within a task', () => {
    const scenario = scenarios[0].answers
    const selection = selectWorkflowSkill({ ...scenario, taskId: 'coding', inputType: 'code', outputType: 'code', coding: true, citations: false, needsWeb: false })
    expect(selection.skill?.slug).toBe('code-change-loop')
    expect(selection.reasons.some((reason) => reason.includes('tests'))).toBe(true)
  })
})
