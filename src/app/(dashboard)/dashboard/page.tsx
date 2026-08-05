import { redirect } from 'next/navigation'

import { isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

export default async function DashboardPage() {
  const { user } = await requireDashboardUser()
  redirect(isCoach(user) ? '/dashboard/coach' : '/dashboard/student')
}
