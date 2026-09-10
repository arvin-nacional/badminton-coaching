// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const auth = vi.fn()
  const loggerError = vi.fn()
  const payload = {
    auth,
    logger: { error: loggerError },
  }

  return {
    auth,
    createLocalReq: vi.fn(),
    getPayload: vi.fn(),
    headers: vi.fn(),
    loggerError,
    payload,
    seed: vi.fn(),
  }
})

vi.mock('payload', () => ({
  createLocalReq: mocks.createLocalReq,
  getPayload: mocks.getPayload,
}))

vi.mock('@/endpoints/seed', () => ({
  seed: mocks.seed,
}))

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

vi.mock('next/headers', () => ({
  headers: mocks.headers,
}))

import { POST } from '@/app/(frontend)/next/seed/route'

describe('destructive seed route authorization', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.clearAllMocks()

    mocks.getPayload.mockResolvedValue(mocks.payload)
    mocks.headers.mockResolvedValue(new Headers())
    mocks.createLocalReq.mockImplementation(async ({ user }) => ({ user }))
    mocks.seed.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is unavailable in production and does not initialize Payload', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const response = await POST()

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found.' })
    expect(mocks.getPayload).not.toHaveBeenCalled()
    expect(mocks.auth).not.toHaveBeenCalled()
    expect(mocks.seed).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated requests', async () => {
    mocks.auth.mockResolvedValue({ user: null })

    const response = await POST()

    expect(response.status).toBe(401)
    expect(mocks.createLocalReq).not.toHaveBeenCalled()
    expect(mocks.seed).not.toHaveBeenCalled()
  })

  it.each([
    ['student', ['student']],
    ['coach', ['coach']],
    ['roleless legacy user', []],
  ])('rejects an authenticated %s', async (_label, roles) => {
    mocks.auth.mockResolvedValue({ user: { id: 'user-1', roles } })

    const response = await POST()

    expect(response.status).toBe(403)
    expect(mocks.createLocalReq).not.toHaveBeenCalled()
    expect(mocks.seed).not.toHaveBeenCalled()
  })

  it('allows an explicit administrator and passes their request context to the seed', async () => {
    const user = { id: 'admin-1', roles: ['admin'] }
    const localRequest = { user, context: {} }
    mocks.auth.mockResolvedValue({ user })
    mocks.createLocalReq.mockResolvedValue(localRequest)

    const response = await POST()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
    expect(mocks.createLocalReq).toHaveBeenCalledWith({ user }, mocks.payload)
    expect(mocks.seed).toHaveBeenCalledOnce()
    expect(mocks.seed).toHaveBeenCalledWith({ payload: mocks.payload, req: localRequest })
  })

  it('logs seed failures without exposing internal error details', async () => {
    const error = new Error('database connection details')
    mocks.auth.mockResolvedValue({ user: { id: 'admin-1', roles: ['admin'] } })
    mocks.seed.mockRejectedValue(error)

    const response = await POST()

    expect(response.status).toBe(500)
    await expect(response.text()).resolves.toBe('Error seeding data.')
    expect(mocks.loggerError).toHaveBeenCalledWith({ err: error, message: 'Error seeding data' })
  })
})
