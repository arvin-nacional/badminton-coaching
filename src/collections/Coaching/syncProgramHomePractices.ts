import type { CollectionBeforeValidateHook } from 'payload'

import type { Drill, PracticeLibrary, Program } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
  return null
}

const relationshipIDs = (values: unknown[] | null | undefined) =>
  (values || []).map(relationshipID).filter((id): id is string => Boolean(id))

export const homePracticeName = (programName: string, week: number, lessonTitle: string) =>
  `${programName} - Week ${week}: ${lessonTitle}`

export const programHomePracticeSuccessCriteria =
  'Finish every guided round in each assigned drill. Your coach will review the saved workout time and exercise logs; note one technical improvement to discuss at the next lesson.'

export const programHomePracticeInstructions = (
  objective: string,
  weeklyPractice?: string | null,
) =>
  [
    'Complete the assigned drills in order in a clear, non-slip space with enough room for every movement and swing.',
    `Lesson objective: ${objective}`,
    `Weekly practice: ${weeklyPractice || objective}`,
  ].join('\n\n')

export const syncProgramHomePractices: CollectionBeforeValidateHook<Program> = async ({
  data,
  originalDoc,
  req,
}) => {
  const nextData = data || {}
  const programName = nextData.name || originalDoc?.name
  const programLevel = nextData.level || originalDoc?.level
  const phases = nextData.phases || originalDoc?.phases
  if (!programName || !programLevel || !phases) return data
  nextData.phases = phases

  const originalLessons = new Map(
    (originalDoc?.phases || [])
      .flatMap((phase) => phase.lessons || [])
      .map((lesson) => [lesson.week, lesson] as const),
  )

  for (const phase of phases) {
    for (const lesson of phase.lessons || []) {
      const originalLesson = originalLessons.get(lesson.week)
      let practiceID =
        relationshipID(lesson.independentPractice) ||
        relationshipID(originalLesson?.independentPractice)
      let homeDrillIDs = relationshipIDs(lesson.homeDrills)

      if (!homeDrillIDs.length && practiceID) {
        const practice = (await req.payload.findByID({
          collection: 'practice-library',
          id: practiceID,
          depth: 0,
          overrideAccess: true,
          req,
        })) as PracticeLibrary
        homeDrillIDs = relationshipIDs(practice.drills)
      }

      if (!homeDrillIDs.length) continue

      const homeDrills = await req.payload.find({
        collection: 'drills',
        depth: 0,
        limit: homeDrillIDs.length,
        overrideAccess: true,
        req,
        where: {
          and: [{ id: { in: homeDrillIDs } }, { practiceSetting: { equals: 'home' } }],
        },
      })
      const homeDrillByID = new Map(homeDrills.docs.map((drill) => [drill.id, drill as Drill]))
      const validHomeDrillIDs = homeDrillIDs.filter((id) => homeDrillByID.has(id))
      if (!validHomeDrillIDs.length) continue

      const name = homePracticeName(programName, lesson.week, lesson.title)
      const practiceData = {
        name,
        level: programLevel,
        instructions: programHomePracticeInstructions(
          lesson.objective,
          lesson.homePracticeInstructions,
        ),
        drills: validHomeDrillIDs,
        durationMinutes: Math.max(
          1,
          validHomeDrillIDs.reduce(
            (total, drillID) => total + (homeDrillByID.get(drillID)?.durationMinutes || 0),
            0,
          ),
        ),
        successCriteria: programHomePracticeSuccessCriteria,
      }

      if (!practiceID) {
        const existing = await req.payload.find({
          collection: 'practice-library',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          req,
          where: { name: { equals: name } },
        })
        practiceID = existing.docs[0]?.id || null
      }

      const practice = practiceID
        ? await req.payload.update({
            collection: 'practice-library',
            id: practiceID,
            depth: 0,
            data: practiceData,
            overrideAccess: true,
            req,
          })
        : await req.payload.create({
            collection: 'practice-library',
            depth: 0,
            data: practiceData,
            overrideAccess: true,
            req,
          })

      lesson.homeDrills = validHomeDrillIDs
      lesson.independentPractice = practice.id
    }
  }

  return nextData
}
