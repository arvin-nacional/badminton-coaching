import type { CollectionAfterDeleteHook } from 'payload'

import type { AssessmentBooking } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }
  return null
}

export const syncStudentProfileAfterAssessmentDelete: CollectionAfterDeleteHook<
  AssessmentBooking
> = async ({ doc, req }) => {
  const studentID = relationshipID(doc.student)
  if (!studentID) return doc

  const profile = await req.payload
    .findByID({
      collection: 'student-profiles',
      id: studentID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    .catch(() => null)

  // Never move a completed/current assessment back to required.
  if (!profile || profile.assessmentStatus !== 'scheduled') return doc

  const remainingBookings = await req.payload.find({
    collection: 'assessment-bookings',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [{ student: { equals: studentID } }, { status: { equals: 'confirmed' } }],
    },
  })

  if (remainingBookings.docs.length) return doc

  await req.payload.update({
    collection: 'student-profiles',
    id: studentID,
    data: { assessmentStatus: 'required' },
    depth: 0,
    overrideAccess: true,
    req,
  })

  return doc
}
