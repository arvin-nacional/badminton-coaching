import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { seedCoachingLibrary } from '@/endpoints/seed/coaching'
import type { User } from '@/payload-types'

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  const roles = (user as User | null)?.roles || []

  if (!user || (!roles.includes('admin') && !roles.includes('coach'))) {
    return Response.json({ error: 'Admin or coach access is required.' }, { status: 403 })
  }

  try {
    const counts = await seedCoachingLibrary(payload)
    return Response.json({ success: true, ...counts })
  } catch (error) {
    payload.logger.error({ err: error, message: 'Error seeding coaching library' })
    return Response.json({ error: 'Unable to seed coaching library.' }, { status: 500 })
  }
}
