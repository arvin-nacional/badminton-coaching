// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Access, AccessArgs, PayloadRequest } from 'payload'

// Evaluate the real sanitized configuration without initializing Payload or its DB.
vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() => {
      throw new Error('Database initialization is forbidden in access tests')
    }),
  }
})

import configPromise from '@/payload.config'
import { Users } from '@/collections/Users'

const reqFor = (roles?: ('admin' | 'coach' | 'student')[] | null, signedIn = true) =>
  ({
    user: signedIn ? { id: 'access-test-user', collection: 'users', roles } : null,
    headers: new Headers(),
    context: {},
  }) as PayloadRequest

const deniedUsers = [
  { label: 'visitor', req: reqFor(undefined, false) },
  { label: 'student', req: reqFor(['student']) },
  { label: 'user without roles', req: reqFor() },
  { label: 'user with empty roles', req: reqFor([]) },
  { label: 'user with null roles', req: reqFor(null) },
]

const evaluate = (access: Access | undefined, req: PayloadRequest) => {
  expect(access).toBeTypeOf('function')
  return access!({ req } as AccessArgs)
}

describe('configured CMS permissions', () => {
  it('disables production integrations and startup mutations in test configuration', async () => {
    const config = await configPromise
    const emailAdapter = await config.email
    expect(emailAdapter({ payload: {} as import('payload').Payload }).name).toBe('test-no-delivery')
    expect(config.jobs.autoRun).toEqual([])
    const payload = new Proxy(
      {},
      {
        get: () => {
          throw new Error('Startup must not touch Payload in tests')
        },
      },
    )
    await expect(config.onInit!(payload as import('payload').Payload)).resolves.toBeUndefined()
    const media = config.collections.find((entry) => entry.slug === 'media')!
    expect(media.upload && media.upload.disableLocalStorage).toBe(true)
    expect(media.endpoints || []).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ path: expect.stringContaining('s3') })]),
    )
  })

  it('resolves web first-user registration to the disabled handler before Payload defaults', async () => {
    const config = await configPromise
    const collection = config.collections.find((entry) => entry.slug === 'users')!
    const configuredEndpoints = collection.endpoints || []
    const sourceEndpoints = Users.endpoints || []
    const endpoint = configuredEndpoints.find(
      (item) => item.method === 'post' && item.path === '/first-register',
    )!
    expect(endpoint.handler).toBe(
      sourceEndpoints.find((item) => item.path === '/first-register')!.handler,
    )
    expect((await endpoint.handler(reqFor(undefined, false))).status).toBe(403)
  })
  afterEach(() => vi.unstubAllEnvs())

  it.each(deniedUsers)('denies CMS mutations by $label', async ({ req }) => {
    const config = await configPromise
    for (const slug of [
      'pages',
      'posts',
      'media',
      'categories',
      'redirects',
      'forms',
      'search',
      'payload-folders',
    ]) {
      const collection = config.collections.find((entry) => entry.slug === slug)!
      expect(collection, slug).toBeDefined()
      for (const operation of ['create', 'update', 'delete'] as const) {
        expect(await evaluate(collection.access[operation], req), `${slug}.${operation}`).toBe(
          false,
        )
      }
    }
    for (const global of config.globals.filter((entry) =>
      ['header', 'footer', 'coaching-settings'].includes(entry.slug),
    )) {
      expect(await evaluate(global.access.update, req), global.slug).toBe(false)
    }
  })

  it.each(deniedUsers)(
    'restricts drafts, versions, and form submissions for $label',
    async ({ req }) => {
      const config = await configPromise
      for (const slug of ['pages', 'posts']) {
        const collection = config.collections.find((entry) => entry.slug === slug)!
        expect(await evaluate(collection.access.read, req)).toEqual({
          _status: { equals: 'published' },
        })
        expect(await evaluate(collection.access.readVersions, req)).toBe(false)
      }
      const submissions = config.collections.find((entry) => entry.slug === 'form-submissions')!
      for (const operation of ['read', 'update', 'delete'] as const) {
        expect(await evaluate(submissions.access[operation], req)).toBe(false)
      }
      expect(await evaluate(submissions.access.create, req)).toBe(true)
    },
  )

  it.each(['admin', 'coach'] as const)(
    'allows explicit %s roles to manage CMS content',
    async (role) => {
      const config = await configPromise
      const req = reqFor([role])
      for (const slug of ['pages', 'posts', 'media', 'categories', 'redirects', 'forms']) {
        const collection = config.collections.find((entry) => entry.slug === slug)!
        for (const operation of ['create', 'update', 'delete', 'read'] as const) {
          expect(await evaluate(collection.access[operation], req), `${slug}.${operation}`).toBe(
            true,
          )
        }
      }
      for (const slug of ['header', 'footer', 'coaching-settings']) {
        const global = config.globals.find((entry) => entry.slug === slug)!
        expect(global, slug).toBeDefined()
        expect(await evaluate(global.access.update, req)).toBe(true)
      }
    },
  )

  it('keeps public site resources readable', async () => {
    const config = await configPromise
    const req = reqFor(undefined, false)
    for (const slug of ['media', 'categories', 'redirects', 'forms', 'search']) {
      const collection = config.collections.find((entry) => entry.slug === slug)!
      expect(await evaluate(collection.access.read, req), slug).toBe(true)
    }
    for (const slug of ['header', 'footer', 'coaching-settings']) {
      const global = config.globals.find((entry) => entry.slug === slug)!
      expect(await evaluate(global.access.read, req), slug).toBe(true)
    }
  })

  it.each([...deniedUsers, { label: 'coach', req: reqFor(['coach']) }])(
    'denies job operations by $label',
    async ({ req }) => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      const config = await configPromise
      for (const operation of ['run', 'queue', 'cancel'] as const) {
        expect(await config.jobs.access![operation]!({ req }), operation).toBe(false)
      }
      const collection = config.collections.find((entry) => entry.slug === 'payload-jobs')!
      for (const operation of ['create', 'read', 'update', 'delete'] as const) {
        expect(await evaluate(collection.access[operation], req), operation).toBe(false)
      }
    },
  )

  it('allows administrators to operate jobs', async () => {
    const config = await configPromise
    const req = reqFor(['admin'])
    for (const operation of ['run', 'queue', 'cancel'] as const) {
      expect(await config.jobs.access![operation]!({ req })).toBe(true)
    }
    const collection = config.collections.find((entry) => entry.slug === 'payload-jobs')!
    for (const operation of ['create', 'read', 'update', 'delete'] as const) {
      expect(await evaluate(collection.access[operation], req)).toBe(true)
    }
  })

  it('limits cron credentials to running jobs and rejects missing or incorrect secrets', async () => {
    const config = await configPromise
    const req = reqFor(undefined, false)
    vi.stubEnv('CRON_SECRET', 'test-cron-secret')
    req.headers.set('authorization', 'Bearer wrong-secret')
    expect(await config.jobs.access!.run!({ req })).toBe(false)
    req.headers.set('authorization', 'Bearer test-cron-secret')
    expect(await config.jobs.access!.run!({ req })).toBe(true)
    expect(await config.jobs.access!.queue!({ req })).toBe(false)
    expect(await config.jobs.access!.cancel!({ req })).toBe(false)
    vi.stubEnv('CRON_SECRET', '')
    req.headers.set('authorization', 'Bearer ')
    expect(await config.jobs.access!.run!({ req })).toBe(false)
  })
})
