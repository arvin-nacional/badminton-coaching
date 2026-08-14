import config from '@payload-config'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'

import { sendStudentVerification } from '@/utilities/sendStudentVerification'
import { validateSignupInput } from '@/utilities/validateStudentSignup'

type SignupBody = {
  email?: unknown
  name?: unknown
  password?: unknown
  confirmPassword?: unknown
}

const GENERIC_SUCCESS =
  'If an account does not already exist for that email, you will receive a verification link shortly.'

export async function POST(request: Request) {
  const payload = await getPayload({ config })

  const body = (await request.json().catch(() => null)) as SignupBody | null
  const validation = validateSignupInput(body || {})

  if (!validation.valid) return Response.json({ error: validation.error }, { status: 400 })

  const { name, email } = validation

  const existing = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  })

  if (existing.docs.length) {
    // Generic message to avoid email enumeration. If the account is pending,
    // we still send a fresh verification email so the user can recover.
    if (existing.docs[0].accountStatus === 'pending') {
      try {
        await sendStudentVerification(payload, existing.docs[0])
      } catch (error) {
        payload.logger.error({ err: error }, 'Student signup resend email failed')
      }
    }
    return Response.json({ message: GENERIC_SUCCESS }, { status: 201 })
  }

  let student
  try {
    student = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'pending',
        email,
        name,
        // A random password is required by Payload; the user sets their real
        // password through the verification flow. This value is never shared.
        password: randomBytes(32).toString('base64url'),
        roles: ['student'],
      },
      overrideAccess: true,
    })
  } catch (error) {
    // Handle race-condition duplicate key errors gracefully.
    const duplicateKey =
      error && typeof error === 'object' && 'code' in error && error.code === 11000
    if (duplicateKey) {
      return Response.json({ message: GENERIC_SUCCESS }, { status: 201 })
    }
    payload.logger.error({ err: error }, 'Student signup account creation failed')
    return Response.json(
      { error: 'We could not create your account. Please try again.' },
      { status: 500 },
    )
  }

  try {
    await sendStudentVerification(payload, student)
  } catch (error) {
    payload.logger.error({ err: error }, 'Student signup verification email failed')
    // Roll back the account so the user can retry cleanly.
    await payload
      .delete({ collection: 'users', id: student.id, overrideAccess: true })
      .catch(() => {})
    return Response.json(
      {
        error:
          'Your account was created but the verification email could not be sent. Please try again.',
      },
      { status: 502 },
    )
  }

  return Response.json(
    { message: `Check your email at ${email} for a verification link.` },
    { status: 201 },
  )
}
