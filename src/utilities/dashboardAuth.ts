import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'

export async function requireDashboardUser() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/login?redirect=/dashboard')

  return { payload, user: user as User }
}

export const isCoach = (user: User) =>
  !user.roles?.length || user.roles.includes('admin') || user.roles.includes('coach')

export const isAdmin = (user: User) => !user.roles?.length || user.roles.includes('admin')
