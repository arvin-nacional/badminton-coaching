import { createPublicKey, verify, type JsonWebKey } from 'node:crypto'

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs'
const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com'])
const CLOCK_SKEW_SECONDS = 60

type GoogleJWK = JsonWebKey & {
  alg?: string
  kid: string
  kty: string
  use?: string
}

type GoogleJWKS = {
  keys: GoogleJWK[]
}

export type GoogleIdentity = {
  email: string
  emailVerified: true
  name?: string
  picture?: string
  subject: string
}

type VerifierOptions = {
  fetchImpl?: typeof fetch
  now?: () => number
}

function decodeJSONPart(part: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<string, unknown>
  } catch {
    throw new GoogleIdentityError('The Google credential is malformed.')
  }
}

function getCacheLifetime(response: Response): number {
  const match = response.headers.get('cache-control')?.match(/max-age=(\d+)/i)
  const seconds = match ? Number(match[1]) : 3600

  return Math.min(Math.max(seconds, 60), 21600) * 1000
}

export class GoogleIdentityError extends Error {
  constructor(message = 'Google could not verify this account.') {
    super(message)
    this.name = 'GoogleIdentityError'
  }
}

export function createGoogleIDTokenVerifier(options: VerifierOptions = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  const now = options.now ?? Date.now
  let cachedKeys: GoogleJWK[] = []
  let keysExpireAt = 0

  async function refreshSigningKeys() {
    try {
      const response = await fetchImpl(GOOGLE_CERTS_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) throw new GoogleIdentityError()

      const body = (await response.json()) as Partial<GoogleJWKS>
      if (!Array.isArray(body.keys)) throw new GoogleIdentityError()

      cachedKeys = body.keys.filter(
        (key): key is GoogleJWK =>
          typeof key === 'object' &&
          key !== null &&
          typeof key.kid === 'string' &&
          key.kty === 'RSA' &&
          (!key.use || key.use === 'sig') &&
          (!key.alg || key.alg === 'RS256'),
      )
      keysExpireAt = now() + getCacheLifetime(response)
    } catch (error) {
      if (error instanceof GoogleIdentityError) throw error
      throw new GoogleIdentityError()
    }
  }

  async function getSigningKey(kid: string): Promise<GoogleJWK> {
    const cacheWasCurrent = cachedKeys.length > 0 && now() < keysExpireAt
    if (!cacheWasCurrent) await refreshSigningKeys()

    let key = cachedKeys.find((candidate) => candidate.kid === kid)
    if (!key && cacheWasCurrent) {
      // Google can rotate keys before the advertised cache lifetime ends.
      await refreshSigningKeys()
      key = cachedKeys.find((candidate) => candidate.kid === kid)
    }

    if (!key) throw new GoogleIdentityError()
    return key
  }

  return async function verifyGoogleIDToken(
    credential: string,
    clientID: string,
  ): Promise<GoogleIdentity> {
    if (!credential || credential.length > 10000) {
      throw new GoogleIdentityError('The Google credential is malformed.')
    }

    const parts = credential.split('.')
    if (parts.length !== 3) throw new GoogleIdentityError('The Google credential is malformed.')

    const [encodedHeader, encodedClaims, encodedSignature] = parts
    const header = decodeJSONPart(encodedHeader)
    const claims = decodeJSONPart(encodedClaims)

    if (header.alg !== 'RS256' || typeof header.kid !== 'string') {
      throw new GoogleIdentityError()
    }

    const signingKey = await getSigningKey(header.kid)
    const validSignature = verify(
      'RSA-SHA256',
      Buffer.from(`${encodedHeader}.${encodedClaims}`),
      createPublicKey({ format: 'jwk', key: signingKey }),
      Buffer.from(encodedSignature, 'base64url'),
    )

    if (!validSignature) throw new GoogleIdentityError()

    const currentTime = Math.floor(now() / 1000)
    if (
      !GOOGLE_ISSUERS.has(String(claims.iss)) ||
      claims.aud !== clientID ||
      typeof claims.exp !== 'number' ||
      claims.exp < currentTime - CLOCK_SKEW_SECONDS ||
      (typeof claims.iat === 'number' && claims.iat > currentTime + CLOCK_SKEW_SECONDS) ||
      (typeof claims.nbf === 'number' && claims.nbf > currentTime + CLOCK_SKEW_SECONDS) ||
      typeof claims.sub !== 'string' ||
      !claims.sub ||
      claims.sub.length > 255 ||
      typeof claims.email !== 'string' ||
      claims.email_verified !== true
    ) {
      throw new GoogleIdentityError()
    }

    return {
      email: claims.email.trim().toLowerCase(),
      emailVerified: true,
      name: typeof claims.name === 'string' ? claims.name.trim() : undefined,
      picture: typeof claims.picture === 'string' ? claims.picture : undefined,
      subject: claims.sub,
    }
  }
}

export const verifyGoogleIDToken = createGoogleIDTokenVerifier()
