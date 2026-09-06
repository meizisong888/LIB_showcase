import { tools } from '../data/tools'
import type { FinderAnswers, RecommendationResult, Tool, ToolEvaluation, VerifiedCapability } from '../types'

const NO_MATCH = 'No verified Virginia Tech student AI tool currently matches all of these requirements.'

const sensitivityMessages: Record<FinderAnswers['sensitivity'], string> = {
  public: 'Public data may be used, but provide only what the task needs and verify the output.',
  internal: 'Use the correct VT institutional account. A personal account does not automatically receive Virginia Tech data protection.',
  sensitive: 'VT lists these institutional services as approved for high-risk data, but contracts, research protocols, and other rules can still require additional review.',
  controlled: 'Virginia Tech states that export-controlled data and Controlled Unclassified Information (CUI) are not authorized for use with any AI tool. Do not upload or enter this data.',
}

export function isStudentAccessible(tool: Tool, hasArcAccount: boolean): boolean {
  if (tool.status !== 'active-service' && tool.status !== 'conditional-access') return false
  if (tool.studentAvailability === 'all-vt-students') return true
  return tool.studentAvailability === 'arc-account-required' && hasArcAccount
}

function accessExclusion(tool: Tool, hasArcAccount: boolean): string {
  if (tool.studentAvailability === 'employee-only' || tool.status === 'employee-only') return 'Employee-only access is not eligible for a student recommendation.'
  if (tool.studentAvailability === 'limited-pilot' || tool.status === 'limited-pilot') return 'Limited-pilot access is not available to the general VT student population.'
  if (tool.studentAvailability === 'arc-account-required' && !hasArcAccount) return 'Requires an ARC account; the student indicated they do not have one.'
  return 'No current VT source verifies general student eligibility for this tool.'
}

type CapabilityRequirement = {
  options: VerifiedCapability[]
  reason: string
}

function requiredCapabilities(answers: FinderAnswers): CapabilityRequirement[] {
  const requirements: CapabilityRequirement[] = []

  if (answers.taskId === 'source-questions') {
    requirements.push({ options: ['source-grounding'], reason: 'The selected task requires answers based on supplied sources.' })
    requirements.push({ options: ['file-upload'], reason: 'The selected task explicitly uses uploaded sources.' })
  }
  if (answers.taskId === 'coding-debugging') requirements.push({ options: ['coding'], reason: 'The selected task requires a verified coding capability.' })
  if (answers.taskId === 'image-multimodal') requirements.push({ options: ['multimodal-input', 'image-generation'], reason: 'The selected task requires a verified multimodal or image capability.' })
  if (answers.requiresProvidedSources) requirements.push({ options: ['source-grounding'], reason: 'The answer must be grounded in material supplied by the student.' })
  if (answers.needsFileUpload) requirements.push({ options: ['file-upload'], reason: 'The workflow requires a verified file-upload capability.' })
  if (answers.needsProgrammingOrApi) {
    if (answers.taskId === 'research-api') requirements.push({ options: ['api-access'], reason: 'This research/API workflow requires verified API access.' })
    else if (answers.taskId !== 'coding-debugging') requirements.push({ options: ['coding', 'api-access'], reason: 'The workflow requires a verified programming or API capability.' })
  }

  return requirements.filter((requirement, index, all) => all.findIndex((item) => item.options.join('|') === requirement.options.join('|')) === index)
}

function missingRequirements(tool: Tool, requirements: CapabilityRequirement[]): CapabilityRequirement[] {
  return requirements.filter((requirement) => !requirement.options.some((capability) => tool.verifiedCapabilities.includes(capability)))
}

function scoreTool(tool: Tool, answers: FinderAnswers, requirements: CapabilityRequirement[]): ToolEvaluation {
  const taskSupport = tool.supportedTasks.find((support) => support.taskId === answers.taskId)
  let score = taskSupport?.fit === 'strong' ? 4 : taskSupport?.fit === 'supported' ? 2 : 0
  if (tool.studentAvailability === 'all-vt-students') score += 1
  if (answers.requiresProvidedSources && tool.verifiedCapabilities.includes('source-grounding')) score += 1
  if (answers.needsFileUpload && tool.verifiedCapabilities.includes('file-upload')) score += 1

  const matchReasons = [
    taskSupport?.reason ?? 'The required capability is verified, but VT does not identify this as a primary task for the tool.',
    ...requirements.map((requirement) => requirement.reason),
    `${tool.name} is approved for the selected ${answers.sensitivity} data category when used in the stated VT account context.`,
  ]

  return { tool, score, matchReasons: [...new Set(matchReasons)] }
}

export function recommendTools(answers: FinderAnswers, catalog: Tool[] = tools): RecommendationResult {
  const evaluations = new Map<string, ToolEvaluation>()

  // 1. Student access eligibility hard filter.
  const accessEligible = catalog.filter((tool) => {
    const eligible = isStudentAccessible(tool, answers.hasArcAccount)
    if (!eligible) evaluations.set(tool.id, { tool, score: 0, matchReasons: [], exclusionStage: 'student-access', exclusionReason: accessExclusion(tool, answers.hasArcAccount) })
    return eligible
  })

  // 2. Data-use hard filter. CUI and export-controlled data stop here for every tool.
  const dataEligible = accessEligible.filter((tool) => {
    const eligible = answers.sensitivity !== 'controlled' && tool.dataRiskApproval.includes(answers.sensitivity)
    if (!eligible) evaluations.set(tool.id, {
      tool,
      score: 0,
      matchReasons: [],
      exclusionStage: 'data-use',
      exclusionReason: answers.sensitivity === 'controlled'
        ? 'VT prohibits export-controlled data and CUI in every AI tool.'
        : `The official evidence does not approve this tool for ${answers.sensitivity} university data.`,
    })
    return eligible
  })

  // 3. Required-capability hard filter.
  const requirements = requiredCapabilities(answers)
  const capabilityEligible = dataEligible.filter((tool) => {
    const missing = missingRequirements(tool, requirements)
    if (missing.length) evaluations.set(tool.id, {
      tool,
      score: 0,
      matchReasons: [],
      exclusionStage: 'required-capability',
      exclusionReason: missing.map((requirement) => requirement.reason).join(' '),
    })
    return missing.length === 0
  })

  // 4. Task-fit scoring only happens after all hard filters pass.
  const taskEligible = capabilityEligible.filter((tool) => {
    const supported = tool.supportedTasks.some((task) => task.taskId === answers.taskId)
    if (!supported) evaluations.set(tool.id, {
      tool,
      score: 0,
      matchReasons: [],
      exclusionStage: 'task-fit',
      exclusionReason: 'The reviewed VT sources do not explicitly support this selected task for the tool.',
    })
    return supported
  })
  const scored = taskEligible
    .map((tool) => scoreTool(tool, answers, requirements))
    .sort((a, b) => b.score - a.score || catalog.indexOf(a.tool) - catalog.indexOf(b.tool))
  scored.forEach((evaluation) => evaluations.set(evaluation.tool.id, evaluation))

  const primary = scored[0]
  const notSelected = catalog
    .filter((tool) => tool.id !== primary?.tool.id)
    .map((tool) => evaluations.get(tool.id)!)
    .filter(Boolean)

  if (!primary) {
    return {
      halted: true,
      message: NO_MATCH,
      safetyMessage: sensitivityMessages[answers.sensitivity],
      alternatives: [],
      notSelected,
    }
  }

  return {
    halted: false,
    message: 'Best fit among currently verified VT-supported student tools.',
    safetyMessage: sensitivityMessages[answers.sensitivity],
    primary,
    alternatives: scored.slice(1, 3),
    notSelected,
  }
}
