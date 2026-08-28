import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'
import { generateRecurringAssessmentSlots } from '@/utilities/assessmentAvailability'
import { isCoach } from '@/utilities/dashboardAuth'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { sendAssessmentBookingEmails } from '@/utilities/sendAssessmentBookingEmails'
import { scheduleAssessmentReminders } from '@/utilities/scheduleAssessmentReminders'
import {
  assessmentPlayingExperienceOptions,
  assessmentPreferredEventOptions,
  validateAssessmentBookingInput,
} from '@/utilities/validateAssessmentBooking'

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
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Please submit a valid booking.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  const authenticatedStudent = Boolean(user?.roles?.includes('student'))
  const validation = validateAssessmentBookingInput(body, authenticatedStudent)
  if (!validation.valid) return Response.json({ error: validation.error }, { status: 400 })

  const {
    courtHelpArea,
    courtHelpRequested,
    email: submittedEmail,
    goals: submittedGoals,
    healthDataConsent,
    injuryConsiderations: submittedInjuryConsiderations,
    location: studentCourt,
    notes,
    phone: submittedPhone,
    playerName: submittedPlayerName,
    playingExperience: submittedPlayingExperience,
    preferredEvent: submittedPreferredEvent,
    slot,
    trainingAvailability: submittedTrainingAvailability,
  } = validation.data
  const coachingSettings = await getCachedGlobal('coaching-settings')()
  const consentAt = healthDataConsent ? new Date().toISOString() : undefined
  const bookingLocation = courtHelpRequested
    ? `Court coordination requested — ${courtHelpArea}`
    : studentCourt

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
    playerName = submittedPlayerName
    email = submittedEmail
    phone = submittedPhone
    playingExperience = submittedPlayingExperience || ''
    preferredEvent = submittedPreferredEvent || ''
    goals = submittedGoals
    trainingAvailability = submittedTrainingAvailability
    injuryConsiderations = submittedInjuryConsiderations
  }

  const validPlayingExperience = assessmentPlayingExperienceOptions.includes(
    playingExperience as (typeof assessmentPlayingExperienceOptions)[number],
  )
    ? (playingExperience as (typeof assessmentPlayingExperienceOptions)[number])
    : undefined
  const validPreferredEvent = assessmentPreferredEventOptions.includes(
    preferredEvent as (typeof assessmentPreferredEventOptions)[number],
  )
    ? (preferredEvent as (typeof assessmentPreferredEventOptions)[number])
    : undefined

  // payload was already resolved above for the auth check
  let bookingData: {
    bookingKey: string
    slot?: string
    availabilityRule?: string
    coach: string
    startsAt: string
    durationMinutes: number
    location: string
    courtHelpRequested: boolean
    courtHelpArea?: string
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
        courtHelpArea: courtHelpArea || undefined,
        courtHelpRequested,
        location: bookingLocation,
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
        courtHelpArea: courtHelpArea || undefined,
        courtHelpRequested,
        location: bookingLocation,
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
        healthDataConsentAt: consentAt,
        injuryConsiderations: injuryConsiderations || undefined,
        privacyPolicyVersion: coachingSettings.privacy.policyVersion,
        notes: notes || undefined,
        status: 'confirmed',
      },
    })
    if (studentProfileID) {
      await payload
        .update({
          collection: 'student-profiles',
          id: studentProfileID,
          depth: 0,
          overrideAccess: true,
          data: { assessmentStatus: 'scheduled' },
        })
        .catch((profileError) =>
          payload.logger.error({
            err: profileError,
            msg: 'Assessment was booked, but the student profile status was not updated',
          }),
        )
    }
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
