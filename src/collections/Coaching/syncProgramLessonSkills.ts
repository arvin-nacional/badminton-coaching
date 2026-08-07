import type { CollectionBeforeValidateHook } from 'payload'

import type { Drill, Program } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

export const syncProgramLessonSkills: CollectionBeforeValidateHook<Program> = async ({ data, req }) => {
  if (!data?.phases) return data

  const drillIDs = Array.from(new Set(
    data.phases
      .flatMap((phase) => phase.lessons || [])
      .flatMap((lesson) => lesson.drills || [])
      .map(relationshipID)
      .filter((id): id is string => Boolean(id)),
  ))
  const drills = drillIDs.length
    ? await req.payload.find({
        collection: 'drills',
        depth: 0,
        limit: drillIDs.length,
        overrideAccess: true,
        req,
        where: { id: { in: drillIDs } },
      })
    : null
  const skillByDrillID = new Map(
    (drills?.docs || []).map((drill) => [drill.id, relationshipID((drill as Drill).skill)]),
  )

  data.phases = data.phases.map((phase) => ({
    ...phase,
    lessons: (phase.lessons || []).map((lesson) => ({
      ...lesson,
      skills: Array.from(new Set(
        (lesson.drills || [])
          .map(relationshipID)
          .map((drillID) => drillID ? skillByDrillID.get(drillID) : null)
          .filter((skillID): skillID is string => Boolean(skillID)),
      )),
    })),
  }))

  return data
}
