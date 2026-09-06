export type DataSensitivity = 'public' | 'internal' | 'sensitive' | 'controlled'

export type TaskId =
  | 'brainstorming-writing'
  | 'revising-writing'
  | 'summarizing-readings'
  | 'source-questions'
  | 'coding-debugging'
  | 'research-api'
  | 'image-multimodal'
  | 'quick-questions'

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
  | 'multimodal-input'
  | 'image-generation'

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

export interface TaskSupport {
  taskId: TaskId
  fit: TaskFit
  reason: string
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
  costOrLimits: string
  verifiedCapabilities: VerifiedCapability[]
  supportedTasks: TaskSupport[]
  dataRiskApproval: Exclude<DataSensitivity, 'controlled'>[]
  prohibitedData: string[]
  conditionalRequirements: string[]
  officialSources: OfficialSource[]
  lastVerified: string
  usageSteps: string[]
}

export interface Task {
  id: TaskId
  name: string
  shortName: string
  summary: string
}

export interface FinderAnswers {
  taskId: TaskId
  requiresProvidedSources: boolean
  needsFileUpload: boolean
  needsProgrammingOrApi: boolean
  sensitivity: DataSensitivity
  hasArcAccount: boolean
}

export type ExclusionStage = 'student-access' | 'data-use' | 'required-capability' | 'task-fit'

export interface ToolEvaluation {
  tool: Tool
  score: number
  matchReasons: string[]
  exclusionStage?: ExclusionStage
  exclusionReason?: string
}

export interface RecommendationResult {
  halted: boolean
  message: string
  safetyMessage: string
  primary?: ToolEvaluation
  alternatives: ToolEvaluation[]
  notSelected: ToolEvaluation[]
}
