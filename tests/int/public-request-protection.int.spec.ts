// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { publicGuardStore } from '../helpers/publicGuardStore'
import {
  checkPublicForm,
  limitPublicEmail,
  limitPublicRequest,
  privateKey,
  publicErrorResponse,
  requestIdentity,
} from '@/utilities/publicRequestProtection'
import {
  claimAssessmentEmailCode,
  createAssessmentEmailCode,
  verifyAssessmentEmailCode,
} from '@/utilities/assessmentEmailVerification'

beforeEach(() => {
  vi.stubEnv('PAYLOAD_SECRET', 'unit-test-secret-not-for-deployment')
  vi.stubEnv('PUBLIC_REQUEST_IP_HEADER', '')
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2030-01-01T00:00:00Z'))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('durable public request limits', () => {
  it('ignores forwarded addresses unless a trusted single-IP header is configured', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '192.0.2.1', 'x-client-ip': '192.0.2.2' },
    })
    expect(requestIdentity(request)).toBe('unidentified-client')
    vi.stubEnv('PUBLIC_REQUEST_IP_HEADER', 'X-Client-IP')
    expect(requestIdentity(request)).toBe('192.0.2.2')
    expect(
      requestIdentity(
        new Request('https://example.com', { headers: { 'x-client-ip': '192.0.2.1, 192.0.2.2' } }),
      ),
    ).toBe('unidentified-client')
  })

  it('rejects foreign origins and filled honeypots but accepts the normal form', () => {
    const request = new Request('https://example.com', {
      headers: { origin: 'https://example.com' },
    })
    expect(() => checkPublicForm(request, { website: '' })).not.toThrow()
    expect(() => checkPublicForm(request, { website: 'spam' })).toThrow('Unable to submit')
    expect(() =>
      checkPublicForm(
        new Request('https://example.com', { headers: { origin: 'https://evil.example' } }),
        {},
      ),
    ).toThrow('from the website')
  })

  it('shares an atomic limit, hashes identities, and creates one TTL index', async () => {
    const store = publicGuardStore()
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        limitPublicRequest(store.payload, 'test', 'private@example.com', 2, 60),
      ),
    )
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(2)
    expect(store.collection.createIndex).toHaveBeenCalledExactlyOnceWith(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    )
    expect(store.collection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expect.stringMatching(/^[a-f0-9]{64}$/) },
      expect.any(Array),
      { upsert: true, returnDocument: 'after', includeResultMetadata: false },
    )
    expect(JSON.stringify([...store.records])).not.toContain('private@example.com')
  })

  it('does not extend the window on rejection and resets even before TTL cleanup', async () => {
    const { payload } = publicGuardStore()
    await limitPublicRequest(payload, 'test', 'client', 1, 60)
    vi.advanceTimersByTime(10000)
    const error = await limitPublicRequest(payload, 'test', 'client', 1, 60).catch(
      (error: unknown) => error,
    )
    expect(publicErrorResponse(error).status).toBe(429)
    expect(publicErrorResponse(error).headers.get('Retry-After')).toBe('50')
    vi.advanceTimersByTime(50000)
    await expect(limitPublicRequest(payload, 'test', 'client', 1, 60)).resolves.toBeUndefined()
  })

  it('shares normalized email cooldowns and daily limits', async () => {
    const { payload } = publicGuardStore()
    await limitPublicEmail(payload, ' Student@Example.com ')
    await expect(limitPublicEmail(payload, 'student@example.com')).rejects.toMatchObject({
      status: 429,
      retryAfter: 60,
    })
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(60000)
      await limitPublicEmail(payload, 'student@example.com')
    }
    vi.advanceTimersByTime(60000)
    await expect(limitPublicEmail(payload, 'student@example.com')).rejects.toMatchObject({
      status: 429,
    })
  })

  it('fails closed on storage errors and retries failed index creation', async () => {
    const store = publicGuardStore()
    store.collection.createIndex.mockRejectedValueOnce(new Error('private connection details'))
    const error = await limitPublicEmail(store.payload, 'student@example.com').catch(
      (error: unknown) => error,
    )
    const response = publicErrorResponse(error)
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private connection details')
    expect(store.collection.findOneAndUpdate).not.toHaveBeenCalled()
    await limitPublicEmail(store.payload, 'student@example.com')
    expect(store.collection.createIndex).toHaveBeenCalledTimes(2)
  })

  it('requires a signing secret', () => {
    vi.stubEnv('PAYLOAD_SECRET', '')
    expect(() => privateKey('identity')).toThrow('try again later')
  })
})

describe('assessment email proof', () => {
  it('requires the correct email, code, and untampered token', async () => {
    const { payload } = publicGuardStore()
    const { token, code } = createAssessmentEmailCode('student@example.com')
    expect(code).toMatch(/^\d{6}$/)
    const encoded = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString())
    expect(encoded.email).not.toBe('student@example.com')
    expect(encoded.code).not.toBe(code)
    await expect(
      verifyAssessmentEmailCode(payload, 'other@example.com', token, code),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      verifyAssessmentEmailCode(payload, 'student@example.com', `${token}x`, code),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      verifyAssessmentEmailCode(payload, 'student@example.com', token, '000000'),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      verifyAssessmentEmailCode(payload, ' Student@Example.com ', token, code),
    ).resolves.toHaveProperty('nonce')
  })

  it('locks a token after five wrong attempts, including when the next code is correct', async () => {
    const { payload } = publicGuardStore()
    const { token, code } = createAssessmentEmailCode('student@example.com')
    for (let i = 0; i < 5; i++)
      await expect(
        verifyAssessmentEmailCode(payload, 'student@example.com', token, '000000'),
      ).rejects.toMatchObject({ status: 403 })
    await expect(
      verifyAssessmentEmailCode(payload, 'student@example.com', token, code),
    ).rejects.toMatchObject({ status: 429 })
  })

  it('allows retrying the same slot but never claiming a second slot', async () => {
    const { payload } = publicGuardStore()
    const { token, code } = createAssessmentEmailCode('student@example.com')
    const proof = await verifyAssessmentEmailCode(payload, 'student@example.com', token, code)
    await claimAssessmentEmailCode(payload, proof, 'slot:one')
    await expect(claimAssessmentEmailCode(payload, proof, 'slot:one')).resolves.toBeUndefined()
    await expect(claimAssessmentEmailCode(payload, proof, 'slot:two')).rejects.toMatchObject({
      status: 403,
    })
    vi.advanceTimersByTime(600000)
    await expect(claimAssessmentEmailCode(payload, proof, 'slot:one')).rejects.toMatchObject({
      status: 403,
    })
    await expect(
      verifyAssessmentEmailCode(payload, 'student@example.com', token, code),
    ).rejects.toMatchObject({ status: 403 })
  })

  it.each([undefined, '', 'bad.token', 'x'.repeat(1501)])(
    'rejects malformed proof %s',
    async (token) => {
      const store = publicGuardStore()
      await expect(
        verifyAssessmentEmailCode(store.payload, 'student@example.com', token, '123456'),
      ).rejects.toMatchObject({ status: 403 })
      expect(store.collection.findOneAndUpdate).not.toHaveBeenCalled()
    },
  )
})
