import type { PayloadRequest } from 'payload'

import type { User } from '@/payload-types'
import { isStaffUser } from '@/access/coaching'

export async function promoteBootstrapAdmin(user: User, req: PayloadRequest) {
  if (req.context.promotingBootstrapAdmin || isStaffUser(user)) return user

  const firstUser = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    sort: 'createdAt',
  })

  if (firstUser.docs[0]?.id !== user.id) return user

  const updated = await req.payload.update({
    collection: 'users',
    context: { ...req.context, promotingBootstrapAdmin: true },
    data: { roles: ['admin'] },
    id: user.id,
    overrideAccess: true,
    req,
  })

  return updated
}
