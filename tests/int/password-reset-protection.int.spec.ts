// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { publicGuardStore } from '../helpers/publicGuardStore'
import { limitPasswordReset } from '@/collections/Users/limitPasswordReset'
import { Users } from '@/collections/Users'
import type { FieldAccess, PayloadRequest } from 'payload'

beforeEach(() => {
  vi.stubEnv('PAYLOAD_SECRET', 'test-reset-secret')
  vi.stubEnv('PUBLIC_REQUEST_IP_HEADER', '')
})
afterEach(() => vi.unstubAllEnvs())

describe('public password reset protection', () => {
  const input = (api = 'REST') =>
    ({
      operation: 'forgotPassword',
      args: { data: { email: ' Student@Example.com ' } },
      req: {
        payloadAPI: api,
        payload: publicGuardStore().payload,
        url: 'https://example.com/api/users/forgot-password',
        headers: new Headers(),
        data: {},
      },
    }) as unknown as Parameters<typeof limitPasswordReset>[0]

  it.each(['REST', 'GraphQL'])(
    'limits public %s reset requests using the shared email budget',
    async (api) => {
      const args = input(api)
      await expect(limitPasswordReset(args)).resolves.toBe(args.args)
      await expect(limitPasswordReset(args)).rejects.toMatchObject({ status: 429 })
    },
  )

  it('does not double-limit trusted local signup or invitation calls', async () => {
    const args = input('local')
    args.req.payload.db = {} as typeof args.req.payload.db
    await expect(limitPasswordReset(args)).resolves.toBe(args.args)
  })

  it('fails closed when storage is unavailable', async () => {
    const args = input()
    args.req.payload.db = {} as typeof args.req.payload.db
    await expect(limitPasswordReset(args)).rejects.toMatchObject({ status: 503 })
  })

  it('rejects cross-origin public resets', async () => {
    const args = input()
    args.req.headers.set('origin', 'https://evil.example')
    await expect(limitPasswordReset(args)).rejects.toMatchObject({ status: 403 })
  })

  it('wires the hook and prevents students replacing a verified email', async () => {
    expect(Users.hooks?.beforeOperation).toContain(limitPasswordReset)
    const field = Users.fields.find((field) => 'name' in field && field.name === 'email')!
    const update = ('access' in field && field.access?.update) as FieldAccess
    expect(update).toBeTypeOf('function')
    for (const roles of [['student'], ['coach'], []]) {
      expect(await update({ req: { user: { roles } } as PayloadRequest })).toBe(false)
    }
    expect(await update({ req: { user: { roles: ['admin'] } } as PayloadRequest })).toBe(true)
  })
})
