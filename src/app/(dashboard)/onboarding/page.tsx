import { redirect } from 'next/navigation'

import { StudentOnboardingForm } from '@/components/Dashboard/StudentOnboardingForm'
import { requireDashboardUser } from '@/utilities/dashboardAuth'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const { payload, user } = await requireDashboardUser()

  // Only students need onboarding.
  if (!user.roles?.includes('student')) redirect('/dashboard')

  const [profiles, coachingSettings] = await Promise.all([
    payload.find({
      collection: 'student-profiles',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user,
      where: { user: { equals: user.id } },
    }),
    getCachedGlobal('coaching-settings')(),
  ])
  const profile = profiles.docs[0]

  // If a profile does not exist yet, the provisioning hook should have created
  // one. Fall back to a friendly message rather than crashing.
  if (!profile) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-[#092c59]/10 bg-white p-7 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-9">
          <h1 className="text-3xl font-black tracking-[-.04em]">Profile setup required</h1>
          <p className="mt-3 text-sm leading-6 text-[#607286]">
            Your student profile is being prepared. Please refresh in a moment, or contact your
            coach if this persists.
          </p>
        </div>
      </main>
    )
  }

  // Already onboarded — no need to repeat.
  if (profile.onboardingCompletedAt) redirect('/dashboard/student')

  return (
    <StudentOnboardingForm
      healthDataNotice={coachingSettings.privacy.healthDataNotice}
      privacyURL={coachingSettings.privacy.privacyURL}
      profile={profile}
    />
  )
}
