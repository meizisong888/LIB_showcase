import { describe, expect, it } from 'vitest'
import { scenarios } from '../data/scenarios'
import { defaultFinderAnswers, finderAnswersFromSearchParams, finderAnswersToSearchParams } from './finderParams'

describe('finder query parameters', () => {
  it('round-trips every scenario answer without internal state loss', () => {
    scenarios.forEach((scenario) => expect(finderAnswersFromSearchParams(finderAnswersToSearchParams(scenario.answers))).toEqual(scenario.answers))
  })

  it('rejects malformed enum and boolean values', () => {
    const params = new URLSearchParams('role=robot&sensitivity=secret&needsWeb=maybe')
    expect(finderAnswersFromSearchParams(params)).toEqual(defaultFinderAnswers)
  })
})
