// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { publicGuardStore } from '../helpers/publicGuardStore'

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  create: vi.fn(),
  send: vi.fn(),
  db: {} as Payload['db'],
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => mocks) }))
vi.mock('@/utilities/sendStudentVerification', () => ({ sendStudentVerification: mocks.send }))

import { POST } from '@/app/(frontend)/api/student-signup/route'

describe('public signup role safety', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('PAYLOAD_SECRET', 'test-signup-secret')
    vi.stubEnv('PUBLIC_REQUEST_IP_HEADER', '')
    mocks.db = publicGuardStore().payload.db
    mocks.find.mockResolvedValue({ docs: [] })
    mocks.create.mockResolvedValue({
      id: 'first-student',
      roles: ['student'],
      accountStatus: 'pending',
    })
    mocks.send.mockResolvedValue(undefined)
  })
  afterEach(() => vi.unstubAllEnvs())

  const request = () =>
    new Request('http://localhost/api/student-signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Student', email: 'student@example.com' }),
    })

  it('uses the same success response for new and existing accounts', async () => {
    const created = await POST(request())
    mocks.db = publicGuardStore().payload.db
    mocks.find.mockResolvedValue({ docs: [{ roles: ['student'], accountStatus: 'active' }] })
    const existing = await POST(request())
    expect(created.status).toBe(existing.status)
    expect(await created.json()).toEqual(await existing.json())
  })

  it('blocks rapid resends before looking up or changing an account', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 'student',
          email: 'student@example.com',
          roles: ['student'],
          accountStatus: 'pending',
        },
      ],
    })
    expect((await POST(request())).status).toBe(201)
    const response = await POST(request())
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('60')
    expect(mocks.find).toHaveBeenCalledOnce()
    expect(mocks.send).toHaveBeenCalledOnce()
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it.each([['admin'], ['coach'], ['student', 'coach']])(
    'never resends student activation for staff roles %j',
    async (...roles) => {
      mocks.find.mockResolvedValue({ docs: [{ roles, accountStatus: 'pending' }] })
      expect((await POST(request())).status).toBe(201)
      expect(mocks.send).not.toHaveBeenCalled()
      expect(mocks.create).not.toHaveBeenCalled()
    },
  )

  it('creates only a pending student even when the first signup submits admin roles and setup flags', async () => {
    const response = await POST(
      new Request('http://localhost/api/student-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Student',
          email: 'student@example.com',
          roles: ['admin'],
          accountStatus: 'active',
          context: { trustedAdminProvisioning: true, isBootstrapAdmin: true },
        }),
      }),
    )
    expect(response.status).toBe(201)
    expect(mocks.create).toHaveBeenCalledOnce()
    const args = mocks.create.mock.calls[0][0]
    expect(args.data.roles).toEqual(['student'])
    expect(args.data.accountStatus).toBe('pending')
    expect(args.context).toBeUndefined()
    expect(mocks.send).toHaveBeenCalledOnce()
  })
})
