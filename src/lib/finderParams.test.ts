import { describe, expect, it } from 'vitest'
import { defaultFinderAnswers, finderAnswersFromSearchParams, finderAnswersToSearchParams } from './finderParams'

describe('recommender query parameters', () => {
  it('round-trips all six answers', () => {
    const answers = { ...defaultFinderAnswers, taskId: 'research-api' as const, requiresProvidedSources: true, needsFileUpload: true, needsProgrammingOrApi: true, sensitivity: 'sensitive' as const, hasArcAccount: true }
    expect(finderAnswersFromSearchParams(finderAnswersToSearchParams(answers))).toEqual(answers)
  })

  it('rejects malformed enum and boolean values', () => {
    const params = new URLSearchParams('taskId=unknown&sensitivity=secret&hasArcAccount=maybe')
    expect(finderAnswersFromSearchParams(params)).toEqual(defaultFinderAnswers)
  })
})
