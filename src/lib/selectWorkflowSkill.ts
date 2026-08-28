import { skills } from '../data/skills'
import type { FinderAnswers, Skill } from '../types'

export interface WorkflowSkillSelection {
  skill?: Skill
  reasons: string[]
}

const inputSignals: Record<string, string[]> = {
  documents: ['documents'],
  spreadsheets: ['data-analysis'],
  code: ['coding'],
  audio: ['meetings'],
  images: ['presentations', 'teaching'],
  text: ['admin-writing'],
}

const outputSignals: Record<string, string[]> = {
  brief: ['research'],
  document: ['admin-writing', 'documents'],
  presentation: ['presentations'],
  analysis: ['data-analysis'],
  code: ['coding'],
  'action-log': ['meetings'],
}

function addMatch(score: { value: number }, reasons: string[], points: number, reason: string) {
  score.value += points
  reasons.push(reason)
}

export function selectWorkflowSkill(answers: FinderAnswers, primaryToolId?: string): WorkflowSkillSelection {
  const candidates = skills.filter((skill) => skill.type === 'workflow').map((skill) => {
    const score = { value: 0 }
    const reasons: string[] = []

    if (skill.category === answers.taskId) addMatch(score, reasons, 12, 'Directly matches the selected task.')
    if (skill.roles.includes(answers.role)) addMatch(score, reasons, 3, `Includes guidance for the ${answers.role} role.`)
    if (primaryToolId && skill.compatibleTools.includes(primaryToolId)) addMatch(score, reasons, 4, 'Works with the primary product recommendation.')
    if (inputSignals[answers.inputType]?.includes(skill.category)) addMatch(score, reasons, 6, `Its workflow is designed for ${answers.inputType} input.`)
    if (outputSignals[answers.outputType]?.includes(skill.category)) addMatch(score, reasons, 7, `Its steps produce the requested ${answers.outputType} output.`)

    if (answers.citations && skill.slug === 'citation-verification') addMatch(score, reasons, 7, 'Adds a claim-level citation verification pass.')
    if (answers.citations && skill.slug === 'source-triangulation') addMatch(score, reasons, 5, 'Builds an inspectable source trail.')
    if (answers.needsWeb && skill.requiresWeb) addMatch(score, reasons, 3, 'Supports a current-web evidence workflow.')
    if (answers.sensitivity !== 'public' && skill.requiresAuth) addMatch(score, reasons, 2, 'Includes an authenticated-workflow boundary for nonpublic data.')
    if (answers.sensitivity === 'restricted' && ['data-analysis-audit', 'document-grounded-summary', 'code-change-loop'].includes(skill.slug)) addMatch(score, reasons, 2, 'Makes data minimization and bounded review explicit for restricted material.')
    if (answers.editFiles && ['administrative-draft', 'presentation-storyboard', 'code-change-loop'].includes(skill.slug)) addMatch(score, reasons, 3, 'Includes a reviewable artifact handoff.')
    if (answers.coding && skill.slug === 'code-change-loop') addMatch(score, reasons, 10, 'Adds bounded edits, tests, and diff review.')
    if (answers.coding && skill.slug === 'data-analysis-audit') addMatch(score, reasons, 3, 'Adds reproducibility checks for generated analysis code.')

    if (answers.role === 'faculty' && answers.taskId === 'teaching' && skill.slug === 'lesson-design-review') addMatch(score, reasons, 4, 'Checks learning alignment and student-facing AI expectations.')
    if (answers.role === 'staff' && answers.taskId === 'admin-writing' && skill.slug === 'administrative-draft') addMatch(score, reasons, 4, 'Preserves decisions, owners, and open questions.')
    if (answers.role === 'staff' && answers.taskId === 'meetings' && skill.slug === 'meeting-action-log') addMatch(score, reasons, 4, 'Separates discussion from confirmed decisions and owners.')
    if (answers.role === 'researcher' && answers.taskId === 'data-analysis' && skill.slug === 'data-analysis-audit') addMatch(score, reasons, 4, 'Adds a reproducible, assumption-aware audit trail.')

    return { skill, score: score.value, reasons }
  }).sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))

  return { skill: candidates[0]?.skill, reasons: candidates[0]?.reasons.slice(0, 8) ?? [] }
}
