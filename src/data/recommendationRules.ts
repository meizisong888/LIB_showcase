import type { DataSensitivity } from '../types'

export const scoringWeights = {
  taskStrong: 8,
  taskCapable: 5,
  taskConditional: 1,
  taskNotFocused: -6,
  inputMatch: 2,
  outputMatch: 2,
  webRequired: 4,
  citationsStrong: 5,
  citationsAvailable: 2,
  fileEditing: 4,
  codingStrong: 6,
  codingCapable: 3,
  collaborationMatch: 4,
  ecosystem: 5,
  accessMatch: 2,
  easyStart: 1,
} as const

export const safetyMessages: Record<DataSensitivity, string> = {
  public: 'Public or intentionally published material may be used, but still minimize personal information and verify every output.',
  internal: 'Nonpublic information may be moderate risk. Only VT-approved account instances remain eligible; verify classification and least-privilege access first.',
  restricted: 'High-risk or regulated material requires the correct VT-approved instance. Some data governed by contracts, export controls, human-subject protocols, or other rules need additional approval even when a tool is listed for high-risk use.',
  unknown: 'Stop: the data classification is unclear. Do not upload the material or accept a tool recommendation until you check the VT Risk Classification Standard or contact the responsible data steward.',
}

export const defaultHumanChecklist = [
  'Open and verify every cited source; a citation badge is not proof.',
  'Check names, dates, numbers, quotations, calculations, and policy claims.',
  'Confirm the output satisfies the assignment, role, accessibility, and disclosure requirements.',
  'Remove sensitive data that is not necessary for the task.',
  'Keep a human accountable for decisions, publication, sending, merging, or grading.',
]

export const roleHumanChecks: Record<string, string[]> = {
  student: ['Follow the instructor’s assignment-specific AI and disclosure rules.', 'Keep the reasoning and final submission demonstrably your own work.'],
  faculty: ['Confirm alignment with the learning objective, rubric, and student-facing AI expectations.', 'Do not automate grading or consequential student decisions without appropriate human review.'],
  staff: ['Confirm policy claims, commitments, recipients, owners, and approval authority before sending.', 'Keep the accountable office or decision owner in the final review.'],
  researcher: ['Confirm PI, IRB, contract, export-control, data-use, and reproducibility requirements where applicable.', 'Separate generated hypotheses from validated research findings.'],
}
