export type VerificationStatus = 'verified' | 'needs-review' | 'outdated'
export type SourceTier = 'official' | 'curated' | 'community'
export type RiskLevel = 'low' | 'medium' | 'high'
export type DataSensitivity = 'public' | 'internal' | 'restricted' | 'unknown'
export type Ecosystem = 'none' | 'microsoft' | 'google' | 'github'

export interface Source {
  id: string
  title: string
  publisher: string
  url: string
  tier: SourceTier
  claimScope: string
  verifiedAt: string
}

export interface Tool {
  id: string
  slug: string
  name: string
  provider: string
  category: string
  summary: string
  bestFor: string[]
  strengths: string[]
  limitations: string[]
  inputTypes: string[]
  outputTypes: string[]
  taskIds: string[]
  webAccess: boolean
  citations: 'strong' | 'available' | 'limited'
  longDocuments: 'strong' | 'capable' | 'limited'
  fileEditing: boolean
  fileEditingRequiresPaid: boolean
  coding: 'strong' | 'capable' | 'limited'
  multimodal: 'strong' | 'capable' | 'limited'
  collaboration: boolean
  ecosystems: Ecosystem[]
  access: string
  accessKinds: ('free' | 'vt' | 'paid')[]
  dataLevels: DataSensitivity[]
  privacy: string
  vtStatus: string
  learningCurve: 'low' | 'medium' | 'high'
  sourceIds: string[]
  verifiedAt: string
  status: VerificationStatus
}

export interface Task {
  id: string
  slug: string
  name: string
  eyebrow: string
  summary: string
  icon: string
  defaultOutput: string
  recommendedSkillSlug: string
}

export interface InstallableDetails {
  publisher: string
  repositoryUrl: string
  license: string
  platforms: string[]
  permissions: string[]
  networkAccess: boolean
  fileAccess: boolean
  commandAccess: boolean
  maintenanceStatus: string
  securityNotes: string
}

export interface Skill {
  id: string
  slug: string
  name: string
  type: 'workflow' | 'installable'
  category: string
  summary: string
  problem: string
  roles: string[]
  compatibleTools: string[]
  inputTypes: string[]
  outputTypes: string[]
  risk: RiskLevel
  requiresWeb: boolean
  requiresAuth: boolean
  executesCode: boolean
  useWhen: string[]
  avoidWhen: string[]
  inputs: string[]
  steps: string[]
  prompt: string
  expectedOutput: string
  failureModes: string[]
  checklist: string[]
  safety: string
  alternatives: string[]
  sourceIds: string[]
  sourceTier: SourceTier
  verifiedAt: string
  status: VerificationStatus
  installable?: InstallableDetails
}

export interface FinderAnswers {
  role: string
  taskId: string
  inputType: string
  outputType: string
  needsWeb: boolean
  citations: boolean
  editFiles: boolean
  coding: boolean
  collaboration: boolean
  ecosystem: Ecosystem
  sensitivity: DataSensitivity
  access: 'free' | 'vt' | 'paid' | 'any'
}

export interface ScoreReason {
  label: string
  points: number
  detail: string
}

export interface ScoredTool {
  tool: Tool
  score: number
  reasons: ScoreReason[]
  exclusions: string[]
}

export interface RecommendationResult {
  halted: boolean
  safetyMessage: string
  primary?: ScoredTool
  alternatives: ScoredTool[]
  closeCall: boolean
  workflowSkill?: Skill
  installableSkill?: Skill
  humanChecklist: string[]
}
