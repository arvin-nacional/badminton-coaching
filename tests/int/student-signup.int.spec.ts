import { describe, expect, it } from 'vitest'

import { recommendProgram } from '@/utilities/recommendProgram'
import { validateOnboardingInput, validateSignupInput } from '@/utilities/validateStudentSignup'

describe('student signup validation', () => {
  it('accepts a valid signup payload and normalizes email to lowercase', () => {
    const result = validateSignupInput({
      name: '  Alice Tan  ',
      email: '  Alice@Example.COM  ',
    })
    if (!result.valid) throw new Error('expected valid result')
    expect(result.name).toBe('Alice Tan')
    expect(result.email).toBe('alice@example.com')
  })

  it('rejects an empty name', () => {
    expect(validateSignupInput({ email: 'a@b.com' })).toEqual({
      valid: false,
      error: 'Enter your name.',
    })
  })

  it('rejects an invalid email', () => {
    expect(
      validateSignupInput({
        name: 'Alice',
        email: 'not-an-email',
      }),
    ).toEqual({ valid: false, error: 'Enter a valid email address.' })
  })

  it('trims and limits the name to 120 characters', () => {
    const longName = 'A'.repeat(200)
    const result = validateSignupInput({
      name: `  ${longName}  `,
      email: 'a@b.com',
    })
    if (!result.valid) throw new Error('expected valid result')
    expect(result.name.length).toBe(120)
  })

  it('ignores non-string inputs safely', () => {
    expect(validateSignupInput({ name: 123, email: null })).toEqual({
      valid: false,
      error: 'Enter your name.',
    })
  })
})

describe('student onboarding validation', () => {
  const validPayload = {
    displayName: 'Alice Tan',
    playingExperience: '1-3-years',
    preferredEvent: 'singles',
    goals: 'Improve my backhand',
    trainingAvailability: 'Weekday evenings',
    skillSelfRating: 5,
    trainingFrequencyPerWeek: '2',
    competitionGoal: 'club',
  }

  it('accepts a complete onboarding payload', () => {
    const result = validateOnboardingInput(validPayload)
    if (!result.valid) throw new Error('expected valid result')
    expect(result.displayName).toBe('Alice Tan')
    expect(result.playingExperience).toBe('1-3-years')
    expect(result.preferredEvent).toBe('singles')
    expect(result.goals).toBe('Improve my backhand')
    expect(result.trainingAvailability).toBe('Weekday evenings')
    expect(result.skillSelfRating).toBe(5)
    expect(result.trainingFrequencyPerWeek).toBe('2')
    expect(result.competitionGoal).toBe('club')
  })

  it('accepts onboarding without injury considerations', () => {
    const result = validateOnboardingInput(validPayload)
    if (!result.valid) throw new Error('expected valid result')
    expect(result.injuryConsiderations).toBeUndefined()
  })

  it('accepts skillSelfRating as a numeric string and rounds it', () => {
    const result = validateOnboardingInput({ ...validPayload, skillSelfRating: '7' })
    if (!result.valid) throw new Error('expected valid result')
    expect(result.skillSelfRating).toBe(7)
  })

  it('rejects an empty display name', () => {
    expect(validateOnboardingInput({ ...validPayload, displayName: '' })).toEqual({
      valid: false,
      error: 'Enter your display name.',
    })
  })

  it('rejects an invalid playing experience', () => {
    expect(validateOnboardingInput({ ...validPayload, playingExperience: 'pro' })).toEqual({
      valid: false,
      error: 'Choose your playing experience.',
    })
  })

  it('rejects an invalid preferred event', () => {
    expect(validateOnboardingInput({ ...validPayload, preferredEvent: 'teams' })).toEqual({
      valid: false,
      error: 'Choose your preferred event.',
    })
  })

  it('rejects empty goals', () => {
    expect(validateOnboardingInput({ ...validPayload, goals: '' })).toEqual({
      valid: false,
      error: 'Tell us your main goals.',
    })
  })

  it('rejects empty training availability', () => {
    expect(validateOnboardingInput({ ...validPayload, trainingAvailability: '' })).toEqual({
      valid: false,
      error: 'Tell us when you can train.',
    })
  })

  it('rejects a missing skill self-rating', () => {
    expect(validateOnboardingInput({ ...validPayload, skillSelfRating: undefined })).toEqual({
      valid: false,
      error: 'Rate your current skill from 1 to 10.',
    })
  })

  it('rejects a skill self-rating below 1', () => {
    expect(validateOnboardingInput({ ...validPayload, skillSelfRating: 0 })).toEqual({
      valid: false,
      error: 'Rate your current skill from 1 to 10.',
    })
  })

  it('rejects a skill self-rating above 10', () => {
    expect(validateOnboardingInput({ ...validPayload, skillSelfRating: 11 })).toEqual({
      valid: false,
      error: 'Rate your current skill from 1 to 10.',
    })
  })

  it('rejects an invalid training frequency', () => {
    expect(validateOnboardingInput({ ...validPayload, trainingFrequencyPerWeek: '5' })).toEqual({
      valid: false,
      error: 'Choose how often you can train each week.',
    })
  })

  it('rejects an invalid competition goal', () => {
    expect(validateOnboardingInput({ ...validPayload, competitionGoal: 'olympics' })).toEqual({
      valid: false,
      error: 'Choose your competition goal.',
    })
  })

  it('trims and limits long inputs', () => {
    const result = validateOnboardingInput({
      ...validPayload,
      displayName: `  ${'A'.repeat(200)}  `,
      goals: 'G'.repeat(2000),
      trainingAvailability: 'T'.repeat(1000),
      injuryConsiderations: 'I'.repeat(2000),
    })
    if (!result.valid) throw new Error('expected valid result')
    expect(result.displayName.length).toBe(120)
    expect(result.goals.length).toBe(1000)
    expect(result.trainingAvailability.length).toBe(500)
    expect(result.injuryConsiderations?.length).toBe(1000)
  })
})

describe('program recommendation engine', () => {
  it('recommends Foundations for a new casual player with low self-rating', () => {
    const result = recommendProgram({
      playingExperience: 'new',
      skillSelfRating: 2,
      competitionGoal: 'casual',
      trainingFrequencyPerWeek: '1',
    })
    expect(result.level).toBe('foundations')
    expect(result.rationale).toContain('Foundations')
  })

  it('recommends Development for an intermediate club player', () => {
    const result = recommendProgram({
      playingExperience: '1-3-years',
      skillSelfRating: 5,
      competitionGoal: 'club',
      trainingFrequencyPerWeek: '2',
    })
    expect(result.level).toBe('development')
    expect(result.rationale).toContain('Player Development')
  })

  it('recommends Competitive for an experienced tournament player with high self-rating', () => {
    const result = recommendProgram({
      playingExperience: 'over-3-years',
      skillSelfRating: 8,
      competitionGoal: 'tournament',
      trainingFrequencyPerWeek: '4+',
    })
    expect(result.level).toBe('competitive')
    expect(result.rationale).toContain('Competitive Performance')
  })

  it('forces Competitive for national competition goal regardless of other signals', () => {
    const result = recommendProgram({
      playingExperience: 'new',
      skillSelfRating: 2,
      competitionGoal: 'national',
      trainingFrequencyPerWeek: '1',
    })
    expect(result.level).toBe('competitive')
  })

  it('forces at least Development for tournament competition goal', () => {
    const result = recommendProgram({
      playingExperience: 'new',
      skillSelfRating: 1,
      competitionGoal: 'tournament',
      trainingFrequencyPerWeek: '1',
    })
    expect(result.level).toBe('development')
  })

  it('caps casual players at Development even with high self-rating', () => {
    const result = recommendProgram({
      playingExperience: 'over-3-years',
      skillSelfRating: 9,
      competitionGoal: 'casual',
      trainingFrequencyPerWeek: '4+',
    })
    expect(result.level).toBe('development')
  })

  it('recommends Foundations for under-1-year beginner', () => {
    const result = recommendProgram({
      playingExperience: 'under-1-year',
      skillSelfRating: 3,
      competitionGoal: 'casual',
      trainingFrequencyPerWeek: '2',
    })
    expect(result.level).toBe('foundations')
  })

  it('recommends Development for 1-3-year player aiming for club', () => {
    const result = recommendProgram({
      playingExperience: '1-3-years',
      skillSelfRating: 6,
      competitionGoal: 'club',
      trainingFrequencyPerWeek: '3',
    })
    expect(result.level).toBe('development')
  })

  it('includes the weighted score in the rationale', () => {
    const result = recommendProgram({
      playingExperience: 'over-3-years',
      skillSelfRating: 9,
      competitionGoal: 'national',
      trainingFrequencyPerWeek: '4+',
    })
    expect(result.rationale).toMatch(/\d+\.\d+\/10/)
  })
})
