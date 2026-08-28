import { describe, expect, it } from 'vitest'

import { generateRecurringAssessmentSlots } from '@/utilities/assessmentAvailability'
import { validateStudentCourtBooking } from '@/utilities/studentCourtBooking'

describe('student court booking', () => {
  const now = new Date('2026-08-18T08:00:00.000Z')

  it('accepts and normalizes a future court booking', () => {
    expect(
      validateStudentCourtBooking(
        {
          location: '  Smash Plus, Quezon City - Court 4  ',
          scheduledAt: '2026-08-20T10:00:00.000Z',
        },
        now,
      ),
    ).toEqual({
      data: {
        mode: 'booked',
        location: 'Smash Plus, Quezon City - Court 4',
        scheduledAt: '2026-08-20T10:00:00.000Z',
      },
    })
  })

  it('accepts a future court-help request without requiring a booked venue', () => {
    expect(
      validateStudentCourtBooking(
        {
          mode: 'help',
          preferredArea: '  Quezon City near Tomas Morato  ',
          preferredAt: '2026-08-20T10:00:00.000Z',
        },
        now,
      ),
    ).toEqual({
      data: {
        mode: 'help',
        preferredArea: 'Quezon City near Tomas Morato',
        preferredAt: '2026-08-20T10:00:00.000Z',
      },
    })
  })

  it('rejects past times and incomplete court details', () => {
    expect(
      validateStudentCourtBooking(
        { location: 'Smash Plus', scheduledAt: '2026-08-18T07:59:59.000Z' },
        now,
      ).error,
    ).toBe('The court booking must be in the future.')
    expect(
      validateStudentCourtBooking({ location: ' ', scheduledAt: '2026-08-20T10:00:00.000Z' }, now)
        .error,
    ).toBe('Enter the court name and branch or address.')
    expect(
      validateStudentCourtBooking(
        { mode: 'help', preferredArea: ' ', preferredAt: '2026-08-20T10:00:00.000Z' },
        now,
      ).error,
    ).toBe('Enter the area where you would like to train.')
  })

  it('uses recurring coach availability only for time and duration', () => {
    const slots = generateRecurringAssessmentSlots(
      [
        {
          active: true,
          coach: 'coach-1',
          endTime: '19:00',
          id: 'rule-1',
          slotDurationMinutes: 60,
          startTime: '18:00',
          weekday: '2',
        },
      ],
      1,
      now,
    )

    expect(slots).toHaveLength(1)
    expect(slots[0]).toMatchObject({ coachID: 'coach-1', durationMinutes: 60 })
    expect(slots[0]).not.toHaveProperty('location')
  })
})
