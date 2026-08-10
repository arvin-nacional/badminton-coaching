import type { Payload } from 'payload'

type BookingEmailData = {
  coachID: string
  playerName: string
  playerEmail: string
  phone?: string
  notes?: string
  startsAt: string
  durationMinutes: number
  location: string
}

const escapeHTML = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character)
const formatDate = (value: string) => new Intl.DateTimeFormat('en-PH', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(value))

export async function sendAssessmentBookingEmails(payload: Payload, data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) {
    payload.logger.warn('Assessment emails skipped: RESEND_API_KEY is not configured.')
    return
  }

  const coach = await payload.findByID({ collection: 'users', id: data.coachID, depth: 0, overrideAccess: true }).catch(() => null)
  const when = formatDate(data.startsAt)
  const safeName = escapeHTML(data.playerName)
  const safeLocation = escapeHTML(data.location)
  const sharedDetails = `<p><strong>Date:</strong> ${escapeHTML(when)}<br><strong>Duration:</strong> ${data.durationMinutes} minutes<br><strong>Location:</strong> ${safeLocation}</p>`
  const emails = [payload.sendEmail({
    to: data.playerEmail,
    subject: 'Your badminton assessment is confirmed',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#092c59"><h1>Your assessment is booked</h1><p>Hi ${safeName},</p><p>Your badminton assessment has been confirmed.</p>${sharedDetails}<p>We look forward to seeing you on court.</p></div>`,
  })]

  const coachEmail = coach?.email || process.env.COACH_NOTIFICATION_EMAIL
  if (coachEmail) emails.push(payload.sendEmail({
    to: coachEmail,
    replyTo: data.playerEmail,
    subject: `New assessment booking: ${data.playerName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#092c59"><h1>New assessment booking</h1><p><strong>Player:</strong> ${safeName}<br><strong>Email:</strong> ${escapeHTML(data.playerEmail)}${data.phone ? `<br><strong>Phone:</strong> ${escapeHTML(data.phone)}` : ''}</p>${sharedDetails}${data.notes ? `<p><strong>What they want help with:</strong><br>${escapeHTML(data.notes).replace(/\n/g, '<br>')}</p>` : ''}</div>`,
  }))

  await Promise.all(emails)
}
