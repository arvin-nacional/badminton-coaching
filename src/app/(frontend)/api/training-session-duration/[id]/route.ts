import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import type { StudentProfile, User } from '@/payload-types'
import { isAdmin, isCoach } from '@/utilities/dashboardAuth'
import { isSessionDuration } from '@/utilities/sessionTiming'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
  return null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  if (!isCoach(user)) return Response.json({ error: 'Coach access required.' }, { status: 403 })

  const body = (await request.json().catch(() => null)) as {
    durationMinutes?: unknown
    scope?: unknown
  } | null
  if (!isSessionDuration(body?.durationMinutes)) {
    return Response.json({ error: 'Choose a duration of 60, 90, or 120 minutes.' }, { status: 400 })
  }
  if (body.scope !== 'week' && body.scope !== 'program' && body.scope !== 'reset') {
    return Response.json(
      { error: 'Choose whether to update this week or the program.' },
      { status: 400 },
    )
  }

  try {
    const { id } = await params
    const session = await payload.findByID({
      collection: 'training-sessions',
      id,
      depth: 1,
      overrideAccess: false,
      user,
    })
    const profile = typeof session.student === 'object' ? (session.student as StudentProfile) : null
    const profileID = relationshipID(session.student)
    const assignedCoachID = relationshipID(session.coach) || relationshipID(profile?.coach)
    if (!isAdmin(user) && assignedCoachID !== user.id) {
      return Response.json({ error: 'This player is not assigned to you.' }, { status: 403 })
    }
    if (session.status === 'completed' || session.status === 'cancelled') {
      return Response.json(
        { error: 'Only planned or scheduled sessions can be adjusted.' },
        { status: 409 },
      )
    }
    if (!profileID || session.source !== 'program') {
      return Response.json(
        { error: 'This duration control requires a generated program session.' },
        { status: 409 },
      )
    }

    if (body.scope === 'week') {
      const updatedSession = await payload.update({
        collection: 'training-sessions',
        id: session.id,
        depth: 0,
        overrideAccess: false,
        user,
        data: { durationMinutes: body.durationMinutes, durationIsOverride: true },
      })

      return Response.json({
        durationIsOverride: true,
        durationMinutes: updatedSession.durationMinutes,
        programDurationMinutes: profile?.trainingDurationMinutes || 60,
      })
    }

    if (body.scope === 'reset') {
      const programDurationMinutes = profile?.trainingDurationMinutes || 60
      const updatedSession = await payload.update({
        collection: 'training-sessions',
        id: session.id,
        depth: 0,
        overrideAccess: false,
        user,
        data: { durationMinutes: programDurationMinutes, durationIsOverride: false },
      })

      return Response.json({
        durationIsOverride: false,
        durationMinutes: updatedSession.durationMinutes,
        programDurationMinutes,
      })
    }

    const updatedProfile = await payload.update({
      collection: 'student-profiles',
      id: profileID,
      depth: 0,
      overrideAccess: false,
      user,
      context: { resetSessionDurationOverrides: true },
      data: { trainingDurationMinutes: body.durationMinutes },
    })

    return Response.json({
      durationIsOverride: false,
      durationMinutes: updatedProfile.trainingDurationMinutes,
      programDurationMinutes: updatedProfile.trainingDurationMinutes,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Unable to update training session duration')
    return Response.json({ error: 'The duration could not be updated.' }, { status: 500 })
  }
}
