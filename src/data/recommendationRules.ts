import type { DataSensitivity } from '../types'

export const scoringWeights = {
  taskMatch: 6,
  inputMatch: 2,
  outputMatch: 2,
  webRequired: 4,
  citationsStrong: 5,
  citationsAvailable: 2,
  fileEditing: 4,
  codingStrong: 6,
  codingCapable: 3,
  collaboration: 2,
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
