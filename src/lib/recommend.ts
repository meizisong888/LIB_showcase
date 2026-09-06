import { featureLabels, normalizeTaskProfile, profileLabel } from '../data/tasks'
import { tools } from '../data/tools'
import type { CapabilityRequirement, ProfileFeatureKey, RecommendationResult, TaskProfile, Tool, ToolEvaluation, VerifiedCapability } from '../types'
import { validateTool } from './validation'

export const NO_MATCH = 'No verified Virginia Tech student AI tool currently matches all of these requirements.'
export const FIT_DISCLAIMER = 'This project’s documented-fit classification based on official VT capabilities, not a Virginia Tech ranking or performance benchmark.'

const sensitivityMessages: Record<TaskProfile['sensitivity'], string> = {
  public: 'Public data may be used, but provide only what the task needs and verify the output.',
  internal: 'Use the correct VT institutional account. A personal account does not automatically receive Virginia Tech data protection.',
  sensitive: 'VT lists these institutional services as approved for high-risk data, but contracts, research protocols, and other rules can still require additional review.',
  controlled: 'Virginia Tech states that export-controlled data and Controlled Unclassified Information (CUI) are not authorized for use with any AI tool. Do not upload or enter this data.',
}

const capabilityByFeature: Record<ProfileFeatureKey, VerifiedCapability> = {
  needsFileUpload: 'file-upload',
  needsSourceGrounding: 'source-grounding',
  needsWebSearch: 'web-search',
  needsCitations: 'citations',
  needsCoding: 'coding',
  needsApiAccess: 'api-access',
  needsMultimodalInput: 'multimodal-input',
  needsImageGeneration: 'image-generation',
  needsDedicatedInstance: 'dedicated-instance',
}

const capabilityReasons: Record<ProfileFeatureKey, string> = {
  needsFileUpload: 'The workflow requires a specifically verified file-upload capability.',
  needsSourceGrounding: 'The response must be grounded in material supplied by the student.',
  needsWebSearch: 'The task requires a specifically verified current-web-search capability.',
  needsCitations: 'The task requires specifically verified citations or source links.',
  needsCoding: 'The task requires a verified coding capability; API access alone is not enough.',
  needsApiAccess: 'The workflow requires verified student API access; coding ability alone is not enough.',
  needsMultimodalInput: 'The tool must understand image, diagram, screenshot, or voice input; image generation alone is not enough.',
  needsImageGeneration: 'The task requires verified image generation; multimodal input alone is not enough.',
  needsDedicatedInstance: 'The task requires a verified dedicated or high-throughput instance.',
}

export function requiredCapabilities(profile: TaskProfile): CapabilityRequirement[] {
  const normalized = normalizeTaskProfile(profile)
  return (Object.keys(capabilityByFeature) as ProfileFeatureKey[])
    .filter((key) => normalized[key])
    .map((key) => ({ capability: capabilityByFeature[key], label: featureLabels[key], reason: capabilityReasons[key] }))
}

export function shouldAskArcQuestions(profile: TaskProfile): boolean {
  return profile.goal === 'api-research-workflow' || profile.needsApiAccess || profile.needsDedicatedInstance
}

export function isStudentAccessible(tool: Tool): boolean {
  return (tool.status === 'active-service' && tool.studentAvailability === 'all-vt-students')
    || (tool.status === 'conditional-access' && tool.studentAvailability === 'arc-account-required')
}

function accessExclusion(tool: Tool): string {
  if (!validateTool(tool).valid) return 'The record fails the verified VT student catalog rules or its evidence is incomplete.'
  if (tool.studentAvailability === 'employee-only' || tool.status === 'employee-only') return 'Employee-only access is not eligible for a student recommendation.'
  if (tool.studentAvailability === 'limited-pilot' || tool.status === 'limited-pilot') return 'Limited-pilot access is not available to the general VT student population.'
  return 'No current VT source verifies general or conditional student eligibility for this tool.'
}

function arcExclusion(tool: Tool, profile: TaskProfile): string | undefined {
  if (tool.studentAvailability !== 'arc-account-required') return undefined
  const missing: string[] = []
  if (!profile.hasArcAccount) missing.push('an ARC account')
  if (!profile.hasArcAllocation) missing.push('an active ARC allocation')
  if (!profile.canUseVtNetworkOrVpn) missing.push('VT network or VPN access')
  return missing.length ? `Requires ${missing.join(', ')}; the student did not confirm all required ARC conditions.` : undefined
}

function missingRequirements(tool: Tool, requirements: CapabilityRequirement[]): CapabilityRequirement[] {
  const capabilities = new Set(tool.verifiedCapabilities.map((record) => record.capability))
  return requirements.filter((requirement) => !capabilities.has(requirement.capability))
}

function evaluateMatch(tool: Tool, profile: TaskProfile, requirements: CapabilityRequirement[]): ToolEvaluation {
  const taskSupport = tool.supportedTasks.find((support) => support.goal === profile.goal)
  const needed = new Set(requirements.map((requirement) => requirement.capability))
  const matchedCapabilities = tool.verifiedCapabilities.filter((record) => needed.has(record.capability))
  const score = taskSupport?.fit === 'strong' ? 2 : 1
  return {
    tool,
    score,
    taskSupport,
    matchedCapabilities,
    matchReasons: [
      taskSupport!.reason,
      ...requirements.map((requirement) => requirement.reason),
      `${tool.name} is approved for the selected ${profile.sensitivity} data category when used in the documented VT account context.`,
    ],
  }
}

const alphabetical = (a: ToolEvaluation, b: ToolEvaluation) => a.tool.name.localeCompare(b.tool.name, 'en') || a.tool.id.localeCompare(b.tool.id, 'en')

export function recommendTools(input: TaskProfile, catalog: Tool[] = tools): RecommendationResult {
  const profile = normalizeTaskProfile(input)
  const requirements = requiredCapabilities(profile)
  const evaluations = new Map<string, ToolEvaluation>()

  // 1. Verified VT student access hard filter.
  const accessEligible = catalog.filter((tool) => {
    const eligible = validateTool(tool).valid && isStudentAccessible(tool)
    if (!eligible) evaluations.set(tool.id, { tool, score: 0, matchReasons: [], matchedCapabilities: [], exclusionStage: 'student-access', exclusionReason: accessExclusion(tool) })
    return eligible
  })

  // 2. ARC account, allocation, and network hard filter.
  const arcEligible = accessEligible.filter((tool) => {
    const reason = arcExclusion(tool, profile)
    if (reason) evaluations.set(tool.id, { tool, score: 0, matchReasons: [], matchedCapabilities: [], exclusionStage: 'arc-conditions', exclusionReason: reason })
    return !reason
  })

  // 3. Data-use hard filter. CUI and export-controlled data always return zero tools.
  const dataEligible = arcEligible.filter((tool) => {
    const eligible = profile.sensitivity !== 'controlled' && tool.dataRiskApproval.includes(profile.sensitivity)
    if (!eligible) evaluations.set(tool.id, {
      tool,
      score: 0,
      matchReasons: [],
      matchedCapabilities: [],
      exclusionStage: 'data-use',
      exclusionReason: profile.sensitivity === 'controlled'
        ? 'VT prohibits export-controlled data and CUI in every AI tool.'
        : `The official evidence does not approve this tool for ${profile.sensitivity} university data.`,
    })
    return eligible
  })

  // 4. Every selected feature is an independent mandatory capability.
  const capabilityEligible = dataEligible.filter((tool) => {
    const missing = missingRequirements(tool, requirements)
    if (missing.length) evaluations.set(tool.id, {
      tool,
      score: 0,
      matchReasons: [],
      matchedCapabilities: [],
      exclusionStage: 'required-capability',
      exclusionReason: `Missing verified requirement${missing.length === 1 ? '' : 's'}: ${missing.map((item) => item.label).join(', ')}.`,
    })
    return missing.length === 0
  })

  // 5. Documented task fit is evaluated only after all hard filters pass.
  const taskEligible = capabilityEligible.filter((tool) => {
    const supported = tool.supportedTasks.some((task) => task.goal === profile.goal)
    if (!supported) evaluations.set(tool.id, {
      tool,
      score: 0,
      matchReasons: [],
      matchedCapabilities: [],
      exclusionStage: 'task-fit',
      exclusionReason: 'The reviewed VT sources do not document this selected task for the tool.',
    })
    return supported
  })

  const scored = taskEligible.map((tool) => evaluateMatch(tool, profile, requirements))
    .sort((a, b) => b.score - a.score || alphabetical(a, b))
  scored.forEach((evaluation) => evaluations.set(evaluation.tool.id, evaluation))
  const topScore = scored[0]?.score
  const topMatches = scored.filter((item) => item.score === topScore).sort(alphabetical)
  const topIds = new Set(topMatches.map((item) => item.tool.id))
  const alternatives = scored.filter((item) => !topIds.has(item.tool.id)).slice(0, 2)
  const shownIds = new Set([...topMatches, ...alternatives].map((item) => item.tool.id))
  const notSelected = catalog
    .filter((tool) => !shownIds.has(tool.id))
    .map((tool) => evaluations.get(tool.id))
    .filter((item): item is ToolEvaluation => Boolean(item))
    .sort(alphabetical)

  if (!topMatches.length) {
    return {
      halted: true,
      kind: 'none',
      message: NO_MATCH,
      safetyMessage: sensitivityMessages[profile.sensitivity],
      profileLabel: profileLabel(profile),
      requirements,
      topMatches: [],
      alternatives: [],
      notSelected,
    }
  }

  const kind = topMatches.length === 1 ? 'unique' : 'tie'
  return {
    halted: false,
    kind,
    message: kind === 'unique' ? 'Best fit among currently verified VT-supported student tools.' : 'Equally suitable verified matches',
    safetyMessage: sensitivityMessages[profile.sensitivity],
    profileLabel: profileLabel(profile),
    requirements,
    topMatches,
    alternatives,
    notSelected,
  }
}
