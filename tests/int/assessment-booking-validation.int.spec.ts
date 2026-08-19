// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { validateAssessmentBookingInput } from '@/utilities/validateAssessmentBooking'

const validVisitorBooking = {
  slot: 'slot:availability-1',
  location: '  Smash Plus, Quezon City - Court 4  ',
  playerName: '  Alice Tan  ',
  email: '  Alice@Example.COM  ',
  phone: '  +63 917 123 4567  ',
  playingExperience: '1-3-years',
  preferredEvent: 'singles',
  goals: '  Improve my backhand  ',
  trainingAvailability: '  Weekday evenings  ',
  injuryConsiderations: '  Previous ankle sprain  ',
  notes: '  Please bring training shuttles  ',
}

describe('assessment booking form validation', () => {
  it('accepts and normalizes a complete visitor booking', () => {
    expect(validateAssessmentBookingInput(validVisitorBooking, false)).toEqual({
      valid: true,
      data: {
        slot: 'slot:availability-1',
        location: 'Smash Plus, Quezon City - Court 4',
        playerName: 'Alice Tan',
        email: 'alice@example.com',
        phone: '+63 917 123 4567',
        playingExperience: '1-3-years',
        preferredEvent: 'singles',
        goals: 'Improve my backhand',
        trainingAvailability: 'Weekday evenings',
        injuryConsiderations: 'Previous ankle sprain',
        notes: 'Please bring training shuttles',
      },
    })
  })

  it.each([null, undefined, [], 'booking'])('rejects a non-object payload: %j', (input) => {
    expect(validateAssessmentBookingInput(input, false)).toEqual({
      valid: false,
      error: 'Please submit a valid booking.',
    })
  })

  it('requires an available slot', () => {
    expect(validateAssessmentBookingInput({ ...validVisitorBooking, slot: ' ' }, false)).toEqual({
      valid: false,
      error: 'Please choose an available time.',
    })
  })

  it.each(['', ' ', 'AB'])('requires at least three characters of court details', (location) => {
    expect(validateAssessmentBookingInput({ ...validVisitorBooking, location }, false)).toEqual({
      valid: false,
      error: 'Enter the court name and branch or address that you booked.',
    })
  })

  it.each([
    ['player name', { playerName: ' ' }],
    ['valid email', { email: 'not-an-email' }],
    ['playing experience', { playingExperience: 'professional' }],
    ['preferred event', { preferredEvent: 'teams' }],
    ['goals', { goals: '' }],
    ['training availability', { trainingAvailability: '' }],
  ])('requires a visitor %s', (_field, override) => {
    expect(
      validateAssessmentBookingInput({ ...validVisitorBooking, ...override }, false),
    ).toEqual({
      valid: false,
      error: 'Choose a slot and complete the required player profile questions.',
    })
  })

  it('allows optional visitor fields to be omitted', () => {
    const { phone: _phone, injuryConsiderations: _injury, notes: _notes, ...required } =
      validVisitorBooking

    const result = validateAssessmentBookingInput(required, false)
    expect(result.valid).toBe(true)
    if (!result.valid) return
    expect(result.data).toMatchObject({ phone: '', injuryConsiderations: '', notes: '' })
  })

  it('only requires slot and court details for an authenticated student', () => {
    expect(
      validateAssessmentBookingInput(
        {
          slot: 'rule:rule-1:2026-08-20T10:00:00.000Z',
          location: 'Metro Badminton Center',
          notes: 'Working around a shoulder issue',
        },
        true,
      ),
    ).toEqual({
      valid: true,
      data: {
        slot: 'rule:rule-1:2026-08-20T10:00:00.000Z',
        location: 'Metro Badminton Center',
        notes: 'Working around a shoulder issue',
        playerName: '',
        email: '',
        phone: '',
        playingExperience: undefined,
        preferredEvent: undefined,
        goals: '',
        trainingAvailability: '',
        injuryConsiderations: '',
      },
    })
  })

  it('trims and enforces the same length limits as the form', () => {
    const result = validateAssessmentBookingInput(
      {
        ...validVisitorBooking,
        location: `  ${'L'.repeat(250)}  `,
        playerName: `  ${'N'.repeat(150)}  `,
        email: `${'a'.repeat(248)}@b.com`,
        phone: 'P'.repeat(50),
        goals: 'G'.repeat(1100),
        trainingAvailability: 'T'.repeat(600),
        injuryConsiderations: 'I'.repeat(1100),
        notes: 'X'.repeat(1100),
      },
      false,
    )

    expect(result.valid).toBe(true)
    if (!result.valid) return
    expect(result.data.location).toHaveLength(200)
    expect(result.data.playerName).toHaveLength(120)
    expect(result.data.email).toHaveLength(254)
    expect(result.data.phone).toHaveLength(40)
    expect(result.data.goals).toHaveLength(1000)
    expect(result.data.trainingAvailability).toHaveLength(500)
    expect(result.data.injuryConsiderations).toHaveLength(1000)
    expect(result.data.notes).toHaveLength(1000)
  })
})
