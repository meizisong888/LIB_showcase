export type VerificationStatus = 'verified' | 'needs-review' | 'outdated'
export type SourceTier = 'official' | 'curated' | 'community'
export type RiskLevel = 'low' | 'medium' | 'high'
export type DataSensitivity = 'public' | 'internal' | 'restricted' | 'unknown'
export type Ecosystem = 'none' | 'microsoft' | 'google' | 'github'
export type FitLevel = 'strong' | 'capable' | 'conditional' | 'not-focused'
export type ToolFamily = 'general' | 'research' | 'office' | 'coding'
export type CollaborationMode = 'individual' | 'shared-workspace' | 'document-coauthoring' | 'repository-collaboration' | 'organization-account'
export type SkillProvenance = 'project-curated' | 'publisher-official' | 'community-discovered'

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
  family: ToolFamily
  summary: string
  bestFor: string[]
  strengths: string[]
  limitations: string[]
  inputTypes: string[]
  outputTypes: string[]
  taskFit: Record<string, FitLevel>
  webAccess: boolean
  citations: 'strong' | 'available' | 'limited'
  longDocuments: 'strong' | 'capable' | 'limited'
  fileEditing: boolean
  fileEditingRequiresPaid: boolean
  coding: 'strong' | 'capable' | 'limited'
  multimodal: 'strong' | 'capable' | 'limited'
  collaborationModes: CollaborationMode[]
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
}

export interface SkillExample {
  context: string
  sampleInput: string
  outputSections: Array<{
    label: string
    content: string
    status?: 'acceptable' | 'verify' | 'revise'
  }>
  likelyFailure: string
  humanRevision: string
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
  provenance: SkillProvenance
  example?: SkillExample
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
  collaborationMode: CollaborationMode
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
  fit: Exclude<FitLevel, 'not-focused'>
}

export interface RecommendationResult {
  halted: boolean
  safetyMessage: string
  primary?: ScoredTool
  alternatives: ScoredTool[]
  excludedTools: ScoredTool[]
  closeCall: boolean
  workflowSkill?: Skill
  workflowReasons: string[]
  installableSkill?: Skill
  humanChecklist: string[]
  roleGuidance: string
  mustDoManually: string[]
}

export interface Scenario {
  id: string
  role: 'student' | 'faculty' | 'staff' | 'researcher'
  title: string
  situation: string
  sensitivity: DataSensitivity
  targetOutput: string
  toolFamily: ToolFamily
  skillSlug: string
  biggestRisk: string
  humanChecks: string[]
  answers: FinderAnswers
}
