import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import {
  BookingForm,
  type AssessmentBookingOffer,
  type AssessmentSlot,
  type ExistingAssessmentBooking,
} from './BookingForm'
import { generateRecurringAssessmentSlots } from '@/utilities/assessmentAvailability'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const metadata: Metadata = {
  title: 'Book an assessment',
  description:
    'Review pricing, choose an assessment time, and confirm a court or request venue help.',
}
// Revalidate every 60 seconds instead of force-dynamic. Availability rarely
// changes minute-to-minute, so ISR keeps the page fast while staying fresh.
// Auth is checked per-request via headers() so the form adapts to the visitor.
export const revalidate = 60

export default async function BookAssessmentPage() {
  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as { id: string; email: string; name?: string } | null

  // If the visitor is an authenticated student, pull their display name so the
  // simplified booking form can greet them.
  let displayName: string | undefined
  let studentProfileID: string | undefined
  if (user?.email) {
    const profileResult = await payload
      .find({
        collection: 'student-profiles',
        depth: 0,
        limit: 1,
        overrideAccess: false,
        user,
        where: { user: { equals: user.id } },
      })
      .catch(() => null)
    const profile = profileResult?.docs[0]
    displayName = profile?.displayName || user.name
    studentProfileID = profile?.id
  }

  const [availability, rules, bookings, existingAssessments, coachingSettings] = await Promise.all([
    payload.find({
      collection: 'coach-availability',
      depth: 1,
      limit: 100,
      overrideAccess: true,
      sort: 'startsAt',
      where: { and: [{ status: { equals: 'open' } }, { startsAt: { greater_than: now } }] },
    }),
    payload.find({
      collection: 'coach-availability-rules',
      depth: 1,
      limit: 100,
      overrideAccess: true,
      where: { active: { equals: true } },
    }),
    payload.find({
      collection: 'assessment-bookings',
      depth: 0,
      limit: 200,
      overrideAccess: true,
      select: { bookingKey: true },
      where: { startsAt: { greater_than: now } },
    }),
    studentProfileID
      ? payload.find({
          collection: 'assessment-bookings',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          sort: '-startsAt',
          where: {
            and: [{ student: { equals: studentProfileID } }, { status: { equals: 'confirmed' } }],
          },
        })
      : Promise.resolve(null),
    getCachedGlobal('coaching-settings')(),
  ])
  const booked = new Set(bookings.docs.map((booking) => booking.bookingKey))
  const oneOffSlots: AssessmentSlot[] = availability.docs.map((slot) => ({
    id: `slot:${slot.id}`,
    startsAt: slot.startsAt,
    durationMinutes: slot.durationMinutes,
    coachName: typeof slot.coach === 'object' ? slot.coach.name || 'your coach' : 'your coach',
  }))
  const recurringSlots: AssessmentSlot[] = generateRecurringAssessmentSlots(rules.docs)
  const slots = [...oneOffSlots, ...recurringSlots]
    .filter((slot) => !booked.has(slot.id))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  const isAuthenticated = Boolean(displayName)
  const existingAssessment = existingAssessments?.docs[0]
  const existingBooking: ExistingAssessmentBooking | undefined = existingAssessment
    ? {
        durationMinutes: existingAssessment.durationMinutes,
        location: existingAssessment.location,
        startsAt: existingAssessment.startsAt,
      }
    : undefined
  const offer: AssessmentBookingOffer = {
    cancellationNoticeHours: coachingSettings.cancellation.noticeHours,
    healthDataNotice: coachingSettings.privacy.healthDataNotice,
    pricing: coachingSettings.pricing,
    privacyURL: coachingSettings.privacy.privacyURL,
    reschedulePolicy: coachingSettings.cancellation.reschedulePolicy,
    serviceArea: coachingSettings.service.area,
    serviceDetails: coachingSettings.service.details,
    termsURL: coachingSettings.privacy.termsURL,
    travelPolicy: coachingSettings.service.travelPolicy,
    venueOptions: (coachingSettings.service.venueOptions || []).map((item) => item.option),
  }

  return (
    <main className="min-h-[70vh] bg-[#eaf3ff] px-5 py-20 text-[#071f42] md:px-10 md:py-28">
      <div className="mx-auto max-w-[1100px]">
        <p className="coach-eyebrow">Start with a clear baseline</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[.95] tracking-[-.05em] md:text-7xl">
          Book your badminton assessment.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#586d84]">
          {isAuthenticated
            ? 'Choose an available time, review the full expected cost, then confirm your court or ask for venue help. Your profile details are already on file.'
            : "Choose from the coach's live availability, review pricing before you commit, then confirm a court or ask for help finding one."}
        </p>
        <div className="mt-12">
          <BookingForm
            slots={slots}
            isAuthenticated={isAuthenticated}
            displayName={displayName}
            existingBooking={existingBooking}
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            offer={offer}
          />
        </div>
      </div>
    </main>
  )
}
