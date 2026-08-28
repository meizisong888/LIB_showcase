import { skillBySlug, skills } from '../data/skills'
import { defaultHumanChecklist, safetyMessages, scoringWeights } from '../data/recommendationRules'
import { taskById } from '../data/tasks'
import { tools } from '../data/tools'
import type { FinderAnswers, RecommendationResult, ScoreReason, ScoredTool, Tool } from '../types'

function scoreTool(tool: Tool, answers: FinderAnswers): ScoredTool {
  const reasons: ScoreReason[] = []
  const exclusions: string[] = []

  const add = (label: string, points: number, detail: string) => reasons.push({ label, points, detail })

  if (!tool.dataLevels.includes(answers.sensitivity)) {
    exclusions.push(`Not eligible for ${answers.sensitivity} data under this guide's current VT evidence boundary.`)
  }

  if (tool.taskIds.includes(answers.taskId)) add('Task fit', scoringWeights.taskMatch, 'The documented capability profile fits this task category.')
  else add('Task fit', -3, 'This is outside the tool’s focused task profile.')

  if (tool.inputTypes.some((item) => item.toLowerCase().includes(answers.inputType.toLowerCase()))) {
    add('Input fit', scoringWeights.inputMatch, `Supports ${answers.inputType} inputs.`)
  }

  const outputTerms: Record<string, string[]> = {
    brief: ['text', 'answers', 'summaries', 'analysis'],
    document: ['text', 'office content', 'artifacts'],
    presentation: ['office content', 'slide drafts', 'artifacts'],
    analysis: ['analysis', 'research reports', 'summaries'],
    code: ['code', 'code changes', 'pull requests'],
    'action-log': ['text', 'summaries', 'office content'],
  }
  const requestedOutputs = outputTerms[answers.outputType] ?? [answers.outputType]
  const outputMatches = tool.outputTypes.some((item) => requestedOutputs.some((term) => item.toLowerCase().includes(term)))
  add('Output fit', outputMatches ? scoringWeights.outputMatch : -2, outputMatches ? `Can produce the requested ${answers.outputType} format or its building blocks.` : `The ${answers.outputType} output may require manual transfer or restructuring.`)

  if (answers.needsWeb) add('Live web', tool.webAccess ? scoringWeights.webRequired : -5, tool.webAccess ? 'Can retrieve current web information.' : 'No verified live-web capability in this profile.')

  if (answers.citations) {
    const points = tool.citations === 'strong' ? scoringWeights.citationsStrong : tool.citations === 'available' ? scoringWeights.citationsAvailable : -4
    add('Sources', points, tool.citations === 'strong' ? 'Designed to expose source links or source-grounded citations.' : tool.citations === 'available' ? 'Can provide sources, but coverage varies and requires close checking.' : 'Not designed around traceable citations.')
  }

  if (answers.editFiles) {
    const accessLacksPaidEditing = tool.fileEditingRequiresPaid && (answers.access === 'free' || answers.access === 'vt')
    const points = !tool.fileEditing ? -4 : accessLacksPaidEditing ? -1 : scoringWeights.fileEditing
    const detail = !tool.fileEditing
      ? 'Primarily analyzes or drafts rather than editing source files directly.'
      : accessLacksPaidEditing
        ? 'File editing requires a paid or separately licensed tier outside the stated access constraint.'
        : 'Can edit or create files in an eligible workflow.'
    add('File editing', points, detail)
  }

  if (answers.coding) {
    const points = tool.coding === 'strong' ? scoringWeights.codingStrong : tool.coding === 'capable' ? scoringWeights.codingCapable : -6
    add('Coding', points, `${tool.coding[0].toUpperCase()}${tool.coding.slice(1)} coding profile.`)
  }

  if (answers.collaboration) add('Collaboration', tool.collaboration ? scoringWeights.collaboration : -2, tool.collaboration ? 'Supports shared or ecosystem-based work.' : 'Mostly an individual workflow.')

  if (answers.ecosystem !== 'none') {
    add('Ecosystem', tool.ecosystems.includes(answers.ecosystem) ? scoringWeights.ecosystem : -2, tool.ecosystems.includes(answers.ecosystem) ? `Matches the ${answers.ecosystem} ecosystem.` : `Does not directly match the ${answers.ecosystem} ecosystem.`)
  }

  const accessMatches = answers.access === 'any'
    || (answers.access === 'free' && (tool.accessKinds.includes('free') || tool.accessKinds.includes('vt')))
    || tool.accessKinds.includes(answers.access)
  add('Access', accessMatches ? scoringWeights.accessMatch : -3, accessMatches ? 'Fits the stated access constraint.' : 'May require a different account or paid license.')

  if (tool.learningCurve === 'low') add('Learning effort', scoringWeights.easyStart, 'Low setup and learning overhead.')

  return {
    tool,
    score: reasons.reduce((total, reason) => total + reason.points, 0),
    reasons,
    exclusions,
  }
}

export function recommendTools(answers: FinderAnswers): RecommendationResult {
  const safetyMessage = safetyMessages[answers.sensitivity]
  if (answers.sensitivity === 'unknown') {
    return { halted: true, safetyMessage, alternatives: [], closeCall: false, humanChecklist: defaultHumanChecklist }
  }

  const ranked = tools
    .map((tool) => scoreTool(tool, answers))
    .filter((item) => item.exclusions.length === 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))

  if (ranked.length === 0) {
    return {
      halted: true,
      safetyMessage: `${safetyMessage} No eligible tool remains under the selected constraints. Use a human-only or locally approved workflow.`,
      alternatives: [], closeCall: false, humanChecklist: defaultHumanChecklist,
    }
  }

  const task = taskById[answers.taskId]
  const workflowSkill = task ? skillBySlug[task.recommendedSkillSlug] : undefined
  const installableSkill = answers.coding && answers.sensitivity === 'public'
    ? skills.find((skill) => skill.slug === (answers.ecosystem === 'github' ? 'github-copilot-agent-mode' : 'claude-code-agent'))
    : undefined
  const closeCall = ranked.length > 1 && ranked[0].score - ranked[1].score <= 2

  return {
    halted: false,
    safetyMessage,
    primary: ranked[0],
    alternatives: ranked.slice(1, 3),
    closeCall,
    workflowSkill,
    installableSkill,
    humanChecklist: defaultHumanChecklist,
  }
}
