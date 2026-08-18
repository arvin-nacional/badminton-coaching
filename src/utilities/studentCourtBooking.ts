export type StudentCourtBooking = {
  location: string
  scheduledAt: string
}

type ValidationResult =
  { data: StudentCourtBooking; error?: never } | { data?: never; error: string }

export const validateStudentCourtBooking = (value: unknown, now = new Date()): ValidationResult => {
  if (!value || typeof value !== 'object') {
    return { error: 'Enter the reserved court and session time.' }
  }

  const scheduledAtValue = 'scheduledAt' in value ? value.scheduledAt : null
  const locationValue = 'location' in value ? value.location : null
  const scheduledAt =
    typeof scheduledAtValue === 'string' ? new Date(scheduledAtValue) : new Date(Number.NaN)
  const location = typeof locationValue === 'string' ? locationValue.trim() : ''

  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: 'Choose a valid date and time.' }
  }
  if (scheduledAt.getTime() <= now.getTime()) {
    return { error: 'The court booking must be in the future.' }
  }
  if (location.length < 3) {
    return { error: 'Enter the court name and branch or address.' }
  }
  if (location.length > 200) {
    return { error: 'Keep the court details under 200 characters.' }
  }

  return {
    data: {
      location,
      scheduledAt: scheduledAt.toISOString(),
    },
  }
}
