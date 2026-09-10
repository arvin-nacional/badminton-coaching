import type { Access, AccessArgs, CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

type RoleUser = { roles?: User['roles'] | null } | null | undefined

// CMS permissions require assigned roles; legacy/bootstrap exceptions do not apply.
export const hasCMSStaffRole = (user: RoleUser): boolean =>
  Boolean(user?.roles?.some((role) => role === 'admin' || role === 'coach'))

export const cmsStaffOnly = ({ req: { user } }: Pick<AccessArgs, 'req'>): boolean =>
  hasCMSStaffRole(user)

export const adminsOnly = ({ req: { user } }: Pick<AccessArgs, 'req'>): boolean =>
  Boolean(user?.roles?.includes('admin'))

export const staffOrPublished: Access = ({ req: { user } }) =>
  hasCMSStaffRole(user) ? true : { _status: { equals: 'published' } }

export const cmsWriteAccess = {
  admin: cmsStaffOnly,
  create: cmsStaffOnly,
  delete: cmsStaffOnly,
  update: cmsStaffOnly,
} satisfies CollectionConfig['access']
