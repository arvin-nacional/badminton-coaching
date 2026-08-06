import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })

  const body = await request.json().catch(() => null) as { completed?: unknown } | null
  if (typeof body?.completed !== 'boolean') {
    return Response.json({ error: 'A completed boolean is required.' }, { status: 400 })
  }

  try {
    const { id } = await params
    const practice = await payload.findByID({
      collection: 'independent-practices',
      id,
      depth: 0,
      overrideAccess: false,
      user,
    })

    const updated = await payload.update({
      collection: 'independent-practices',
      id: practice.id,
      depth: 0,
      overrideAccess: true,
      data: {
        completedAt: body.completed ? new Date().toISOString() : null,
        status: body.completed ? 'completed' : 'assigned',
      },
    })

    return Response.json({ completedAt: updated.completedAt, status: updated.status })
  } catch {
    return Response.json({ error: 'Independent practice was not found.' }, { status: 404 })
  }
}
