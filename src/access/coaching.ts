import type { Access } from 'payload'
import { hasCMSStaffRole } from './cms'

type CoachingUser = {
  id: string | number
  roles?: ('admin' | 'coach' | 'student')[] | null
}

export const isStaffUser = (user: CoachingUser | null | undefined) => {
  return hasCMSStaffRole(user)
}

export const staffOnly: Access = ({ req }) => isStaffUser(req.user)

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  return { id: { equals: user.id } }
}

export const staffOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isStaffUser(user as CoachingUser)) return true
  return { id: { equals: user.id } }
}

export const authenticatedCoachingUser: Access = ({ req: { user } }) => Boolean(user)

export const ownStudentProfile: Access = async ({ req }) => {
  const { user } = req
  if (!user) return false
  if (isStaffUser(user)) return true
  return { user: { equals: user.id } }
}

export const ownStudentData: Access = async ({ req }) => {
  const { user } = req
  if (!user) return false
  if (isStaffUser(user)) return true
  return { 'student.user': { equals: user.id } }
}
