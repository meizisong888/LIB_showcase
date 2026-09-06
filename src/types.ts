export type DataSensitivity = 'public' | 'internal' | 'sensitive' | 'controlled'

export type TaskGoal =
  | 'brainstorm-first-draft'
  | 'revise-writing'
  | 'summarize-uploaded'
  | 'questions-provided-sources'
  | 'research-web-citations'
  | 'coding-debugging'
  | 'api-research-workflow'
  | 'multimodal-understanding'
  | 'image-generation'
  | 'quick-question'

export type VerifiedCapability =
  | 'general-chat'
  | 'drafting'
  | 'revising'
  | 'summarization'
  | 'source-grounding'
  | 'file-upload'
  | 'coding'
  | 'api-access'
  | 'web-search'
  | 'citations'
  | 'multimodal-input'
  | 'image-generation'
  | 'dedicated-instance'

export type ProfileFeatureKey =
  | 'needsFileUpload'
  | 'needsSourceGrounding'
  | 'needsWebSearch'
  | 'needsCitations'
  | 'needsCoding'
  | 'needsApiAccess'
  | 'needsMultimodalInput'
  | 'needsImageGeneration'
  | 'needsDedicatedInstance'

export type ToolStatus = 'active-service' | 'conditional-access' | 'employee-only' | 'limited-pilot' | 'not-approved'
export type StudentAvailability = 'all-vt-students' | 'arc-account-required' | 'employee-only' | 'limited-pilot' | 'not-eligible'
export type TaskFit = 'strong' | 'supported'

export interface OfficialSource {
  id: string
  title: string
  url: string
  claimScope: string
  lastChecked: string
}

export interface VerifiedCapabilityRecord {
  capability: VerifiedCapability
  sourceIds: string[]
  evidenceSummary: string
}

export interface TaskSupport {
  goal: TaskGoal
  fit: TaskFit
  reason: string
  sourceIds: string[]
  evidenceSummary: string
}

export interface Tool {
  id: string
  name: string
  initials: string
  summary: string
  status: ToolStatus
  studentAvailability: StudentAvailability
  eligibility: string
  requiredAccount: string
  accessUrl: string
  accessCta: string
  institutionalAccountReminder?: string
  costOrLimits: string
  verifiedCapabilities: VerifiedCapabilityRecord[]
  supportedTasks: TaskSupport[]
  dataRiskApproval: Exclude<DataSensitivity, 'controlled'>[]
  prohibitedData: string[]
  conditionalRequirements: string[]
  notSuitableWhen: string[]
  officialSources: OfficialSource[]
  lastVerified: string
  usageSteps: string[]
}

export interface Task {
  id: TaskGoal
  name: string
  shortName: string
  summary: string
  profileLabel: string
  requiredFeatures: ProfileFeatureKey[]
  optionalFeatures: ProfileFeatureKey[]
}

export interface TaskProfile {
  goal: TaskGoal
  needsFileUpload: boolean
  needsSourceGrounding: boolean
  needsWebSearch: boolean
  needsCitations: boolean
  needsCoding: boolean
  needsApiAccess: boolean
  needsMultimodalInput: boolean
  needsImageGeneration: boolean
  needsDedicatedInstance: boolean
  sensitivity: DataSensitivity
  hasArcAccount: boolean
  hasArcAllocation: boolean
  canUseVtNetworkOrVpn: boolean
}

export type ExclusionStage = 'student-access' | 'arc-conditions' | 'data-use' | 'required-capability' | 'task-fit'

export interface CapabilityRequirement {
  capability: VerifiedCapability
  label: string
  reason: string
}

export interface ToolEvaluation {
  tool: Tool
  score: number
  matchReasons: string[]
  matchedCapabilities: VerifiedCapabilityRecord[]
  taskSupport?: TaskSupport
  exclusionStage?: ExclusionStage
  exclusionReason?: string
}

export type RecommendationKind = 'unique' | 'tie' | 'none'

export interface RecommendationResult {
  halted: boolean
  kind: RecommendationKind
  message: string
  safetyMessage: string
  profileLabel: string
  requirements: CapabilityRequirement[]
  topMatches: ToolEvaluation[]
  alternatives: ToolEvaluation[]
  notSelected: ToolEvaluation[]
}
