import type { Where } from 'payload'
import type { ProgramLevel } from './recommendProgram'

// Trusted server-only context: an intake update must not rewrite coaching work.
export const onboardingAnswersOnly = Symbol('onboardingAnswersOnly')

export const suggestedTrackLabels: Record<ProgramLevel, string> = {
  foundations: 'Foundations',
  development: 'Development',
  competitive: 'Competitive',
}

export const starterPracticeNames = [
  'Solo Racket Control Circuit',
  'Lunge Balance and Leg Strength',
] as const

// Reuse the most inviting foundation material, never assign the recommended track's full plan.
export const starterPracticeWhere: Where = {
  and: [
    {
      name: {
        in: [...starterPracticeNames],
      },
    },
    { practiceSetting: { equals: 'home' } },
    { level: { equals: 'foundations' } },
  ],
}
