import type { CollectionAfterChangeHook } from 'payload'

import type { Program, StudentProfile } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

export const syncProgramTrainingSessions: CollectionAfterChangeHook<StudentProfile> = async ({ doc, req }) => {
  const programID = relationshipID(doc.program)
  const coachID = relationshipID(doc.coach)
  const existingSessions = await req.payload.find({
    collection: 'training-sessions',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    where: {
      and: [
        { student: { equals: doc.id } },
        { source: { equals: 'program' } },
      ],
    },
  })

  if (!programID || !coachID) {
    for (const session of existingSessions.docs) {
      if (session.status === 'planned' || session.status === 'scheduled') {
        await req.payload.update({
          collection: 'training-sessions',
          id: session.id,
          data: { status: 'cancelled' },
          depth: 0,
          overrideAccess: true,
          req,
        })
      }
    }
    return doc
  }

  const program = await req.payload.findByID({
    collection: 'programs',
    id: programID,
    depth: 2,
    overrideAccess: true,
    req,
  }) as Program
  const validSessionKeys = new Set<string>()

  for (const phase of program.phases.slice().sort((a, b) => a.order - b.order)) {
    for (const lesson of (phase.lessons || []).slice().sort((a, b) => a.week - b.week)) {
      const drillIDs = lesson.drills.map(relationshipID).filter((id): id is string => Boolean(id))
      const sessionKey = `${doc.id}:${program.id}:${lesson.week}`
      validSessionKeys.add(sessionKey)

      const sessionData = {
        coach: coachID,
        durationMinutes: lesson.durationMinutes,
        lessonWeek: lesson.week,
        objective: lesson.objective,
        phase: phase.name,
        plan: {
          conditionedGame: lesson.sessionPlan?.conditionedGame,
          cooldownAndFeedback: lesson.sessionPlan?.cooldownAndFeedback,
          matchPlay: lesson.sessionPlan?.matchPlay,
          movementPreparation: lesson.sessionPlan?.movementPreparation,
          progressiveDrill: drillIDs[1] || drillIDs[0],
          technicalDrill: drillIDs[0],
          warmUp: lesson.sessionPlan?.warmUp,
        },
        program: program.id,
        sessionKey,
        source: 'program' as const,
        student: doc.id,
        successCriteria: lesson.successCriteria,
        title: `Week ${lesson.week}: ${lesson.title}`,
      }
      const existing = existingSessions.docs.find((session) => session.sessionKey === sessionKey)

      if (existing) {
        if (existing.status !== 'completed') {
          await req.payload.update({
            collection: 'training-sessions',
            id: existing.id,
            data: sessionData,
            depth: 0,
            overrideAccess: true,
            req,
          })
        }
      } else {
        await req.payload.create({
          collection: 'training-sessions',
          data: { ...sessionData, status: 'planned' },
          depth: 0,
          overrideAccess: true,
          req,
        })
      }
    }
  }

  for (const session of existingSessions.docs) {
    if (
      (session.status === 'planned' || session.status === 'scheduled')
      && (!session.sessionKey || !validSessionKeys.has(session.sessionKey))
    ) {
      await req.payload.update({
        collection: 'training-sessions',
        id: session.id,
        data: { status: 'cancelled' },
        depth: 0,
        overrideAccess: true,
        req,
      })
    }
  }

  return doc
}
