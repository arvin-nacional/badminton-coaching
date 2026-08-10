import config from '@payload-config'
import { randomUUID } from 'crypto'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'
import { isAdmin, isCoach } from '@/utilities/dashboardAuth'

const idOf = (value: unknown) =>
  typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? String(value.id)
      : null

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  if (!isCoach(user)) return Response.json({ error: 'Coach access required.' }, { status: 403 })

  const { id } = await params
  const profile = await payload
    .findByID({ collection: 'student-profiles', id, depth: 2, overrideAccess: false, user })
    .catch(() => null)
  if (!profile || (!isAdmin(user) && idOf(profile.coach) !== user.id)) {
    return Response.json({ error: 'This student is not assigned to you.' }, { status: 403 })
  }
  const studentUser = typeof profile.user === 'object' ? profile.user : null
  if (!studentUser?.email)
    return Response.json(
      { error: 'This student does not have a connected account email.' },
      { status: 400 },
    )

  const existingAssessments = await payload.find({
    collection: 'assessment-bookings',
    depth: 0,
    limit: 1,
    sort: '-createdAt',
    overrideAccess: false,
    user,
    where: {
      and: [
        { student: { equals: profile.id } },
        { source: { equals: 'direct' } },
        { status: { equals: 'confirmed' } },
      ],
    },
  })
  if (existingAssessments.docs[0]) {
    return Response.json({ assessmentID: existingAssessments.docs[0].id })
  }

  const now = new Date().toISOString()
  const assessment = await payload.create({
    collection: 'assessment-bookings',
    data: {
      bookingKey: `direct:${profile.id}:${randomUUID()}`,
      coach: user.id,
      durationMinutes: 60,
      email: studentUser.email,
      location: 'Direct coach assessment',
      playerName: profile.displayName,
      source: 'direct',
      startsAt: now,
      status: 'confirmed',
      student: profile.id,
    },
    overrideAccess: false,
    user,
  })

  await payload.update({
    collection: 'student-profiles',
    id: profile.id,
    data: { assessmentStatus: 'required' },
    overrideAccess: false,
    user,
  })

  return Response.json({ assessmentID: assessment.id })
}
