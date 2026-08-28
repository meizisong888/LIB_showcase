import { skills } from '../data/skills'
import { defaultHumanChecklist, roleHumanChecks, safetyMessages, scoringWeights } from '../data/recommendationRules'
import { tools } from '../data/tools'
import type { FinderAnswers, FitLevel, RecommendationResult, ScoreReason, ScoredTool, Tool } from '../types'
import { selectWorkflowSkill } from './selectWorkflowSkill'

const taskPoints: Record<FitLevel, number> = {
  strong: scoringWeights.taskStrong,
  capable: scoringWeights.taskCapable,
  conditional: scoringWeights.taskConditional,
  'not-focused': scoringWeights.taskNotFocused,
}

const taskDetails: Record<FitLevel, string> = {
  strong: 'Documented features directly support this task.',
  capable: 'Documented features support the task with some manual assembly or checking.',
  conditional: 'Useful for a narrower part of the task or under specific workflow conditions.',
  'not-focused': 'This task is outside the product’s documented focus in this guide.',
}

function recommendationFit(taskFit: FitLevel, score: number): ScoredTool['fit'] {
  if (taskFit === 'strong' && score >= 15) return 'strong'
  if ((taskFit === 'strong' || taskFit === 'capable') && score >= 6) return 'capable'
  return 'conditional'
}

function scoreTool(tool: Tool, answers: FinderAnswers): ScoredTool {
  const reasons: ScoreReason[] = []
  const exclusions: string[] = []
  const add = (label: string, points: number, detail: string) => reasons.push({ label, points, detail })

  if (!tool.dataLevels.includes(answers.sensitivity)) exclusions.push(`Not eligible for ${answers.sensitivity} data under this guide’s current VT evidence boundary.`)

  const taskFit = tool.taskFit[answers.taskId] ?? 'not-focused'
  add('Task capability', taskPoints[taskFit], taskDetails[taskFit])

  const inputMatch = tool.inputTypes.some((item) => item.toLowerCase().includes(answers.inputType.toLowerCase()))
  add('Input', inputMatch ? scoringWeights.inputMatch : -2, inputMatch ? `Supports ${answers.inputType} inputs.` : `The ${answers.inputType} input may need manual conversion.`)

  const outputTerms: Record<string, string[]> = {
    brief: ['text', 'answers', 'summaries', 'analysis'], document: ['text', 'office content', 'artifacts'],
    presentation: ['office content', 'slide drafts', 'artifacts'], analysis: ['analysis', 'research reports', 'summaries'],
    code: ['code', 'code changes', 'pull requests'], 'action-log': ['text', 'summaries', 'office content'],
  }
  const requestedOutputs = outputTerms[answers.outputType] ?? [answers.outputType]
  const outputMatch = tool.outputTypes.some((item) => requestedOutputs.some((term) => item.toLowerCase().includes(term)))
  add('Output', outputMatch ? scoringWeights.outputMatch : -2, outputMatch ? `Can produce the requested ${answers.outputType} format or its building blocks.` : `The ${answers.outputType} output needs manual transfer or restructuring.`)

  if (answers.needsWeb) add('Current web', tool.webAccess ? scoringWeights.webRequired : -5, tool.webAccess ? 'Has a documented live-web capability.' : 'No verified live-web capability in this profile.')
  if (answers.citations) {
    const points = tool.citations === 'strong' ? scoringWeights.citationsStrong : tool.citations === 'available' ? scoringWeights.citationsAvailable : -4
    add('Source trail', points, tool.citations === 'strong' ? 'Designed to expose source links or source-grounded citations.' : tool.citations === 'available' ? 'Can provide sources, but coverage varies and needs close checking.' : 'Not designed around traceable citations.')
  }
  if (answers.editFiles) {
    const lacksEditingTier = tool.fileEditingRequiresPaid && (answers.access === 'free' || answers.access === 'vt')
    const points = !tool.fileEditing ? -4 : lacksEditingTier ? -1 : scoringWeights.fileEditing
    add('File handoff', points, !tool.fileEditing ? 'Drafts or analyzes rather than directly editing source files.' : lacksEditingTier ? 'Direct editing requires a separately licensed tier.' : 'Can edit or create files in an eligible workflow.')
  }
  if (answers.coding) {
    const points = tool.coding === 'strong' ? scoringWeights.codingStrong : tool.coding === 'capable' ? scoringWeights.codingCapable : -6
    add('Code work', points, `${tool.coding[0].toUpperCase()}${tool.coding.slice(1)} documented coding profile.`)
  }
  if (answers.collaborationMode !== 'individual') {
    const match = tool.collaborationModes.includes(answers.collaborationMode)
    add('Work setting', match ? scoringWeights.collaborationMatch : -3, match ? `Supports ${answers.collaborationMode.replaceAll('-', ' ')}.` : `Does not directly support ${answers.collaborationMode.replaceAll('-', ' ')} in this profile.`)
  }
  if (answers.ecosystem !== 'none') {
    const match = tool.ecosystems.includes(answers.ecosystem)
    add('Ecosystem', match ? scoringWeights.ecosystem : -2, match ? `Matches the ${answers.ecosystem} ecosystem.` : `Does not directly match the ${answers.ecosystem} ecosystem.`)
  }
  const accessMatches = answers.access === 'any'
    || (answers.access === 'free' && (tool.accessKinds.includes('free') || tool.accessKinds.includes('vt')))
    || tool.accessKinds.includes(answers.access)
  add('Account access', accessMatches ? scoringWeights.accessMatch : -3, accessMatches ? 'Fits the stated access constraint.' : 'May require a different account or paid license.')
  if (tool.learningCurve === 'low') add('Start-up effort', scoringWeights.easyStart, 'Low documented setup and learning overhead.')

  const score = reasons.reduce((total, reason) => total + reason.points, 0)
  return { tool, score, reasons, exclusions, fit: recommendationFit(taskFit, score) }
}

function buildHumanHandoff(answers: FinderAnswers) {
  const checks = [...defaultHumanChecklist, ...(roleHumanChecks[answers.role] ?? [])]
  const manual: string[] = ['Make the final consequential decision and approve anything sent, published, graded, or merged.']
  if (answers.citations) manual.push('Open the original sources and verify sentence-level support.')
  if (answers.editFiles) manual.push('Inspect the final file, sharing permissions, formatting, and accessibility in its destination application.')
  if (answers.coding) manual.push('Review the full diff, run tests in a controlled environment, and approve any merge or deployment.')
  if (answers.collaborationMode !== 'individual') manual.push('Confirm recipients, permissions, retention, and the accountable owner of the shared work.')
  if (answers.sensitivity !== 'public') manual.push('Verify the signed-in institutional account, data classification, and least-privilege access before upload.')
  return { checks: [...new Set(checks)], manual: [...new Set(manual)] }
}

export function recommendTools(answers: FinderAnswers): RecommendationResult {
  const safetyMessage = safetyMessages[answers.sensitivity]
  const handoff = buildHumanHandoff(answers)
  const roleGuidance = roleHumanChecks[answers.role]?.[0] ?? 'Keep an accountable human in the final review.'

  if (answers.sensitivity === 'unknown') {
    return { halted: true, safetyMessage, alternatives: [], excludedTools: [], closeCall: false, workflowReasons: [], humanChecklist: handoff.checks, roleGuidance, mustDoManually: handoff.manual }
  }

  const allScored = tools.map((tool) => scoreTool(tool, answers))
  const eligible = allScored.filter((item) => item.exclusions.length === 0).sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
  const excludedTools = allScored.filter((item) => item.exclusions.length > 0).sort((a, b) => b.score - a.score)
  if (eligible.length === 0) {
    return { halted: true, safetyMessage: `${safetyMessage} No eligible product remains under the selected boundary. Use a human-only or locally approved workflow.`, alternatives: [], excludedTools, closeCall: false, workflowReasons: [], humanChecklist: handoff.checks, roleGuidance, mustDoManually: handoff.manual }
  }

  const selection = selectWorkflowSkill(answers, eligible[0].tool.id)
  const installableSkill = answers.coding && answers.sensitivity === 'public'
    ? skills.find((skill) => skill.slug === (answers.ecosystem === 'github' ? 'github-copilot-agent-mode' : 'claude-code-agent'))
    : undefined

  return {
    halted: false, safetyMessage, primary: eligible[0], alternatives: eligible.slice(1, 3), excludedTools,
    closeCall: eligible.length > 1 && eligible[0].score - eligible[1].score <= 2,
    workflowSkill: selection.skill, workflowReasons: selection.reasons, installableSkill,
    humanChecklist: handoff.checks, roleGuidance, mustDoManually: handoff.manual,
  }
}
