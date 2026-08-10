import { randomBytes } from 'crypto'
import type { Payload } from 'payload'

import type { AssessmentBooking, User } from '@/payload-types'
import { sendStudentInvitation } from '@/utilities/sendStudentInvitation'

const relationshipID = (value: unknown) =>
  typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? String(value.id)
      : null

export async function connectAssessmentStudent(
  payload: Payload,
  coach: User,
  booking: AssessmentBooking,
) {
  const linkedProfileID = relationshipID(booking.student)
  if (linkedProfileID) {
    await payload.update({
      collection: 'student-profiles',
      id: linkedProfileID,
      data: { assessmentStatus: 'current' },
      overrideAccess: false,
      user: coach,
    })
    return { profileID: linkedProfileID, invitation: 'already-linked' as const }
  }

  const email = booking.email.trim().toLowerCase()
  const existingUsers = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user: coach,
    where: { email: { equals: email } },
  })
  let student = existingUsers.docs[0]
  let invitation: 'active' | 'already-pending' | 'sent' = 'active'
  let shouldSendInvitation = false

  if (student && !student.roles?.includes('student')) {
    throw new Error('An existing non-student account uses this email address.')
  }

  if (!student) {
    student = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'pending',
        email,
        name: booking.playerName,
        password: randomBytes(32).toString('base64url'),
        roles: ['student'],
      },
      overrideAccess: false,
      user: coach,
    })
    invitation = 'sent'
    shouldSendInvitation = true
  } else if (student.accountStatus === 'pending') {
    invitation = 'already-pending'
  }

  const profiles = await payload.find({
    collection: 'student-profiles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { user: { equals: student.id } },
  })
  const profile = profiles.docs[0]
  if (!profile) throw new Error('The student profile could not be created.')

  await payload.update({
    collection: 'student-profiles',
    id: profile.id,
    data: { assessmentStatus: 'current', coach: coach.id },
    overrideAccess: false,
    user: coach,
  })
  await payload.update({
    collection: 'assessment-bookings',
    id: booking.id,
    data: { student: profile.id },
    overrideAccess: false,
    user: coach,
  })

  if (shouldSendInvitation) await sendStudentInvitation(payload, student)

  return { profileID: profile.id, invitation }
}
