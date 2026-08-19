import { generateKeyPairSync, sign, type JsonWebKey } from 'node:crypto'

import { createGoogleIDTokenVerifier, GoogleIdentityError } from '@/utilities/googleIdentity'
import { beforeAll, describe, expect, it } from 'vitest'

const CLIENT_ID = 'test-client.apps.googleusercontent.com'
const KID = 'test-key'
const NOW = 1_800_000_000_000

let privateKey: ReturnType<typeof generateKeyPairSync>['privateKey']
let publicJWK: JsonWebKey

function credential(overrides: Record<string, unknown> = {}) {
  const nowSeconds = Math.floor(NOW / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: KID, typ: 'JWT' })).toString(
    'base64url',
  )
  const claims = Buffer.from(
    JSON.stringify({
      aud: CLIENT_ID,
      email: 'Student@Example.com',
      email_verified: true,
      exp: nowSeconds + 3600,
      iat: nowSeconds,
      iss: 'https://accounts.google.com',
      name: 'Test Student',
      sub: 'google-subject-123',
      ...overrides,
    }),
  ).toString('base64url')
  const signature = sign('RSA-SHA256', Buffer.from(`${header}.${claims}`), privateKey).toString(
    'base64url',
  )

  return `${header}.${claims}.${signature}`
}

function verifier() {
  return createGoogleIDTokenVerifier({
    fetchImpl: async () =>
      new Response(
        JSON.stringify({ keys: [{ ...publicJWK, alg: 'RS256', kid: KID, use: 'sig' }] }),
        { headers: { 'Cache-Control': 'public, max-age=3600' } },
      ),
    now: () => NOW,
  })
}

describe('Google ID token verification', () => {
  beforeAll(() => {
    const pair = generateKeyPairSync('rsa', { modulusLength: 2048 })
    privateKey = pair.privateKey
    publicJWK = pair.publicKey.export({ format: 'jwk' })
  })

  it('accepts a valid Google credential and normalizes its email', async () => {
    await expect(verifier()(credential(), CLIENT_ID)).resolves.toEqual({
      email: 'student@example.com',
      emailVerified: true,
      name: 'Test Student',
      picture: undefined,
      subject: 'google-subject-123',
    })
  })

  it.each([
    ['a different OAuth client', { aud: 'other-client.apps.googleusercontent.com' }],
    ['an expired token', { exp: Math.floor(NOW / 1000) - 120 }],
    ['an unverified email', { email_verified: false }],
    ['an invalid issuer', { iss: 'https://example.com' }],
    ['a missing stable subject', { sub: '' }],
  ])('rejects %s', async (_label, overrides) => {
    await expect(verifier()(credential(overrides), CLIENT_ID)).rejects.toBeInstanceOf(
      GoogleIdentityError,
    )
  })

  it('rejects a credential whose signed content was changed', async () => {
    const token = credential()
    const [header, claims, signature] = token.split('.')
    const tamperedClaims = Buffer.from(
      JSON.stringify({
        ...JSON.parse(Buffer.from(claims, 'base64url').toString('utf8')),
        email: 'attacker@example.com',
      }),
    ).toString('base64url')

    await expect(
      verifier()(`${header}.${tamperedClaims}.${signature}`, CLIENT_ID),
    ).rejects.toBeInstanceOf(GoogleIdentityError)
  })
})
