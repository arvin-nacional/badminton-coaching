import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import type { StudentProfile, User } from '@/payload-types'
import { isAdmin, isCoach } from '@/utilities/dashboardAuth'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  if (!isCoach(user)) return Response.json({ error: 'Coach access required.' }, { status: 403 })

  const body = await request.json().catch(() => null) as { score?: unknown; evidence?: unknown; nextFocus?: unknown } | null
  if (!Number.isInteger(body?.score) || Number(body?.score) < 0 || Number(body?.score) > 5) {
    return Response.json({ error: 'Choose a development level from 0 to 5.' }, { status: 400 })
  }
  if (body?.evidence !== undefined && typeof body.evidence !== 'string') return Response.json({ error: 'Evidence must be text.' }, { status: 400 })
  if (body?.nextFocus !== undefined && typeof body.nextFocus !== 'string') return Response.json({ error: 'Next focus must be text.' }, { status: 400 })
  const evidence = typeof body?.evidence === 'string' ? body.evidence.trim().slice(0, 2000) : ''
  const nextFocus = typeof body?.nextFocus === 'string' ? body.nextFocus.trim().slice(0, 2000) : ''

  try {
    const { id } = await params
    const record = await payload.findByID({ collection: 'session-skill-scores', id, depth: 1, overrideAccess: false, user })
    const profile = typeof record.student === 'object' ? record.student as StudentProfile : null
    const assignedCoachID = relationshipID(record.coach) || relationshipID(profile?.coach)
    if (!isAdmin(user) && assignedCoachID !== user.id) return Response.json({ error: 'This player is not assigned to you.' }, { status: 403 })

    const updated = await payload.update({
      collection: 'session-skill-scores',
      id: record.id,
      depth: 1,
      overrideAccess: false,
      user,
      data: {
        evidence: evidence || null,
        nextFocus: nextFocus || null,
        score: Number(body?.score),
        scoredAt: new Date().toISOString(),
        status: 'scored',
      },
    })
    return Response.json({ score: updated.score, scoredAt: updated.scoredAt, status: updated.status })
  } catch {
    return Response.json({ error: 'The session skill record was not found.' }, { status: 404 })
  }
}
