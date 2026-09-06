import { normalizeTaskProfile, profileForGoal, tasks } from '../data/tasks'
import type { DataSensitivity, TaskGoal, TaskProfile } from '../types'

export const defaultTaskProfile: TaskProfile = profileForGoal('brainstorm-first-draft')

const goals = tasks.map((task) => task.id)
const sensitivities: DataSensitivity[] = ['public', 'internal', 'sensitive', 'controlled']
const booleanKeys: Array<keyof Pick<TaskProfile,
  | 'needsFileUpload'
  | 'needsSourceGrounding'
  | 'needsWebSearch'
  | 'needsCitations'
  | 'needsCoding'
  | 'needsApiAccess'
  | 'needsMultimodalInput'
  | 'needsImageGeneration'
  | 'needsDedicatedInstance'
  | 'hasArcAccount'
  | 'hasArcAllocation'
  | 'canUseVtNetworkOrVpn'
>> = [
  'needsFileUpload', 'needsSourceGrounding', 'needsWebSearch', 'needsCitations', 'needsCoding',
  'needsApiAccess', 'needsMultimodalInput', 'needsImageGeneration', 'needsDedicatedInstance',
  'hasArcAccount', 'hasArcAllocation', 'canUseVtNetworkOrVpn',
]

const boolValue = (value: string | null, fallback: boolean) => value === '1' ? true : value === '0' ? false : fallback

export function taskProfileToSearchParams(profile: TaskProfile): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(normalizeTaskProfile(profile)).forEach(([key, value]) => params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : value))
  return params
}

export function taskProfileFromSearchParams(params: URLSearchParams): TaskProfile {
  const rawGoal = params.get('goal')
  const goal = rawGoal && goals.includes(rawGoal as TaskGoal) ? rawGoal as TaskGoal : defaultTaskProfile.goal
  const sensitivityValue = params.get('sensitivity') as DataSensitivity | null
  const profile = profileForGoal(goal, sensitivityValue && sensitivities.includes(sensitivityValue) ? sensitivityValue : defaultTaskProfile.sensitivity)
  booleanKeys.forEach((key) => { profile[key] = boolValue(params.get(key), profile[key]) })
  return normalizeTaskProfile(profile)
}
