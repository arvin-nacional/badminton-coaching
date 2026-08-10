import type { Payload } from 'payload'

const reminders = [
  { reminder: 'one-day' as const, milliseconds: 24 * 60 * 60 * 1000 },
  { reminder: 'two-hours' as const, milliseconds: 2 * 60 * 60 * 1000 },
]

export async function scheduleAssessmentReminders(payload: Payload, bookingID: string, startsAt: string) {
  const start = new Date(startsAt).getTime()
  const now = Date.now()
  await Promise.all(reminders.map(({ reminder, milliseconds }) => {
    const waitUntil = new Date(start - milliseconds)
    if (waitUntil.getTime() <= now) return Promise.resolve()
    return payload.jobs.queue({ task: 'sendAssessmentReminder', queue: 'assessment-reminders', input: { bookingID, reminder }, waitUntil })
  }))
}
