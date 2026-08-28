export type StudentCourtBooking =
  | {
      mode: 'booked'
      location: string
      scheduledAt: string
    }
  | {
      mode: 'help'
      preferredArea: string
      preferredAt: string
    }

type ValidationResult =
  { data: StudentCourtBooking; error?: never } | { data?: never; error: string }

export const validateStudentCourtBooking = (value: unknown, now = new Date()): ValidationResult => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { error: 'Enter the court details or request help finding a court.' }
  }

  const input = value as Record<string, unknown>

  if (input.mode === 'help') {
    const preferredAt =
      typeof input.preferredAt === 'string' ? new Date(input.preferredAt) : new Date(Number.NaN)
    const preferredArea = typeof input.preferredArea === 'string' ? input.preferredArea.trim() : ''

    if (Number.isNaN(preferredAt.getTime())) {
      return { error: 'Choose a valid preferred date and time.' }
    }
    if (preferredAt.getTime() <= now.getTime()) {
      return { error: 'The preferred training time must be in the future.' }
    }
    if (preferredArea.length < 3) {
      return { error: 'Enter the area where you would like to train.' }
    }
    if (preferredArea.length > 200) {
      return { error: 'Keep the preferred area under 200 characters.' }
    }

    return {
      data: {
        mode: 'help',
        preferredArea,
        preferredAt: preferredAt.toISOString(),
      },
    }
  }

  const scheduledAt =
    typeof input.scheduledAt === 'string' ? new Date(input.scheduledAt) : new Date(Number.NaN)
  const location = typeof input.location === 'string' ? input.location.trim() : ''

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
      mode: 'booked',
      location,
      scheduledAt: scheduledAt.toISOString(),
    },
  }
}
