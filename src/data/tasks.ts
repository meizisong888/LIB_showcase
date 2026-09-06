import type { ProfileFeatureKey, Task, TaskGoal, TaskProfile } from '../types'

export const featureLabels: Record<ProfileFeatureKey, string> = {
  needsFileUpload: 'File upload',
  needsSourceGrounding: 'Answers grounded in your supplied sources',
  needsWebSearch: 'Current web search',
  needsCitations: 'Citations or source links',
  needsCoding: 'Code writing, explanation, or debugging',
  needsApiAccess: 'Student API access',
  needsMultimodalInput: 'Understand an image, diagram, screenshot, or voice input',
  needsImageGeneration: 'Generate or edit an image',
  needsDedicatedInstance: 'Dedicated or high-throughput instance',
}

export const featureHelp: Record<ProfileFeatureKey, string> = {
  needsFileUpload: 'Removes tools whose VT documentation does not explicitly verify file upload.',
  needsSourceGrounding: 'Requires the tool to use material you provide, not merely general model knowledge.',
  needsWebSearch: 'Requires an explicitly documented ability to retrieve current web information.',
  needsCitations: 'Requires an explicitly documented citation or linked-source capability.',
  needsCoding: 'Coding is checked separately from API access.',
  needsApiAccess: 'API access is checked separately from a model being able to write code.',
  needsMultimodalInput: 'Image generation alone does not pass this requirement.',
  needsImageGeneration: 'Understanding an image alone does not pass this requirement.',
  needsDedicatedInstance: 'This activates the full ARC account, allocation, and network checks.',
}

export const tasks: Task[] = [
  {
    id: 'brainstorm-first-draft', shortName: 'Brainstorm & draft', name: 'Brainstorm ideas or create a first draft',
    summary: 'Develop ideas, an outline, or new prose from a blank page.', profileLabel: 'Idea development and first-draft writing',
    requiredFeatures: [], optionalFeatures: ['needsFileUpload', 'needsSourceGrounding'],
  },
  {
    id: 'revise-writing', shortName: 'Revise writing', name: 'Revise or improve existing writing',
    summary: 'Improve clarity, organization, grammar, or style.', profileLabel: 'Writing revision and improvement',
    requiredFeatures: [], optionalFeatures: ['needsFileUpload', 'needsSourceGrounding'],
  },
  {
    id: 'summarize-uploaded', shortName: 'Summarize uploads', name: 'Summarize uploaded readings or documents',
    summary: 'Condense material you upload while preserving its main ideas.', profileLabel: 'Source-grounded document summarization',
    requiredFeatures: ['needsFileUpload', 'needsSourceGrounding'], optionalFeatures: ['needsCitations'],
  },
  {
    id: 'questions-provided-sources', shortName: 'Ask about sources', name: 'Ask questions using only provided sources',
    summary: 'Get bounded answers grounded only in the material you provide.', profileLabel: 'Source-grounded document research',
    requiredFeatures: ['needsFileUpload', 'needsSourceGrounding'], optionalFeatures: ['needsCitations'],
  },
  {
    id: 'research-web-citations', shortName: 'Web research', name: 'Research current information with web sources or citations',
    summary: 'Find current information and retain links or citations for verification.', profileLabel: 'Current web research with citations',
    requiredFeatures: ['needsWebSearch', 'needsCitations'], optionalFeatures: ['needsFileUpload', 'needsSourceGrounding'],
  },
  {
    id: 'coding-debugging', shortName: 'Code & debug', name: 'Write, explain, or debug code',
    summary: 'Work directly with code without assuming an API is needed.', profileLabel: 'Coding and debugging assistance',
    requiredFeatures: ['needsCoding'], optionalFeatures: ['needsApiAccess'],
  },
  {
    id: 'api-research-workflow', shortName: 'API workflow', name: 'Build an API-based or automated research workflow',
    summary: 'Use documented student API access for a programmatic workflow.', profileLabel: 'API-based research automation',
    requiredFeatures: ['needsApiAccess'], optionalFeatures: ['needsCoding', 'needsDedicatedInstance'],
  },
  {
    id: 'multimodal-understanding', shortName: 'Understand media', name: 'Understand an image, diagram, screenshot, or voice input',
    summary: 'Ask questions about non-text input; image creation does not count.', profileLabel: 'Multimodal input understanding',
    requiredFeatures: ['needsMultimodalInput'], optionalFeatures: [],
  },
  {
    id: 'image-generation', shortName: 'Create images', name: 'Generate or edit an image',
    summary: 'Create visual output; optionally require understanding an existing visual.', profileLabel: 'Image generation or editing',
    requiredFeatures: ['needsImageGeneration'], optionalFeatures: ['needsMultimodalInput'],
  },
  {
    id: 'quick-question', shortName: 'Quick question', name: 'Ask a quick general question',
    summary: 'Get concise help with an everyday, non-specialized question.', profileLabel: 'Quick general assistance',
    requiredFeatures: [], optionalFeatures: ['needsWebSearch', 'needsCitations'],
  },
]

export const taskById = Object.fromEntries(tasks.map((task) => [task.id, task])) as Record<TaskGoal, Task>
export const allFeatureKeys = Object.keys(featureLabels) as ProfileFeatureKey[]

export function profileForGoal(goal: TaskGoal, sensitivity: TaskProfile['sensitivity'] = 'public'): TaskProfile {
  const required = new Set(taskById[goal].requiredFeatures)
  return {
    goal,
    needsFileUpload: required.has('needsFileUpload'),
    needsSourceGrounding: required.has('needsSourceGrounding'),
    needsWebSearch: required.has('needsWebSearch'),
    needsCitations: required.has('needsCitations'),
    needsCoding: required.has('needsCoding'),
    needsApiAccess: required.has('needsApiAccess'),
    needsMultimodalInput: required.has('needsMultimodalInput'),
    needsImageGeneration: required.has('needsImageGeneration'),
    needsDedicatedInstance: required.has('needsDedicatedInstance'),
    sensitivity,
    hasArcAccount: false,
    hasArcAllocation: false,
    canUseVtNetworkOrVpn: false,
  }
}

export function normalizeTaskProfile(profile: TaskProfile): TaskProfile {
  const task = taskById[profile.goal]
  const allowed = new Set([...task.requiredFeatures, ...task.optionalFeatures])
  const normalized = { ...profile }
  allFeatureKeys.forEach((key) => {
    normalized[key] = task.requiredFeatures.includes(key) || (allowed.has(key) && profile[key])
  })
  if (!normalized.needsApiAccess && !normalized.needsDedicatedInstance) {
    normalized.hasArcAccount = false
    normalized.hasArcAllocation = false
    normalized.canUseVtNetworkOrVpn = false
  }
  return normalized
}

export function profileLabel(profile: TaskProfile): string {
  return taskById[profile.goal].profileLabel
}
