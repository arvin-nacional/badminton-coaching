import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { BookingForm, type AssessmentSlot } from './BookingForm'
import { generateRecurringAssessmentSlots } from '@/utilities/assessmentAvailability'

export const metadata: Metadata = { title: 'Book an assessment', description: 'Choose an available badminton assessment time with a coach.' }
export const dynamic = 'force-dynamic'

export default async function BookAssessmentPage() {
  const payload = await getPayload({ config: configPromise })
  const [availability, rules, bookings] = await Promise.all([
    payload.find({ collection: 'coach-availability', depth: 1, limit: 100, overrideAccess: true, sort: 'startsAt', where: { and: [{ status: { equals: 'open' } }, { startsAt: { greater_than: new Date().toISOString() } }] } }),
    payload.find({ collection: 'coach-availability-rules', depth: 1, limit: 100, overrideAccess: true, where: { active: { equals: true } } }),
    payload.find({ collection: 'assessment-bookings', depth: 0, limit: 1000, overrideAccess: true }),
  ])
  const booked = new Set(bookings.docs.map((booking) => booking.bookingKey))
  const oneOffSlots: AssessmentSlot[] = availability.docs.map((slot) => ({ id: `slot:${slot.id}`, startsAt: slot.startsAt, durationMinutes: slot.durationMinutes, location: slot.location, coachName: typeof slot.coach === 'object' ? slot.coach.name || 'your coach' : 'your coach' }))
  const recurringSlots: AssessmentSlot[] = generateRecurringAssessmentSlots(rules.docs)
  const slots = [...oneOffSlots, ...recurringSlots].filter((slot) => !booked.has(slot.id)).sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  return <main className="min-h-[70vh] bg-[#eaf3ff] px-5 py-20 text-[#071f42] md:px-10 md:py-28"><div className="mx-auto max-w-[1100px]"><p className="coach-eyebrow">Start with a clear baseline</p><h1 className="mt-4 max-w-4xl text-5xl font-black leading-[.95] tracking-[-.05em] md:text-7xl">Book your badminton assessment.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#586d84]">Choose from the coach’s live availability, then tell us how to reach you. Only open, unbooked times are shown.</p><div className="mt-12"><BookingForm slots={slots} /></div></div></main>
}
