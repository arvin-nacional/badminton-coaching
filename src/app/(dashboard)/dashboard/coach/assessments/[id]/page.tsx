import { redirect } from 'next/navigation'
import { AssessmentWorkspace, type AssessmentScores } from '@/components/Dashboard/AssessmentWorkspace'
import { DashboardShell, formatDate } from '@/components/Dashboard/UI'
import { isAdmin, isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

const idOf = (value: unknown) => typeof value === 'string' ? value : value && typeof value === 'object' && 'id' in value ? String(value.id) : null

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { payload, user } = await requireDashboardUser()
  if (!isCoach(user)) redirect('/dashboard/student')
  const { id } = await params
  const booking = await payload.findByID({ collection: 'assessment-bookings', id, depth: 1, overrideAccess: false, user }).catch(() => null)
  if (!booking || (!isAdmin(user) && idOf(booking.coach) !== user.id)) redirect('/dashboard/coach')
  const results = booking.assessmentResults
  const scores: AssessmentScores = { ...results?.movement, ...results?.technical, ...results?.tactical }
  return <DashboardShell eyebrow="60-minute assessment" title={booking.playerName} description={`${formatDate(booking.startsAt)} · ${booking.location} · ${booking.durationMinutes} minutes`}><div className="mb-6 rounded-2xl bg-[#eaf3ff] p-5 text-sm leading-6 text-[#405d7d]"><strong className="text-[#092c59]">Player profile:</strong> {booking.goals || 'No goals provided'}<br /><strong className="text-[#092c59]">Experience:</strong> {booking.playingExperience || 'Not provided'} · <strong className="text-[#092c59]">Event:</strong> {booking.preferredEvent || 'Not provided'} · <strong className="text-[#092c59]">Availability:</strong> {booking.trainingAvailability || 'Not provided'}{booking.injuryConsiderations ? <><br /><strong className="text-[#092c59]">Injuries / limitations:</strong> {booking.injuryConsiderations}</> : null}</div><AssessmentWorkspace bookingID={booking.id} initial={{ scores, strengths: results?.strengths?.map((item) => item.item), priorities: results?.trainingPriorities?.map((item) => item.item), firstSessionFocus: results?.firstSessionFocus || '', independentPractice: results?.independentPractice || '', coachSummary: results?.coachSummary || '', completed: booking.status === 'completed' }} /></DashboardShell>
}
