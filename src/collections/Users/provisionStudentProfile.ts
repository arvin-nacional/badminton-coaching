import type { PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export async function provisionStudentProfile(user: User, req: PayloadRequest) {
  if (req.context.provisioningStudentProfile || !user.roles?.includes('student')) return

  const existing = await req.payload.find({
    collection: 'student-profiles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: { user: { equals: user.id } },
  })

  if (existing.docs.length) return

  await req.payload.create({
    collection: 'student-profiles',
    context: { ...req.context, provisioningStudentProfile: true },
    data: {
      assessmentStatus: 'required',
      attendanceRate: 100,
      currentPhase: 'Awaiting initial assessment',
      displayName: user.name || user.email,
      focusExplanation: 'Complete your initial assessment so your coach can identify your priorities and build your first training plan.',
      packageName: 'Assessment',
      packageSessions: 0,
      sessionsRemaining: 0,
      user: user.id,
      weeklyFocus: 'Initial player assessment',
    },
    overrideAccess: true,
    req,
  })
}
