import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import type { StudentProfile, User } from '@/payload-types'
import { validateStudentCourtBooking } from '@/utilities/studentCourtBooking'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
  return null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  if (!user.roles?.includes('student')) {
    return Response.json({ error: 'Student access required.' }, { status: 403 })
  }

  const validation = validateStudentCourtBooking(await request.json().catch(() => null))
  if ('error' in validation) {
    return Response.json({ error: validation.error }, { status: 400 })
  }
  const booking = validation.data

  try {
    const { id } = await params
    const session = await payload.findByID({
      collection: 'training-sessions',
      id,
      depth: 1,
      overrideAccess: false,
      user,
    })
    const profile = typeof session.student === 'object' ? (session.student as StudentProfile) : null

    if (!profile || relationshipID(profile.user) !== user.id) {
      return Response.json({ error: 'This session does not belong to you.' }, { status: 403 })
    }
    if (session.source !== 'program') {
      return Response.json(
        { error: 'Only program training sessions use student court booking.' },
        { status: 409 },
      )
    }
    if (session.status !== 'planned' && session.status !== 'scheduled') {
      return Response.json(
        { error: 'Only planned or scheduled sessions can be booked.' },
        { status: 409 },
      )
    }

    const updatedSession = await payload.update({
      collection: 'training-sessions',
      id: session.id,
      depth: 0,
      overrideAccess: true,
      context: { studentCourtBooking: true },
      data: {
        courtBookedByStudent: true,
        courtBookingUpdatedAt: new Date().toISOString(),
        location: booking.location,
        scheduledAt: booking.scheduledAt,
      },
    })

    return Response.json({
      courtBookedByStudent: updatedSession.courtBookedByStudent,
      courtBookingUpdatedAt: updatedSession.courtBookingUpdatedAt,
      location: updatedSession.location,
      scheduledAt: updatedSession.scheduledAt,
      status: updatedSession.status,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Unable to save the student court booking')
    return Response.json({ error: 'The court booking could not be saved.' }, { status: 500 })
  }
}
