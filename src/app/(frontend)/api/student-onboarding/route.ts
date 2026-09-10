import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'
import { recommendProgram } from '@/utilities/recommendProgram'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { validateOnboardingInput } from '@/utilities/validateStudentSignup'

type OnboardingBody = {
  displayName?: unknown
  playingExperience?: unknown
  preferredEvent?: unknown
  goals?: unknown
  trainingAvailability?: unknown
  injuryConsiderations?: unknown
  healthDataConsent?: unknown
  skillSelfRating?: unknown
  trainingFrequencyPerWeek?: unknown
  competitionGoal?: unknown
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null

  if (!user)
    return Response.json({ error: 'Please sign in to complete onboarding.' }, { status: 401 })
  if (!user.roles?.includes('student'))
    return Response.json({ error: 'Onboarding is only available to students.' }, { status: 403 })

  const body = (await request.json().catch(() => null)) as OnboardingBody | null
  const validation = validateOnboardingInput(body || {})

  if (!validation.valid) return Response.json({ error: validation.error }, { status: 400 })

  const recommendation = recommendProgram({
    competitionGoal: validation.competitionGoal,
    playingExperience: validation.playingExperience,
    skillSelfRating: validation.skillSelfRating,
    trainingFrequencyPerWeek: validation.trainingFrequencyPerWeek,
  })

  // Match the questionnaire result to the corresponding program so the
  // student's roadmap is immediately available after onboarding.
  const [programs, profiles, coachingSettings] = await Promise.all([
    payload.find({
      collection: 'programs',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { level: { equals: recommendation.level } },
    }),
    payload.find({
      collection: 'student-profiles',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user,
      where: { user: { equals: user.id } },
    }),
    getCachedGlobal('coaching-settings')(),
  ])
  const recommendedProgram = programs.docs[0]
  const profile = profiles.docs[0]
  if (!profile)
    return Response.json(
      { error: 'Your student profile could not be found. Please contact your coach.' },
      { status: 404 },
    )

  // The student-profiles collection restricts updates to staff. We've already
  // verified the authenticated user is a student and the profile belongs to
  // them via the ownStudentProfile read access above, so we safely override
  // here to allow self-onboarding without weakening collection access control.
  const updatedProfile = await payload.update({
    collection: 'student-profiles',
    id: profile.id,
    data: {
      competitionGoal: validation.competitionGoal,
      displayName: validation.displayName,
      goals: validation.goals,
      healthDataConsentAt: new Date().toISOString(),
      injuryConsiderations: validation.injuryConsiderations || undefined,
      onboardingCompletedAt: new Date().toISOString(),
      privacyPolicyVersion: coachingSettings.privacy.policyVersion,
      playingExperience: validation.playingExperience,
      preferredEvent: validation.preferredEvent,
      program: recommendedProgram?.id ?? undefined,
      recommendedProgramLevel: recommendation.level,
      skillSelfRating: validation.skillSelfRating,
      trainingAvailability: validation.trainingAvailability,
      trainingFrequencyPerWeek: validation.trainingFrequencyPerWeek,
    },
    overrideAccess: true,
    user,
  })

  return Response.json({
    message: 'Onboarding complete.',
    hasAssignedProgram: Boolean(updatedProfile.program),
    recommendation: {
      level: recommendation.level,
      rationale: recommendation.rationale,
    },
  })
}
