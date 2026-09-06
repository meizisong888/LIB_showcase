import { describe, expect, it } from 'vitest'
import { profileForGoal } from '../data/tasks'
import { defaultTaskProfile, taskProfileFromSearchParams, taskProfileToSearchParams } from './finderParams'

describe('recommender query parameters', () => {
  it('round-trips every independent task-profile field', () => {
    const profile = {
      ...profileForGoal('api-research-workflow'),
      needsCoding: true,
      needsDedicatedInstance: true,
      sensitivity: 'sensitive' as const,
      hasArcAccount: true,
      hasArcAllocation: true,
      canUseVtNetworkOrVpn: true,
    }
    expect(taskProfileFromSearchParams(taskProfileToSearchParams(profile))).toEqual(profile)
  })

  it('rejects malformed enum and boolean values', () => {
    const params = new URLSearchParams('goal=unknown&sensitivity=secret&hasArcAccount=maybe')
    expect(taskProfileFromSearchParams(params)).toEqual(defaultTaskProfile)
  })

  it('enforces capabilities implied by the selected goal', () => {
    const profile = taskProfileFromSearchParams(new URLSearchParams('goal=questions-provided-sources&needsFileUpload=0&needsSourceGrounding=0'))
    expect(profile.needsFileUpload).toBe(true)
    expect(profile.needsSourceGrounding).toBe(true)
  })

  it('discards contradictory feature parameters that are irrelevant to the goal', () => {
    const profile = taskProfileFromSearchParams(new URLSearchParams('goal=quick-question&needsApiAccess=1&needsImageGeneration=1'))
    expect(profile.needsApiAccess).toBe(false)
    expect(profile.needsImageGeneration).toBe(false)
  })
})
