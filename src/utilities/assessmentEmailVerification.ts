import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import type { Payload } from 'payload'
import {
  guardCollection,
  limitPublicRequest,
  privateKey,
  PublicRequestError,
} from './publicRequestProtection'

type Proof = { email: string; code: string; nonce: string; expires: number }
const invalid = () =>
  new PublicRequestError('Enter a valid confirmation code, or request a new one.', 403)
const sign = (data: string) =>
  createHmac('sha256', privateKey('assessment-email-signature')).update(data).digest('base64url')
const equal = (a: string, b: string) => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function createAssessmentEmailCode(email: string) {
  const code = String(randomInt(100000, 1000000))
  const nonce = randomBytes(24).toString('hex')
  const proof: Proof = {
    email: privateKey(`email:${email.trim().toLowerCase()}`),
    code: privateKey(`${nonce}:${code}`),
    nonce,
    expires: Date.now() + 10 * 60 * 1000,
  }
  const data = Buffer.from(JSON.stringify(proof)).toString('base64url')
  return { code, token: `${data}.${sign(data)}` }
}

export async function verifyAssessmentEmailCode(
  payload: Payload,
  email: string,
  token: unknown,
  code: unknown,
) {
  if (
    typeof token !== 'string' ||
    token.length > 1500 ||
    typeof code !== 'string' ||
    !/^\d{6}$/.test(code)
  )
    throw invalid()
  const parts = token.split('.')
  if (
    parts.length !== 2 ||
    !/^[A-Za-z0-9_-]{43}$/.test(parts[1]) ||
    !equal(sign(parts[0]), parts[1])
  )
    throw invalid()
  let proof: Proof
  try {
    proof = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
  } catch {
    throw invalid()
  }
  if (
    !proof ||
    typeof proof.nonce !== 'string' ||
    !/^[a-f0-9]{48}$/.test(proof.nonce) ||
    typeof proof.code !== 'string' ||
    !/^[a-f0-9]{64}$/.test(proof.code) ||
    !Number.isFinite(proof.expires) ||
    proof.expires <= Date.now() ||
    proof.email !== privateKey(`email:${email.trim().toLowerCase()}`)
  )
    throw invalid()
  await limitPublicRequest(payload, 'assessment-code-attempts', proof.nonce, 5, 600)
  if (!equal(proof.code, privateKey(`${proof.nonce}:${code}`))) throw invalid()
  return proof
}

export async function claimAssessmentEmailCode(payload: Payload, proof: Proof, bookingKey: string) {
  if (proof.expires <= Date.now()) throw invalid()
  const collection = await guardCollection(payload)
  const record = await collection.findOneAndUpdate(
    { _id: privateKey(`assessment-code-claim:${proof.nonce}`) },
    { $setOnInsert: { bookingKey, expiresAt: new Date(proof.expires) } },
    { upsert: true, returnDocument: 'after', includeResultMetadata: false },
  )
  // Retries for the same booking are permitted; a code cannot reserve other slots.
  if (!record || record.bookingKey !== bookingKey)
    throw new PublicRequestError(
      'This code was used for another time. Request a new code to change times.',
      403,
    )
}
