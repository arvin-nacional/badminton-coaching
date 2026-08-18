import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { User } from '@/payload-types'

/**
 * Resolves the authenticated user (or null) without redirecting.
 *
 * Wrapped in React `cache()` so `payload.auth()` runs at most once per
 * request, even when the layout, page, and API routes all need the user.
 * Without this, each call does a full JWT decode + user DB lookup.
 */
export const getDashboardUser = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  return { payload, user: (user as User | null) || null }
})

/**
 * Resolves the authenticated user for dashboard pages, redirecting to
 * login if not signed in. Shares the same cached auth result as
 * `getDashboardUser` so there's no duplicate payload.auth() call.
 */
export async function requireDashboardUser() {
  const { payload, user } = await getDashboardUser()
  if (!user) redirect('/login?redirect=/dashboard')
  return { payload, user }
}

export const isCoach = (user: User) =>
  !user.roles?.length || user.roles.includes('admin') || user.roles.includes('coach')

export const isAdmin = (user: User) => !user.roles?.length || user.roles.includes('admin')
