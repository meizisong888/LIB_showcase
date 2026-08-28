import type { CollaborationMode, DataSensitivity, Ecosystem, FinderAnswers } from '../types'

export const defaultFinderAnswers: FinderAnswers = {
  role: 'student',
  taskId: 'research',
  inputType: 'text',
  outputType: 'brief',
  needsWeb: true,
  citations: true,
  editFiles: false,
  coding: false,
  collaborationMode: 'individual',
  ecosystem: 'none',
  sensitivity: 'public',
  access: 'any',
}

const allowed = {
  role: ['student', 'faculty', 'staff', 'researcher'],
  taskId: ['research', 'teaching', 'admin-writing', 'documents', 'presentations', 'data-analysis', 'coding', 'meetings'],
  inputType: ['text', 'documents', 'spreadsheets', 'images', 'audio', 'code'],
  outputType: ['brief', 'document', 'presentation', 'analysis', 'code', 'action-log'],
  collaborationMode: ['individual', 'shared-workspace', 'document-coauthoring', 'repository-collaboration', 'organization-account'],
  ecosystem: ['none', 'microsoft', 'google', 'github'],
  sensitivity: ['public', 'internal', 'restricted', 'unknown'],
  access: ['free', 'vt', 'paid', 'any'],
} as const

const isAllowed = (key: keyof typeof allowed, value: string | null) => Boolean(value && (allowed[key] as readonly string[]).includes(value))
const boolValue = (value: string | null, fallback: boolean) => value === '1' ? true : value === '0' ? false : fallback

export function finderAnswersToSearchParams(answers: FinderAnswers): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(answers).forEach(([key, value]) => params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : value))
  return params
}

export function finderAnswersFromSearchParams(params: URLSearchParams): FinderAnswers {
  const value = <K extends keyof typeof allowed>(key: K) => isAllowed(key, params.get(key)) ? params.get(key)! : defaultFinderAnswers[key]
  return {
    role: value('role'),
    taskId: value('taskId'),
    inputType: value('inputType'),
    outputType: value('outputType'),
    needsWeb: boolValue(params.get('needsWeb'), defaultFinderAnswers.needsWeb),
    citations: boolValue(params.get('citations'), defaultFinderAnswers.citations),
    editFiles: boolValue(params.get('editFiles'), defaultFinderAnswers.editFiles),
    coding: boolValue(params.get('coding'), defaultFinderAnswers.coding),
    collaborationMode: value('collaborationMode') as CollaborationMode,
    ecosystem: value('ecosystem') as Ecosystem,
    sensitivity: value('sensitivity') as DataSensitivity,
    access: value('access') as FinderAnswers['access'],
  }
}
