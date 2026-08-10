import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { StudentInvitationForm } from '@/components/Dashboard/StudentInvitationForm'
import { DashboardShell } from '@/components/Dashboard/UI'
import { isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

export default async function InviteStudentPage() {
  const { user } = await requireDashboardUser()
  if (!isCoach(user)) redirect('/dashboard/student')

  return (
    <DashboardShell
      eyebrow="Student accounts"
      title="Invite a student"
      description="Create secure student access without choosing or sharing their password."
      actions={
        <Link
          href="/dashboard/coach"
          className="inline-flex items-center gap-2 rounded-full border border-[#092c59]/20 bg-white px-5 py-3 text-sm font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Coach dashboard
        </Link>
      }
    >
      <StudentInvitationForm />
    </DashboardShell>
  )
}
