import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'
import { generateRecurringAssessmentSlots } from '@/utilities/assessmentAvailability'
import { isCoach } from '@/utilities/dashboardAuth'
import { sendAssessmentBookingEmails } from '@/utilities/sendAssessmentBookingEmails'
import { scheduleAssessmentReminders } from '@/utilities/scheduleAssessmentReminders'

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''
const playingExperienceOptions = ['new', 'under-1-year', '1-3-years', 'over-3-years'] as const
const preferredEventOptions = ['singles', 'doubles', 'both', 'not-sure'] as const

export async function DELETE(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null

  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  if (!isCoach(user)) return Response.json({ error: 'Coach access required.' }, { status: 403 })

  const ids = Array.from(new URL(request.url).searchParams.entries())
    .filter(([key]) => /\[id\]\[(?:in|equals)\](?:\[\d+\])?$/.test(key))
    .map(([, value]) => value)
    .filter(Boolean)

  if (!ids.length) {
    return Response.json(
      { error: 'Select at least one assessment booking to delete.' },
      { status: 400 },
    )
  }

  const result = await payload.delete({
    collection: 'assessment-bookings',
    overrideAccess: false,
    user,
    where: { id: { in: Array.from(new Set(ids)) } },
  })

  return Response.json(result)
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Please submit a valid booking.' }, { status: 400 })
  }

  const slot = text(body.slot, 100)
  const notes = text(body.notes, 1000)

  const payload = await getPayload({ config: configPromise })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null

  // Authenticated students: pull profile data from their student-profile so the
  // booking form only needs to collect a slot (+ optional notes).
  let studentProfileID: string | undefined
  let playerName: string
  let email: string
  let phone: string
  let playingExperience: string
  let preferredEvent: string
  let goals: string
  let trainingAvailability: string
  let injuryConsiderations: string

  if (user?.roles?.includes('student')) {
    const profileResult = await payload.find({
      collection: 'student-profiles',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user,
      where: { user: { equals: user.id } },
    })
    const profile = profileResult.docs[0]
    if (!profile) {
      return Response.json(
        { error: 'Complete your onboarding before booking an assessment.' },
        { status: 400 },
      )
    }
    studentProfileID = profile.id
    playerName = profile.displayName || user.name || user.email
    email = user.email
    phone = ''
    playingExperience = profile.playingExperience || ''
    preferredEvent = profile.preferredEvent || ''
    goals = Array.isArray(profile.goals) ? profile.goals.join(', ') : profile.goals || ''
    trainingAvailability = profile.trainingAvailability || ''
    injuryConsiderations = profile.injuryConsiderations || ''
  } else {
    // Unauthenticated visitor: collect everything from the form.
    playerName = text(body.playerName, 120)
    email = text(body.email, 254).toLowerCase()
    phone = text(body.phone, 40)
    playingExperience = text(body.playingExperience, 30)
    preferredEvent = text(body.preferredEvent, 30)
    goals = text(body.goals, 1000)
    trainingAvailability = text(body.trainingAvailability, 500)
    injuryConsiderations = text(body.injuryConsiderations, 1000)
  }

  const validPlayingExperience = playingExperienceOptions.includes(
    playingExperience as (typeof playingExperienceOptions)[number],
  )
    ? (playingExperience as (typeof playingExperienceOptions)[number])
    : undefined
  const validPreferredEvent = preferredEventOptions.includes(
    preferredEvent as (typeof preferredEventOptions)[number],
  )
    ? (preferredEvent as (typeof preferredEventOptions)[number])
    : undefined

  // For authenticated students, profile fields may be empty (e.g. optional
  // onboarding answers). Only require them for unauthenticated visitors.
  if (!slot) {
    return Response.json({ error: 'Please choose an available time.' }, { status: 400 })
  }
  if (!user?.roles?.includes('student')) {
    if (
      !playerName ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !validPlayingExperience ||
      !validPreferredEvent ||
      !goals ||
      !trainingAvailability
    ) {
      return Response.json(
        { error: 'Choose a slot and complete the required player profile questions.' },
        { status: 400 },
      )
    }
  }

  // payload was already resolved above for the auth check
  let bookingData: {
    bookingKey: string
    slot?: string
    availabilityRule?: string
    coach: string
    startsAt: string
    durationMinutes: number
    location: string
  } | null = null
  if (slot.startsWith('slot:')) {
    const slotID = slot.slice(5)
    const availability = await payload
      .findByID({ collection: 'coach-availability', id: slotID, depth: 0, overrideAccess: true })
      .catch(() => null)
    const coach =
      availability &&
      (typeof availability.coach === 'string' ? availability.coach : availability.coach.id)
    if (
      availability &&
      coach &&
      availability.status === 'open' &&
      new Date(availability.startsAt) > new Date()
    )
      bookingData = {
        bookingKey: slot,
        slot: slotID,
        coach,
        startsAt: availability.startsAt,
        durationMinutes: availability.durationMinutes,
        location: availability.location,
      }
  } else if (slot.startsWith('rule:')) {
    const secondColon = slot.indexOf(':', 5)
    const ruleID = secondColon > 5 ? slot.slice(5, secondColon) : ''
    const rule = ruleID
      ? await payload
          .findByID({
            collection: 'coach-availability-rules',
            id: ruleID,
            depth: 1,
            overrideAccess: true,
          })
          .catch(() => null)
      : null
    const generated = rule
      ? generateRecurringAssessmentSlots([rule]).find((candidate) => candidate.id === slot)
      : null
    if (generated)
      bookingData = {
        bookingKey: slot,
        availabilityRule: ruleID,
        coach: generated.coachID,
        startsAt: generated.startsAt,
        durationMinutes: generated.durationMinutes,
        location: generated.location,
      }
  }

  if (!bookingData)
    return Response.json(
      { error: 'That time is no longer available. Please choose another slot.' },
      { status: 409 },
    )

  try {
    const booking = await payload.create({
      collection: 'assessment-bookings',
      overrideAccess: true,
      data: {
        ...bookingData,
        ...(studentProfileID ? { student: studentProfileID } : {}),
        playerName,
        email,
        phone: phone || undefined,
        playingExperience: validPlayingExperience,
        preferredEvent: validPreferredEvent,
        goals,
        trainingAvailability,
        injuryConsiderations: injuryConsiderations || undefined,
        notes: notes || undefined,
        status: 'confirmed',
      },
    })
    await sendAssessmentBookingEmails(payload, {
      coachID: bookingData.coach,
      playerName,
      playerEmail: email,
      phone: phone || undefined,
      notes: notes || undefined,
      startsAt: bookingData.startsAt,
      durationMinutes: bookingData.durationMinutes,
      location: bookingData.location,
    }).catch((emailError) =>
      payload.logger.error({
        err: emailError,
        msg: 'Assessment was booked, but its notification email failed',
      }),
    )
    await scheduleAssessmentReminders(payload, booking.id, bookingData.startsAt).catch((jobError) =>
      payload.logger.error({
        err: jobError,
        msg: 'Assessment was booked, but its reminders could not be scheduled',
      }),
    )
    return Response.json({ id: booking.id }, { status: 201 })
  } catch (error) {
    payload.logger.warn({ err: error, msg: 'Assessment booking could not be created' })
    const duplicateKey =
      error && typeof error === 'object' && 'code' in error && error.code === 11000
    if (duplicateKey)
      return Response.json(
        { error: 'That time was just booked. Please choose another slot.' },
        { status: 409 },
      )
    return Response.json(
      { error: 'We could not save your booking. Please try again.' },
      { status: 500 },
    )
  }
}
