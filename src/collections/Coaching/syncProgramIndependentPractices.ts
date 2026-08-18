import type { CollectionAfterChangeHook } from 'payload'

import type { Program } from '@/payload-types'

export const syncProgramIndependentPractices: CollectionAfterChangeHook<Program> = async ({
  doc,
  req,
}) => {
  const profiles = await req.payload.find({
    collection: 'student-profiles',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    where: { program: { equals: doc.id } },
  })

  for (const profile of profiles.docs) {
    await req.payload.update({
      collection: 'student-profiles',
      id: profile.id,
      depth: 0,
      data: { currentProgramWeek: profile.currentProgramWeek || 1 },
      context: { forceProgramSync: true },
      overrideAccess: true,
      req,
    })
  }

  return doc
}
