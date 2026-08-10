import config from '@payload-config'
import { getPayload } from 'payload'

type ActivationBody = { confirmPassword?: unknown; password?: unknown; token?: unknown }

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const body = (await request.json().catch(() => null)) as ActivationBody | null
  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : ''

  if (!token) return Response.json({ error: 'This invitation link is invalid.' }, { status: 400 })
  if (password.length < 8)
    return Response.json(
      { error: 'Your password must have at least 8 characters.' },
      { status: 400 },
    )
  if (password !== confirmPassword)
    return Response.json({ error: 'The passwords do not match.' }, { status: 400 })

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    showHiddenFields: true,
    where: {
      and: [{ resetPasswordToken: { equals: token } }, { accountStatus: { equals: 'pending' } }],
    },
  })
  const user = users.docs[0]
  if (
    !user ||
    !user.resetPasswordExpiration ||
    new Date(user.resetPasswordExpiration) <= new Date()
  ) {
    return Response.json(
      {
        error: 'This invitation has expired or has already been used. Ask your coach to resend it.',
      },
      { status: 400 },
    )
  }

  try {
    await payload.resetPassword({
      collection: 'users',
      context: { activatingStudent: true },
      data: { password, token },
      overrideAccess: true,
    })
  } catch {
    return Response.json(
      {
        error: 'This invitation has expired or has already been used. Ask your coach to resend it.',
      },
      { status: 400 },
    )
  }

  return Response.json({ message: 'Your account is active. You can now sign in.' })
}
