import type { CollectionAfterChangeHook } from 'payload'

import type { PracticeLibrary } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

export const syncPracticeLibraryInstances: CollectionAfterChangeHook<PracticeLibrary> = async ({ doc, req }) => {
  const instances = await req.payload.find({
    collection: 'independent-practices',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    where: { practice: { equals: doc.id } },
  })
  const drills = doc.drills.map(relationshipID).filter((id): id is string => Boolean(id))

  for (const instance of instances.docs) {
    await req.payload.update({
      collection: 'independent-practices',
      id: instance.id,
      depth: 0,
      overrideAccess: true,
      req,
      data: {
        drills,
        instructions: doc.instructions,
        successCriteria: doc.successCriteria,
        title: doc.name,
      },
    })
  }

  return doc
}
