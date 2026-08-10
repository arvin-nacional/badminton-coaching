import config from '@payload-config'
import { randomBytes } from 'crypto'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'
import { isCoach } from '@/utilities/dashboardAuth'
import { sendStudentInvitation } from '@/utilities/sendStudentInvitation'

type InvitationBody = { email?: unknown; name?: unknown }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function authenticatedCoach() {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  return { payload, user }
}

export async function POST(request: Request) {
  const { payload, user } = await authenticatedCoach()
  if (!user) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
  if (!isCoach(user))
    return Response.json({ error: 'Only coaches can invite students.' }, { status: 403 })

  const body = (await request.json().catch(() => null)) as InvitationBody | null
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!name) return Response.json({ error: 'Enter the student’s name.' }, { status: 400 })
  if (!emailPattern.test(email))
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })

  const existing = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user,
    where: { email: { equals: email } },
  })
  if (existing.docs.length) {
    return Response.json(
      {
        error:
          existing.docs[0].accountStatus === 'pending'
            ? 'This student already has a pending invitation. Use resend instead.'
            : 'An active account already uses this email address.',
      },
      { status: 409 },
    )
  }

  const student = await payload.create({
    collection: 'users',
    data: {
      accountStatus: 'pending',
      email,
      name,
      password: randomBytes(32).toString('base64url'),
      roles: ['student'],
    },
    overrideAccess: false,
    user,
  })

  const profiles = await payload.find({
    collection: 'student-profiles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { user: { equals: student.id } },
  })
  if (profiles.docs[0]) {
    await payload.update({
      collection: 'student-profiles',
      id: profiles.docs[0].id,
      data: { coach: user.id },
      overrideAccess: false,
      user,
    })
  }

  try {
    await sendStudentInvitation(payload, student)
  } catch (error) {
    payload.logger.error({ err: error }, 'Student invitation email failed')
    return Response.json(
      {
        error:
          'The account was created, but the invitation email could not be sent. Use resend after checking the email configuration.',
      },
      { status: 502 },
    )
  }

  return Response.json({ message: `Invitation sent to ${email}.` }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { payload, user } = await authenticatedCoach()
  if (!user) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
  if (!isCoach(user))
    return Response.json({ error: 'Only coaches can resend invitations.' }, { status: 403 })

  const body = (await request.json().catch(() => null)) as InvitationBody | null
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!emailPattern.test(email))
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })

  const existing = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user,
    where: { email: { equals: email } },
  })
  const student = existing.docs[0]
  if (!student || !student.roles?.includes('student'))
    return Response.json({ error: 'No student account uses that email address.' }, { status: 404 })
  if (student.accountStatus !== 'pending')
    return Response.json(
      { error: 'This student has already activated their account.' },
      { status: 409 },
    )

  try {
    await sendStudentInvitation(payload, student)
  } catch (error) {
    payload.logger.error({ err: error }, 'Student invitation resend failed')
    return Response.json(
      {
        error:
          'The invitation email could not be sent. Check the email configuration and try again.',
      },
      { status: 502 },
    )
  }

  return Response.json({ message: `A new invitation was sent to ${email}.` })
}
