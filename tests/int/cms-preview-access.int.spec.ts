// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ auth: mocks.auth })) }))
vi.mock('next/headers', () => ({ draftMode: vi.fn(async () => mocks) }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { GET } from '@/app/(frontend)/next/preview/route'

describe('CMS preview authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('PREVIEW_SECRET', 'test-preview-secret')
  })
  afterEach(() => vi.unstubAllEnvs())

  const request = () =>
    new Request(
      'http://localhost/next/preview?path=/example&previewSecret=test-preview-secret',
    ) as NextRequest

  it.each([null, { roles: ['student'] }, { roles: [] }, {}])(
    'denies non-staff even with the correct preview secret (%j)',
    async (user) => {
      mocks.auth.mockResolvedValue({ user })
      const response = await GET(request())
      expect(response.status).toBe(403)
      expect(mocks.disable).toHaveBeenCalledOnce()
      expect(mocks.enable).not.toHaveBeenCalled()
      expect(mocks.redirect).not.toHaveBeenCalled()
    },
  )

  it.each(['admin', 'coach'])('allows an explicit %s to preview', async (role) => {
    mocks.auth.mockResolvedValue({ user: { roles: [role] } })
    await GET(request())
    expect(mocks.enable).toHaveBeenCalledOnce()
    expect(mocks.redirect).toHaveBeenCalledWith('/example')
  })
})
