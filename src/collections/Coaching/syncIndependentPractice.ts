import type { CollectionAfterChangeHook } from 'payload'

import type { PracticeLibrary, Program, StudentProfile } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
  return null
}

export const syncIndependentPractice: CollectionAfterChangeHook<StudentProfile> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const programID = relationshipID(doc.program)
  if (!programID) return doc

  // Skip the sync if the program relationship didn't change in this update.
  // This avoids re-fetching the program and re-syncing the practice record on
  // every profile update (e.g. onboarding field saves that don't touch the
  // program).
  const previousProgramID = relationshipID(previousDoc?.program)
  const previousWeek = previousDoc?.currentProgramWeek
  if (
    previousProgramID === programID &&
    previousWeek === doc.currentProgramWeek &&
    previousDoc?.id
  ) {
    return doc
  }

  const program = (await req.payload.findByID({
    collection: 'programs',
    id: programID,
    // depth 1 populates phases[].lessons[].independentPractice, which is the
    // only nested relationship this hook reads. depth 2 was causing the same
    // population fan-out that slowed the dashboard.
    depth: 1,
    req,
  })) as Program
  const week = Math.min(Math.max(doc.currentProgramWeek || 1, 1), program.durationWeeks)
  const phases = program.phases?.slice().sort((a, b) => a.order - b.order) || []
  const phase = phases.find((item) => week >= item.startWeek && week <= item.endWeek) || phases[0]
  const lesson = phases.flatMap((item) => item.lessons || []).find((item) => item.week === week)

  if (!phase || !lesson) return doc

  const practiceID = relationshipID(lesson.independentPractice)
  if (!practiceID) return doc
  const practice =
    typeof lesson.independentPractice === 'object'
      ? (lesson.independentPractice as PracticeLibrary)
      : await req.payload.findByID({
          collection: 'practice-library',
          id: practiceID,
          depth: 1,
          req,
        })
  const drills = practice.drills.map(relationshipID).filter((id): id is string => Boolean(id))
  if (!drills.length) return doc

  const practiceKey = `${doc.id}:${program.id}:${week}`
  const practiceData = {
    drills,
    instructions: practice.instructions,
    lessonWeek: week,
    phase: phase.name,
    practiceKey,
    practice: practice.id,
    program: program.id,
    student: doc.id,
    successCriteria: practice.successCriteria,
    title: practice.name,
  }
  const existing = await req.payload.find({
    collection: 'independent-practices',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: { practiceKey: { equals: practiceKey } },
  })

  if (existing.docs[0]) {
    await req.payload.update({
      collection: 'independent-practices',
      id: existing.docs[0].id,
      data: {
        ...practiceData,
        currentRound: Math.max(1, existing.docs[0].currentRound || 1),
      },
      depth: 0,
      overrideAccess: true,
      req,
    })
  } else {
    await req.payload.create({
      collection: 'independent-practices',
      data: {
        ...practiceData,
        currentDrillIndex: 0,
        currentDrillElapsedSeconds: 0,
        currentRound: 1,
        currentStepElapsedSeconds: 0,
        currentStepIndex: 0,
        exerciseLogs: [],
        elapsedSeconds: 0,
        status: 'assigned',
        timerStatus: 'not-started',
      },
      depth: 0,
      overrideAccess: true,
      req,
    })
  }

  return doc
}
