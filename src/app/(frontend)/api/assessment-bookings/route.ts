import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { generateRecurringAssessmentSlots } from '@/utilities/assessmentAvailability'
import { sendAssessmentBookingEmails } from '@/utilities/sendAssessmentBookingEmails'
import { scheduleAssessmentReminders } from '@/utilities/scheduleAssessmentReminders'

const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Please submit a valid booking.' }, { status: 400 })
  }

  const slot = text(body.slot, 100)
  const playerName = text(body.playerName, 120)
  const email = text(body.email, 254).toLowerCase()
  const phone = text(body.phone, 40)
  const notes = text(body.notes, 1000)

  if (!slot || !playerName || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: 'Choose a slot and enter your name and a valid email.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  let bookingData: { bookingKey: string; slot?: string; availabilityRule?: string; coach: string; startsAt: string; durationMinutes: number; location: string } | null = null
  if (slot.startsWith('slot:')) {
    const slotID = slot.slice(5)
    const availability = await payload.findByID({ collection: 'coach-availability', id: slotID, depth: 0, overrideAccess: true }).catch(() => null)
    const coach = availability && (typeof availability.coach === 'string' ? availability.coach : availability.coach.id)
    if (availability && coach && availability.status === 'open' && new Date(availability.startsAt) > new Date()) bookingData = { bookingKey: slot, slot: slotID, coach, startsAt: availability.startsAt, durationMinutes: availability.durationMinutes, location: availability.location }
  } else if (slot.startsWith('rule:')) {
    const secondColon = slot.indexOf(':', 5)
    const ruleID = secondColon > 5 ? slot.slice(5, secondColon) : ''
    const rule = ruleID ? await payload.findByID({ collection: 'coach-availability-rules', id: ruleID, depth: 1, overrideAccess: true }).catch(() => null) : null
    const generated = rule ? generateRecurringAssessmentSlots([rule]).find((candidate) => candidate.id === slot) : null
    if (generated) bookingData = { bookingKey: slot, availabilityRule: ruleID, coach: generated.coachID, startsAt: generated.startsAt, durationMinutes: generated.durationMinutes, location: generated.location }
  }

  if (!bookingData) return Response.json({ error: 'That time is no longer available. Please choose another slot.' }, { status: 409 })

  try {
    const booking = await payload.create({
      collection: 'assessment-bookings',
      overrideAccess: true,
      data: { ...bookingData, playerName, email, phone: phone || undefined, notes: notes || undefined, status: 'confirmed' },
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
    }).catch((emailError) => payload.logger.error({ err: emailError, msg: 'Assessment was booked, but its notification email failed' }))
    await scheduleAssessmentReminders(payload, booking.id, bookingData.startsAt).catch((jobError) => payload.logger.error({ err: jobError, msg: 'Assessment was booked, but its reminders could not be scheduled' }))
    return Response.json({ id: booking.id }, { status: 201 })
  } catch (error) {
    payload.logger.warn({ err: error, msg: 'Assessment booking could not be created' })
    const duplicateKey = error && typeof error === 'object' && 'code' in error && error.code === 11000
    if (duplicateKey) return Response.json({ error: 'That time was just booked. Please choose another slot.' }, { status: 409 })
    return Response.json({ error: 'We could not save your booking. Please try again.' }, { status: 500 })
  }
}
