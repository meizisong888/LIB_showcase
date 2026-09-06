import type { DataSensitivity, FinderAnswers, TaskId } from '../types'

export const defaultFinderAnswers: FinderAnswers = {
  taskId: 'brainstorming-writing',
  requiresProvidedSources: false,
  needsFileUpload: false,
  needsProgrammingOrApi: false,
  sensitivity: 'public',
  hasArcAccount: false,
}

const taskIds: TaskId[] = ['brainstorming-writing', 'revising-writing', 'summarizing-readings', 'source-questions', 'coding-debugging', 'research-api', 'image-multimodal', 'quick-questions']
const sensitivities: DataSensitivity[] = ['public', 'internal', 'sensitive', 'controlled']
const boolValue = (value: string | null, fallback: boolean) => value === '1' ? true : value === '0' ? false : fallback

export function finderAnswersToSearchParams(answers: FinderAnswers): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(answers).forEach(([key, value]) => params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : value))
  return params
}

export function finderAnswersFromSearchParams(params: URLSearchParams): FinderAnswers {
  const taskId = params.get('taskId') as TaskId | null
  const sensitivity = params.get('sensitivity') as DataSensitivity | null
  return {
    taskId: taskId && taskIds.includes(taskId) ? taskId : defaultFinderAnswers.taskId,
    requiresProvidedSources: boolValue(params.get('requiresProvidedSources'), defaultFinderAnswers.requiresProvidedSources),
    needsFileUpload: boolValue(params.get('needsFileUpload'), defaultFinderAnswers.needsFileUpload),
    needsProgrammingOrApi: boolValue(params.get('needsProgrammingOrApi'), defaultFinderAnswers.needsProgrammingOrApi),
    sensitivity: sensitivity && sensitivities.includes(sensitivity) ? sensitivity : defaultFinderAnswers.sensitivity,
    hasArcAccount: boolValue(params.get('hasArcAccount'), defaultFinderAnswers.hasArcAccount),
  }
}
