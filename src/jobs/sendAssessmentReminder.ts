import type { TaskConfig } from 'payload'

type ReminderInput = { bookingID: string; reminder: 'one-day' | 'two-hours' }

const escapeHTML = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character)
const formatDate = (value: string) => new Intl.DateTimeFormat('en-PH', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(value))

export const sendAssessmentReminderTask: TaskConfig<{ input: ReminderInput; output: { sent: boolean } }> = {
  slug: 'sendAssessmentReminder',
  label: 'Send assessment reminder',
  retries: 2,
  inputSchema: [
    { name: 'bookingID', type: 'text', required: true },
    { name: 'reminder', type: 'select', required: true, options: ['one-day', 'two-hours'] },
  ],
  outputSchema: [{ name: 'sent', type: 'checkbox', required: true }],
  handler: async ({ input, req }) => {
    const booking = await req.payload.findByID({ collection: 'assessment-bookings', id: input.bookingID, depth: 1, overrideAccess: true }).catch(() => null)
    if (!booking || booking.status !== 'confirmed' || new Date(booking.startsAt) <= new Date()) return { output: { sent: false } }

    const coachEmail = typeof booking.coach === 'object' ? booking.coach.email : undefined
    const coachRecipient = coachEmail || process.env.COACH_NOTIFICATION_EMAIL
    const reminderLabel = input.reminder === 'one-day' ? 'tomorrow' : 'in 2 hours'
    const when = escapeHTML(formatDate(booking.startsAt))
    const location = escapeHTML(booking.location)
    const playerName = escapeHTML(booking.playerName)
    const details = `<p><strong>Date:</strong> ${when}<br><strong>Location:</strong> ${location}<br><strong>Duration:</strong> ${booking.durationMinutes} minutes</p>`
    const emails = [req.payload.sendEmail({
      to: booking.email,
      subject: `Reminder: your badminton assessment is ${reminderLabel}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#092c59"><h1>Your assessment is ${reminderLabel}</h1><p>Hi ${playerName},</p><p>This is a reminder about your upcoming badminton assessment.</p>${details}<p>See you on court!</p></div>`,
    })]
    if (coachRecipient) emails.push(req.payload.sendEmail({
      to: coachRecipient,
      replyTo: booking.email,
      subject: `Reminder: assessment with ${booking.playerName} is ${reminderLabel}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#092c59"><h1>Upcoming assessment</h1><p>Your assessment with <strong>${playerName}</strong> is ${reminderLabel}.</p>${details}</div>`,
    }))
    await Promise.all(emails)
    return { output: { sent: true } }
  },
}
