export type SignupInput = {
  name?: unknown
  email?: unknown
  password?: unknown
  confirmPassword?: unknown
}

export type SignupValidation =
  | {
      valid: false
      error: string
    }
  | {
      valid: true
      name: string
      email: string
      password: string
    }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

/**
 * Validates public student signup input. Returns a normalized result with
 * trimmed values when valid, or a user-facing error message when invalid.
 * This is a pure function so it can be unit-tested without a database.
 */
export function validateSignupInput(input: SignupInput): SignupValidation {
  const name = text(input.name, 120)
  const email = text(input.email, 254).toLowerCase()
  const password = typeof input.password === 'string' ? input.password : ''
  const confirmPassword = typeof input.confirmPassword === 'string' ? input.confirmPassword : ''

  if (!name) return { valid: false, error: 'Enter your name.' }
  if (!emailPattern.test(email)) return { valid: false, error: 'Enter a valid email address.' }
  if (password.length < 8)
    return { valid: false, error: 'Your password must have at least 8 characters.' }
  if (password !== confirmPassword) return { valid: false, error: 'The passwords do not match.' }

  return { valid: true, name, email, password }
}

export type OnboardingInput = {
  displayName?: unknown
  playingExperience?: unknown
  preferredEvent?: unknown
  goals?: unknown
  trainingAvailability?: unknown
  injuryConsiderations?: unknown
  skillSelfRating?: unknown
  trainingFrequencyPerWeek?: unknown
  competitionGoal?: unknown
}

export type OnboardingValidation =
  | {
      valid: false
      error: string
    }
  | {
      valid: true
      displayName: string
      playingExperience: 'new' | 'under-1-year' | '1-3-years' | 'over-3-years'
      preferredEvent: 'singles' | 'doubles' | 'both' | 'not-sure'
      goals: string
      trainingAvailability: string
      injuryConsiderations?: string
      skillSelfRating: number
      trainingFrequencyPerWeek: '1' | '2' | '3' | '4+'
      competitionGoal: 'casual' | 'club' | 'tournament' | 'national'
    }

const playingExperienceOptions = ['new', 'under-1-year', '1-3-years', 'over-3-years'] as const
const preferredEventOptions = ['singles', 'doubles', 'both', 'not-sure'] as const
const trainingFrequencyOptions = ['1', '2', '3', '4+'] as const
const competitionGoalOptions = ['casual', 'club', 'tournament', 'national'] as const

/**
 * Validates student onboarding input. Pure function for unit testing.
 */
export function validateOnboardingInput(input: OnboardingInput): OnboardingValidation {
  const displayName = text(input.displayName, 120)
  const playingExperienceRaw = text(input.playingExperience, 30)
  const preferredEventRaw = text(input.preferredEvent, 30)
  const goals = text(input.goals, 1000)
  const trainingAvailability = text(input.trainingAvailability, 500)
  const injuryConsiderations = text(input.injuryConsiderations, 1000)
  const skillSelfRatingRaw = input.skillSelfRating
  const trainingFrequencyRaw = text(input.trainingFrequencyPerWeek, 5)
  const competitionGoalRaw = text(input.competitionGoal, 30)

  if (!displayName) return { valid: false, error: 'Enter your display name.' }

  const playingExperience = playingExperienceOptions.includes(
    playingExperienceRaw as (typeof playingExperienceOptions)[number],
  )
    ? (playingExperienceRaw as (typeof playingExperienceOptions)[number])
    : undefined
  if (!playingExperience) return { valid: false, error: 'Choose your playing experience.' }

  const preferredEvent = preferredEventOptions.includes(
    preferredEventRaw as (typeof preferredEventOptions)[number],
  )
    ? (preferredEventRaw as (typeof preferredEventOptions)[number])
    : undefined
  if (!preferredEvent) return { valid: false, error: 'Choose your preferred event.' }
  if (!goals) return { valid: false, error: 'Tell us your main goals.' }
  if (!trainingAvailability) return { valid: false, error: 'Tell us when you can train.' }

  // Skill self-rating must be a number between 1 and 10.
  const skillSelfRating =
    typeof skillSelfRatingRaw === 'number'
      ? skillSelfRatingRaw
      : typeof skillSelfRatingRaw === 'string'
        ? Number(skillSelfRatingRaw)
        : NaN
  if (!Number.isFinite(skillSelfRating) || skillSelfRating < 1 || skillSelfRating > 10)
    return { valid: false, error: 'Rate your current skill from 1 to 10.' }

  const trainingFrequencyPerWeek = trainingFrequencyOptions.includes(
    trainingFrequencyRaw as (typeof trainingFrequencyOptions)[number],
  )
    ? (trainingFrequencyRaw as (typeof trainingFrequencyOptions)[number])
    : undefined
  if (!trainingFrequencyPerWeek)
    return { valid: false, error: 'Choose how often you can train each week.' }

  const competitionGoal = competitionGoalOptions.includes(
    competitionGoalRaw as (typeof competitionGoalOptions)[number],
  )
    ? (competitionGoalRaw as (typeof competitionGoalOptions)[number])
    : undefined
  if (!competitionGoal) return { valid: false, error: 'Choose your competition goal.' }

  return {
    valid: true,
    displayName,
    goals,
    injuryConsiderations: injuryConsiderations || undefined,
    playingExperience,
    preferredEvent,
    skillSelfRating: Math.round(skillSelfRating),
    trainingFrequencyPerWeek,
    competitionGoal,
    trainingAvailability,
  }
}
