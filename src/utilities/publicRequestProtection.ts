import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import type { Payload } from 'payload'

export class PublicRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: number,
  ) {
    super(message)
  }
}

type GuardRecord = { _id: string; count?: number; expiresAt: Date; bookingKey?: string }

export function privateKey(value: string) {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new PublicRequestError('Please try again later.', 503)
  return createHmac('sha256', secret).update(value).digest('hex')
}

// This collection is deliberately outside Payload's public REST/GraphQL schema.
// Atomic Mongo updates share limits between processes and serverless instances.
const indexes = new WeakMap<object, Promise<unknown>>()
export async function guardCollection(payload: Payload) {
  const db = payload.db.connection?.db
  if (!db) throw new PublicRequestError('Please try again later.', 503)
  const collection = db.collection<GuardRecord>('public-request-guards')
  let ready = indexes.get(db)
  if (!ready) {
    ready = collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    indexes.set(db, ready)
  }
  try {
    await ready
  } catch (error) {
    indexes.delete(db)
    throw error
  }
  return collection
}

export function requestIdentity(request: Request) {
  // Only trust a header that the hosting proxy overwrites, never arbitrary XFF.
  const header = process.env.PUBLIC_REQUEST_IP_HEADER?.trim().toLowerCase()
  const value = header ? request.headers.get(header)?.trim() : undefined
  return value && isIP(value) ? value : 'unidentified-client'
}

export function checkPublicForm(request: Request, body: unknown) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    throw new PublicRequestError('Please submit this form from the website.', 403)
  }
  if (body && typeof body === 'object' && 'website' in body && body.website) {
    throw new PublicRequestError('Unable to submit this form.', 400)
  }
}

export async function limitPublicRequest(
  payload: Payload,
  scope: string,
  identity: string,
  limit: number,
  seconds: number,
) {
  const collection = await guardCollection(payload)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + seconds * 1000)
  const active = { $gt: ['$expiresAt', now] }
  const record = await collection.findOneAndUpdate(
    { _id: privateKey(`${scope}:${identity}`) },
    [
      {
        $set: {
          count: { $cond: [active, { $add: [{ $ifNull: ['$count', 0] }, 1] }, 1] },
          expiresAt: { $cond: [active, '$expiresAt', expiresAt] },
        },
      },
    ],
    { upsert: true, returnDocument: 'after', includeResultMetadata: false },
  )
  if (!record || (record.count ?? 0) > limit) {
    const retryAfter = Math.max(
      1,
      Math.ceil(((record?.expiresAt?.getTime() ?? expiresAt.getTime()) - now.getTime()) / 1000),
    )
    throw new PublicRequestError(
      'Too many requests. Please wait before trying again.',
      429,
      retryAfter,
    )
  }
}

export async function limitPublicEmail(payload: Payload, email: string) {
  const identity = email.trim().toLowerCase()
  await limitPublicRequest(payload, 'public-email-daily', identity, 5, 86400)
  await limitPublicRequest(payload, 'public-email-cooldown', identity, 1, 60)
}

export function publicErrorResponse(error: unknown) {
  if (error instanceof PublicRequestError) {
    return Response.json(
      { error: error.message },
      {
        status: error.status,
        headers: error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : undefined,
      },
    )
  }
  // No process-local fallback: a storage failure must not remove the limits.
  return Response.json(
    { error: 'This service is temporarily unavailable. Please try again later.' },
    { status: 503 },
  )
}
