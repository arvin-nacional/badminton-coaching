export const assessmentPlayingExperienceOptions = [
  'new',
  'under-1-year',
  '1-3-years',
  'over-3-years',
] as const

export const assessmentPreferredEventOptions = ['singles', 'doubles', 'both', 'not-sure'] as const

type PlayingExperience = (typeof assessmentPlayingExperienceOptions)[number]
type PreferredEvent = (typeof assessmentPreferredEventOptions)[number]

type AssessmentBookingInput = {
  slot: string
  notes: string
  location: string
  playerName: string
  email: string
  phone: string
  playingExperience?: PlayingExperience
  preferredEvent?: PreferredEvent
  goals: string
  trainingAvailability: string
  injuryConsiderations: string
}

type ValidationResult =
  | { valid: false; error: string }
  | { valid: true; data: AssessmentBookingInput }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

/**
 * Validates and normalizes the public assessment booking form payload.
 * Authenticated students only submit the slot, court, and optional notes;
 * their player details are loaded from their profile by the API route.
 */
export function validateAssessmentBookingInput(
  value: unknown,
  authenticatedStudent: boolean,
): ValidationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, error: 'Please submit a valid booking.' }
  }

  const input = value as Record<string, unknown>
  const slot = text(input.slot, 100)
  const notes = text(input.notes, 1000)
  const location = text(input.location, 200)
  const playerName = authenticatedStudent ? '' : text(input.playerName, 120)
  const email = authenticatedStudent ? '' : text(input.email, 254).toLowerCase()
  const phone = authenticatedStudent ? '' : text(input.phone, 40)
  const playingExperienceRaw = authenticatedStudent ? '' : text(input.playingExperience, 30)
  const preferredEventRaw = authenticatedStudent ? '' : text(input.preferredEvent, 30)
  const goals = authenticatedStudent ? '' : text(input.goals, 1000)
  const trainingAvailability = authenticatedStudent ? '' : text(input.trainingAvailability, 500)
  const injuryConsiderations = authenticatedStudent ? '' : text(input.injuryConsiderations, 1000)

  const playingExperience = assessmentPlayingExperienceOptions.includes(
    playingExperienceRaw as PlayingExperience,
  )
    ? (playingExperienceRaw as PlayingExperience)
    : undefined
  const preferredEvent = assessmentPreferredEventOptions.includes(
    preferredEventRaw as PreferredEvent,
  )
    ? (preferredEventRaw as PreferredEvent)
    : undefined

  if (!slot) {
    return { valid: false, error: 'Please choose an available time.' }
  }
  if (location.length < 3) {
    return {
      valid: false,
      error: 'Enter the court name and branch or address that you booked.',
    }
  }
  if (
    !authenticatedStudent &&
    (!playerName ||
      !emailPattern.test(email) ||
      !playingExperience ||
      !preferredEvent ||
      !goals ||
      !trainingAvailability)
  ) {
    return {
      valid: false,
      error: 'Choose a slot and complete the required player profile questions.',
    }
  }

  return {
    valid: true,
    data: {
      email,
      goals,
      injuryConsiderations,
      location,
      notes,
      phone,
      playerName,
      playingExperience,
      preferredEvent,
      slot,
      trainingAvailability,
    },
  }
}
