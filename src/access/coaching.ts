import type { Access, PayloadRequest } from 'payload'

type CoachingUser = {
  id: string | number
  roles?: ('admin' | 'coach' | 'student')[] | null
}

export const isStaffUser = (user: CoachingUser | null | undefined) => {
  if (!user) return false
  // Existing users created before roles were introduced remain coaching staff.
  if (!user.roles?.length) return true
  return user.roles.includes('admin') || user.roles.includes('coach')
}

export async function isStaffOrBootstrap(req: PayloadRequest) {
  if (!req.user) return false
  if (isStaffUser(req.user as CoachingUser)) return true

  const firstUser = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    sort: 'createdAt',
  })

  return firstUser.docs[0]?.id === req.user.id
}

export const staffOnly: Access = ({ req }) => isStaffOrBootstrap(req)

export const staffOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isStaffUser(user as CoachingUser)) return true
  return { id: { equals: user.id } }
}

export const authenticatedCoachingUser: Access = ({ req: { user } }) => Boolean(user)

export const ownStudentProfile: Access = async ({ req }) => {
  const { user } = req
  if (!user) return false
  if (await isStaffOrBootstrap(req)) return true
  return { user: { equals: user.id } }
}

export const ownStudentData: Access = async ({ req }) => {
  const { user } = req
  if (!user) return false
  if (await isStaffOrBootstrap(req)) return true
  return { 'student.user': { equals: user.id } }
}
