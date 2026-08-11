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
  req,
}) => {
  const programID = relationshipID(doc.program)
  if (!programID) return doc

  const program = (await req.payload.findByID({
    collection: 'programs',
    id: programID,
    depth: 2,
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
      data: practiceData,
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
        currentStepElapsedSeconds: 0,
        currentStepIndex: 0,
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
