import config from '@payload-config'
import { headers } from 'next/headers'
import { commitTransaction, createLocalReq, getPayload, initTransaction, killTransaction } from 'payload'

import type { StudentProfile, User } from '@/payload-types'
import { isAdmin, isCoach } from '@/utilities/dashboardAuth'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  if (!isCoach(user)) return Response.json({ error: 'Coach access required.' }, { status: 403 })

  const body = await request.json().catch(() => null) as { attendance?: unknown; coachNotes?: unknown; studentSummary?: unknown } | null
  if (body?.attendance !== 'present' && body?.attendance !== 'late') return Response.json({ error: 'Choose Present or Late attendance.' }, { status: 400 })
  if (body.coachNotes !== undefined && typeof body.coachNotes !== 'string') return Response.json({ error: 'Coach notes must be text.' }, { status: 400 })
  if (body.studentSummary !== undefined && typeof body.studentSummary !== 'string') return Response.json({ error: 'Student summary must be text.' }, { status: 400 })

  try {
    const { id } = await params
    const session = await payload.findByID({ collection: 'training-sessions', id, depth: 1, overrideAccess: false, user })
    const profile = typeof session.student === 'object' ? session.student as StudentProfile : null
    const assignedCoachID = relationshipID(session.coach) || relationshipID(profile?.coach)
    if (!isAdmin(user) && assignedCoachID !== user.id) return Response.json({ error: 'This player is not assigned to you.' }, { status: 403 })
    if (session.status === 'completed') return Response.json({ alreadyCompleted: true, message: 'This session was already completed.' })

    const scorecards = await payload.find({ collection: 'session-skill-scores', depth: 0, limit: 100, overrideAccess: false, user, where: { and: [{ session: { equals: session.id } }, { status: { not_equals: 'not-assessed' } }] } })
    const pendingScores = scorecards.docs.filter((score) => score.status !== 'scored')
    if (scorecards.totalDocs > 0 && pendingScores.length > 0) {
      return Response.json({ error: `Assess the remaining ${pendingScores.length} ${pendingScores.length === 1 ? 'skill' : 'skills'} before completing this session.` }, { status: 409 })
    }

    const localReq = await createLocalReq({ user }, payload)
    const transactionStarted = await initTransaction(localReq)
    try {
      const currentSession = await payload.findByID({ collection: 'training-sessions', id: session.id, depth: 1, overrideAccess: true, req: localReq })
      if (currentSession.status === 'completed') {
        if (transactionStarted) await commitTransaction(localReq)
        return Response.json({ alreadyCompleted: true, message: 'This session was already completed.' })
      }
      const studentID = relationshipID(currentSession.student)
      if (!studentID) throw new Error('The session does not have a student profile.')

      await payload.update({
        collection: 'training-sessions',
        id: currentSession.id,
        depth: 0,
        overrideAccess: true,
        req: localReq,
        data: {
          attendance: body.attendance,
          coachNotes: typeof body.coachNotes === 'string' ? body.coachNotes.trim().slice(0, 5000) || null : null,
          completedAt: new Date().toISOString(),
          status: 'completed',
          studentSummary: typeof body.studentSummary === 'string' ? body.studentSummary.trim().slice(0, 5000) || null : null,
        },
      })

      const updatedProfile = await payload.findByID({
        collection: 'student-profiles',
        id: studentID,
        depth: 0,
        overrideAccess: true,
        req: localReq,
      })

      if (transactionStarted) await commitTransaction(localReq)
      return Response.json({
        attendanceRate: updatedProfile.attendanceRate,
        currentProgramWeek: updatedProfile.currentProgramWeek,
        sessionsRemaining: updatedProfile.sessionsRemaining,
        status: 'completed',
      })
    } catch (error) {
      if (transactionStarted) await killTransaction(localReq)
      throw error
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Unable to complete training session')
    return Response.json({ error: 'The session could not be completed.' }, { status: 500 })
  }
}
