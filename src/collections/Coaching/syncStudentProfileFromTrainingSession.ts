import type { CollectionAfterChangeHook } from 'payload'

import type { TrainingSession } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
  return null
}

export const syncStudentProfileFromTrainingSession: CollectionAfterChangeHook<
  TrainingSession
> = async ({ doc, previousDoc, req }) => {
  const affectsProgress = (session: TrainingSession | undefined) =>
    Boolean(
      session &&
      (session.status === 'completed' ||
        ['present', 'late', 'absent'].includes(session.attendance || '')),
    )
  const progressionChanged =
    (affectsProgress(doc) || affectsProgress(previousDoc)) &&
    (doc.status !== previousDoc?.status ||
      doc.attendance !== previousDoc?.attendance ||
      relationshipID(doc.student) !== relationshipID(previousDoc?.student))

  if (!progressionChanged) return doc

  const studentIDs = new Set(
    [relationshipID(doc.student), relationshipID(previousDoc?.student)].filter((id): id is string =>
      Boolean(id),
    ),
  )

  for (const studentID of studentIDs) {
    const trackedSessions = await req.payload.find({
      collection: 'training-sessions',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      req,
      sort: '-completedAt',
      where: {
        and: [
          { student: { equals: studentID } },
          {
            or: [
              { status: { equals: 'completed' } },
              { attendance: { in: ['present', 'late', 'absent'] } },
            ],
          },
        ],
      },
    })
    const attendanceSessions = trackedSessions.docs.filter((session) =>
      ['present', 'late', 'absent'].includes(session.attendance || ''),
    )
    const attendedCount = attendanceSessions.filter(
      (session) => session.attendance === 'present' || session.attendance === 'late',
    ).length
    const latestCompleted = trackedSessions.docs.find((session) => session.status === 'completed')

    await req.payload.update({
      collection: 'student-profiles',
      id: studentID,
      depth: 0,
      overrideAccess: true,
      req,
      data: {
        attendanceRate: attendanceSessions.length
          ? Math.round((attendedCount / attendanceSessions.length) * 100)
          : 100,
        lastTrainingAt: latestCompleted?.completedAt || latestCompleted?.scheduledAt || null,
      },
    })
  }

  return doc
}
