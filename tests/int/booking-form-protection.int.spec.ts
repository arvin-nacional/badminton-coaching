// @vitest-environment node

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  BookingForm,
  type AssessmentBookingOffer,
} from '@/app/(frontend)/book-assessment/BookingForm'

const offer: AssessmentBookingOffer = {
  cancellationNoticeHours: 24,
  healthDataNotice: 'Consent notice',
  pricing: {},
  privacyURL: '/privacy',
  reschedulePolicy: 'Contact your coach',
  serviceArea: 'Test city',
  serviceDetails: 'Assessment',
  termsURL: '/terms',
  travelPolicy: 'Confirm location',
  venueOptions: [],
}
const slots = [
  { id: 'slot:one', startsAt: '2030-01-01T00:00:00Z', durationMinutes: 60, coachName: 'Coach' },
]

describe('booking protection form rendering', () => {
  it('explains that a guest code does not reserve a time and includes a spam trap', () => {
    const html = renderToStaticMarkup(
      createElement(BookingForm, { slots, offer, isAuthenticated: false }),
    )
    expect(html).toContain('Email confirmation code')
    expect(html).toContain('Your time is reserved only after you enter the code and confirm.')
    expect(html).toContain('name="website"')
    expect(html).toContain('name="email"')
  })

  it('keeps the signed-in form tied to the profile, with no editable email or code request', () => {
    const html = renderToStaticMarkup(
      createElement(BookingForm, { slots, offer, isAuthenticated: true, displayName: 'Student' }),
    )
    expect(html).toContain('Booking as Student')
    expect(html).not.toContain('name="email"')
    expect(html).not.toContain('Email confirmation code')
  })

  it('does not offer code requests when there are no available slots', () => {
    const html = renderToStaticMarkup(
      createElement(BookingForm, { slots: [], offer, isAuthenticated: false }),
    )
    expect(html).toContain('New times are coming soon.')
    expect(html).not.toContain('<form')
  })
})
