import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { trustedAdminProvisioning } from '@/utilities/bootstrapAdmin'

// Field access is bypassed by privileged Local API calls (including Payload's
// first-user registration). Enforce role assignment at the hook boundary too.
export const protectRoles: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  if (
    req.user?.roles?.includes('admin') ||
    Reflect.get(req.context, trustedAdminProvisioning) === true
  ) {
    return data
  }

  if (operation === 'create') {
    if (data.roles?.some((role: string) => role !== 'student')) {
      throw new APIError('Only administrators can assign staff roles.', 403)
    }
    data.roles = ['student']
  } else if (data.roles !== undefined) {
    const before = [...(originalDoc.roles ?? [])].sort()
    const after = Array.isArray(data.roles) ? [...data.roles].sort() : []
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      throw new APIError('Only administrators can change roles.', 403)
    }
  }

  return data
}
