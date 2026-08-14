import { redirect } from 'next/navigation'

import { isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

export default async function DashboardPage() {
  const { payload, user } = await requireDashboardUser()

  if (isCoach(user)) redirect('/dashboard/coach')

  // Students who haven't completed onboarding are guided there first.
  if (user.roles?.includes('student')) {
    const profiles = await payload.find({
      collection: 'student-profiles',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user,
      where: { user: { equals: user.id } },
    })
    const profile = profiles.docs[0]
    if (profile && !profile.onboardingCompletedAt) redirect('/onboarding')
  }

  redirect('/dashboard/student')
}
