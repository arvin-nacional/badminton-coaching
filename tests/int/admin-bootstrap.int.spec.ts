// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AccessArgs, CollectionBeforeChangeHook, Payload, PayloadRequest } from 'payload'
import type { User } from '@/payload-types'

vi.mock('@/collections/Users/provisionStudentProfile', () => ({ provisionStudentProfile: vi.fn() }))

import { Users } from '@/collections/Users'
import { protectRoles } from '@/collections/Users/protectRoles'
import {
  adminOrSelf,
  isStaffUser,
  ownStudentData,
  ownStudentProfile,
  staffOnly,
} from '@/access/coaching'
import { bootstrapAdmin, trustedAdminProvisioning } from '@/utilities/bootstrapAdmin'

const input = {
  email: ' Owner@Example.com ',
  name: ' Owner ',
  password: 'unique-test-password-123',
}
const user = (roles?: User['roles'] | null) =>
  ({ id: 'first-user', roles, email: 'student@example.com' }) as User
const reqFor = (roles?: User['roles'] | null) =>
  ({
    user: user(roles),
    context: {},
    payload: {
      find: vi.fn(() => {
        throw new Error('Account order must not be queried')
      }),
      update: vi.fn(),
    },
  }) as unknown as PayloadRequest

const runRoleHook = (
  req: PayloadRequest,
  data: Record<string, unknown>,
  operation: 'create' | 'update' = 'create',
  originalDoc = {},
) =>
  protectRoles({ req, data, operation, originalDoc } as Parameters<CollectionBeforeChangeHook>[0])

describe('administrator bootstrap boundaries', () => {
  it.each([['student'], [], undefined, null] satisfies (User['roles'] | null | undefined)[])(
    'never grants staff access based on account order or missing roles: %j',
    async (roles) => {
      const req = reqFor(roles)
      req.context.isBootstrapAdminChecked = true
      req.context.isBootstrapAdmin = true
      expect(isStaffUser(req.user)).toBe(false)
      expect(await staffOnly({ req })).toBe(false)
      expect(await Users.access!.admin!({ req })).toBe(false)
      expect(await ownStudentProfile({ req })).toEqual({ user: { equals: 'first-user' } })
      expect(await ownStudentData({ req })).toEqual({ 'student.user': { equals: 'first-user' } })
      expect(req.payload.find).not.toHaveBeenCalled()
    },
  )

  it('keeps the first student a student after login', async () => {
    const req = reqFor(['student'])
    const originalUser = req.user as User
    const hook = Users.hooks!.afterLogin![0]
    const result = await hook({ req, user: originalUser } as Parameters<typeof hook>[0])
    expect(result).toBe(originalUser)
    expect(result.roles).toEqual(['student'])
    expect(req.payload.find).not.toHaveBeenCalled()
    expect(req.payload.update).not.toHaveBeenCalled()
  })

  it('activates a verified pending student without assigning staff roles', async () => {
    const req = reqFor(['student'])
    req.context.activatingStudent = true
    const pending = { ...req.user, accountStatus: 'pending' } as User
    const activated = { ...pending, accountStatus: 'active' }
    vi.mocked(req.payload.update).mockResolvedValue(activated as User)
    const hook = Users.hooks!.afterLogin![0]
    const result = await hook({ req, user: pending } as Parameters<typeof hook>[0])
    expect(result.roles).toEqual(['student'])
    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { accountStatus: 'active', invitationAcceptedAt: expect.any(String) },
      }),
    )
    expect(req.payload.find).not.toHaveBeenCalled()
  })

  it('blocks the first-user web registration endpoint', async () => {
    const endpoints = Users.endpoints || []
    const endpoint = endpoints.find(
      (item) => item.path === '/first-register' && item.method === 'post',
    )!
    const req = reqFor()
    const response = await endpoint.handler(req)
    expect(response.status).toBe(403)
    expect(req.payload.find).not.toHaveBeenCalled()
  })

  it.each([['student'], ['coach'], [], undefined] satisfies (User['roles'] | undefined)[])(
    'rejects elevated roles even in privileged Local API calls: %j',
    (roles) => {
      const req = reqFor(roles)
      req.context.trustedAdminProvisioning = true
      expect(() => runRoleHook(req, { roles: ['admin'] })).toThrow('Only administrators')
      expect(() => runRoleHook(req, { roles: ['coach'] })).toThrow('Only administrators')
      expect(() =>
        runRoleHook(req, { roles: ['admin'] }, 'update', { roles: ['student'] }),
      ).toThrow('Only administrators')
    },
  )

  it('allows student creation and ordinary updates without changing roles', () => {
    const req = reqFor(['coach'])
    expect(runRoleHook(req, { roles: ['student'] })).toEqual({ roles: ['student'] })
    expect(runRoleHook(req, {})).toEqual({ roles: ['student'] })
    expect(runRoleHook(req, { name: 'Updated' }, 'update', { roles: ['student'] })).toEqual({
      name: 'Updated',
    })
  })

  it('allows explicit administrators to assign roles', () => {
    const req = reqFor(['admin'])
    expect(runRoleHook(req, { roles: ['coach'] })).toEqual({ roles: ['coach'] })
    expect(runRoleHook(req, { roles: ['admin'] }, 'update', { roles: ['student'] })).toEqual({
      roles: ['admin'],
    })
  })

  it('prevents coaches from taking over or deleting another account', async () => {
    const req = reqFor(['coach'])
    expect(await adminOrSelf({ req })).toEqual({ id: { equals: 'first-user' } })
    expect(await Users.access!.update!({ req })).toEqual({ id: { equals: 'first-user' } })
    expect(await Users.access!.delete!({ req })).toBe(false)
    const roles = Users.fields.find((field) => 'name' in field && field.name === 'roles')
    if (!roles || !('access' in roles)) throw new Error('Roles field missing')
    expect(await roles.access!.update!({ req } as AccessArgs)).toBe(false)
  })
})

describe('trusted administrator setup', () => {
  const count = vi.fn()
  const create = vi.fn()
  const payload = { count, create } as unknown as Payload

  beforeEach(() => {
    vi.resetAllMocks()
    count.mockResolvedValue({ totalDocs: 0 })
    create.mockResolvedValue({ id: 'new-admin' })
  })

  it('creates a new explicit admin even if students signed up before setup', async () => {
    await bootstrapAdmin(payload, input)
    expect(count).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { roles: { contains: 'admin' } } }),
    )
    expect(count).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { email: { equals: 'owner@example.com' } } }),
    )
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: 'owner@example.com',
          name: 'Owner',
          password: input.password,
          roles: ['admin'],
          accountStatus: 'active',
        },
        context: { [trustedAdminProvisioning]: true },
        overrideAccess: true,
      }),
    )
    const { data, context } = create.mock.calls[0][0]
    const req = { ...reqFor(), user: null, context } as PayloadRequest
    expect(runRoleHook(req, data)).toEqual(data)
  })

  it('refuses to run again when any administrator exists', async () => {
    count.mockResolvedValueOnce({ totalDocs: 1 })
    await expect(bootstrapAdmin(payload, input)).rejects.toThrow('administrator already exists')
    expect(create).not.toHaveBeenCalled()
  })

  it('never promotes or overwrites an existing account', async () => {
    count.mockResolvedValueOnce({ totalDocs: 0 }).mockResolvedValueOnce({ totalDocs: 1 })
    await expect(bootstrapAdmin(payload, input)).rejects.toThrow('already belongs to an account')
    expect(create).not.toHaveBeenCalled()
  })

  it.each([
    { ...input, email: '' },
    { ...input, password: 'short' },
    { ...input, name: '' },
  ])('validates required inputs before database operations', async (invalidInput) => {
    await expect(bootstrapAdmin(payload, invalidInput)).rejects.toThrow()
    expect(count).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })
})
