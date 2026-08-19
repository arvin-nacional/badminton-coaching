import { randomBytes } from 'node:crypto'

import config from '@payload-config'
import { createLocalReq, getFieldsToSign, getPayload, jwtSign, type PayloadRequest } from 'payload'
import { addSessionToUser, generatePayloadCookie } from 'payload/shared'

import { GoogleIdentityError, verifyGoogleIDToken } from '@/utilities/googleIdentity'

type GoogleAuthIntent = 'signin' | 'signup'

class GoogleAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

function isStudentOnly(roles: string[] | null | undefined) {
  return Boolean(roles?.includes('student') && !roles.includes('admin') && !roles.includes('coach'))
}

function fallbackName(email: string) {
  return email.split('@')[0].replace(/[._-]+/g, ' ').trim().slice(0, 120) || 'Student'
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(request.url).origin
}

async function findGoogleUser(
  payload: Awaited<ReturnType<typeof getPayload>>,
  req: PayloadRequest,
  subject: string,
  email: string,
) {
  const bySubject = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    showHiddenFields: true,
    where: { googleSubject: { equals: subject } },
  })
  if (bySubject.docs[0]) return bySubject.docs[0]

  const byEmail = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    showHiddenFields: true,
    where: { email: { equals: email } },
  })

  return byEmail.docs[0]
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) throw new GoogleAuthError('Invalid request origin.', 403)

    const clientID = process.env.GOOGLE_CLIENT_ID?.trim()
    if (!clientID) throw new GoogleAuthError('Google sign-in is not configured.', 503)

    const body = (await request.json().catch(() => null)) as {
      credential?: unknown
      intent?: unknown
    } | null
    const intent = body?.intent
    if (intent !== 'signin' && intent !== 'signup') {
      throw new GoogleAuthError('Choose Google sign in or sign up.', 400)
    }
    if (typeof body?.credential !== 'string') {
      throw new GoogleAuthError('Google did not return a credential.', 400)
    }

    const identity = await verifyGoogleIDToken(body.credential, clientID)
    const payload = await getPayload({ config })
    const req = await createLocalReq({ req: { headers: request.headers } }, payload)
    let user = await findGoogleUser(payload, req, identity.subject, identity.email)

    if (!user && intent === 'signin') {
      throw new GoogleAuthError(
        'No student account uses this Google address. Create an account first.',
        404,
      )
    }

    if (user && !isStudentOnly(user.roles)) {
      throw new GoogleAuthError('Coach and administrator accounts must sign in with a password.', 403)
    }

    if (user?.googleSubject && user.googleSubject !== identity.subject) {
      throw new GoogleAuthError('This email is already linked to another Google account.', 409)
    }

    if (!user) {
      user = await payload.create({
        collection: 'users',
        data: {
          accountStatus: 'active',
          email: identity.email,
          googleSubject: identity.subject,
          invitationAcceptedAt: new Date().toISOString(),
          name: (identity.name || fallbackName(identity.email)).slice(0, 120),
          password: randomBytes(48).toString('base64url'),
          roles: ['student'],
        },
        overrideAccess: true,
        req,
        showHiddenFields: true,
      })
    } else if (!user.googleSubject || user.accountStatus === 'pending') {
      user = await payload.update({
        collection: 'users',
        id: user.id,
        context: { ...req.context, activatingStudent: true },
        data: {
          accountStatus: 'active',
          googleSubject: identity.subject,
          invitationAcceptedAt: user.invitationAcceptedAt || new Date().toISOString(),
          name: user.name || (identity.name || fallbackName(identity.email)).slice(0, 120),
        },
        overrideAccess: true,
        req,
        showHiddenFields: true,
      })
    }

    const collectionConfig = payload.collections.users.config
    if (!collectionConfig.auth) throw new GoogleAuthError('Authentication is unavailable.', 503)

    const { sid } = await addSessionToUser({ collectionConfig, payload, req, user })
    const { exp, token } = await jwtSign({
      fieldsToSign: getFieldsToSign({
        collectionConfig,
        email: user.email,
        sid,
        user,
      }),
      secret: payload.secret,
      tokenExpiration: collectionConfig.auth.tokenExpiration,
    })
    const cookie = generatePayloadCookie({
      collectionAuthConfig: collectionConfig.auth,
      cookiePrefix: payload.config.cookiePrefix,
      token,
    })

    return Response.json(
      {
        exp,
        message: intent === 'signup' ? 'Student account created.' : 'Signed in with Google.',
        user: { id: user.id, name: user.name, roles: user.roles },
      },
      { headers: { 'Set-Cookie': cookie } },
    )
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof GoogleIdentityError) {
      return Response.json({ error: error.message }, { status: 401 })
    }

    console.error('Google authentication failed', error)
    return Response.json({ error: 'Google sign-in is temporarily unavailable.' }, { status: 500 })
  }
}
