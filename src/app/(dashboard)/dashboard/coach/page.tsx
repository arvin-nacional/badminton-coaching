import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardPlus,
  Clock3,
  Dumbbell,
  ListChecks,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DashboardShell, Empty, formatDate, Panel, ProgressBar, relationName, Stat } from '@/components/Dashboard/UI'
import type { Drill, Skill, StudentProfile } from '@/payload-types'
import { isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

export default async function CoachDashboardPage() {
  const { payload, user } = await requireDashboardUser()
  if (!isCoach(user)) redirect('/dashboard/student')

  const now = new Date()
  const nowISO = now.toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000)
  const [profiles, sessions, completedSessions, progress, assignments, events] = await Promise.all([
    payload.find({ collection: 'student-profiles', depth: 2, limit: 200, sort: 'displayName', overrideAccess: false, user }),
    payload.find({ collection: 'training-sessions', depth: 2, limit: 100, sort: 'scheduledAt', overrideAccess: false, user, where: { and: [{ scheduledAt: { greater_than_equal: nowISO } }, { status: { equals: 'scheduled' } }] } }),
    payload.find({ collection: 'training-sessions', depth: 2, limit: 100, sort: '-scheduledAt', overrideAccess: false, user, where: { status: { equals: 'completed' } } }),
    payload.find({ collection: 'skill-progress', depth: 2, limit: 500, sort: '-updatedAt', overrideAccess: false, user }),
    payload.find({ collection: 'assignments', depth: 2, limit: 500, sort: '-updatedAt', overrideAccess: false, user, where: { status: { not_equals: 'completed' } } }),
    payload.find({ collection: 'coaching-events', depth: 2, limit: 100, sort: 'startsAt', overrideAccess: false, user, where: { startsAt: { greater_than_equal: nowISO } } }),
  ])

  const assessmentNeeded = profiles.docs.filter((profile) => profile.assessmentStatus === 'required')
  const inactiveStudents = profiles.docs.filter((profile) => !profile.lastTrainingAt || new Date(profile.lastTrainingAt) < fourteenDaysAgo)
  const skillsAttention = progress.docs.filter((item) => item.progress < 60 || item.stage === 'learning')
  const attendanceAverage = profiles.docs.length ? Math.round(profiles.docs.reduce((sum, profile) => sum + profile.attendanceRate, 0) / profiles.docs.length) : 0
  const totalRemaining = profiles.docs.reduce((sum, profile) => sum + profile.sessionsRemaining, 0)

  const studentName = (value: string | StudentProfile) => typeof value === 'object' ? value.displayName : 'Student'
  const latestByStudent = new Map<string, typeof completedSessions.docs[number]>()
  completedSessions.docs.forEach((session) => {
    const profile = typeof session.student === 'object' ? session.student : null
    if (profile && !latestByStudent.has(profile.id)) latestByStudent.set(profile.id, session)
  })

  return (
    <DashboardShell
      eyebrow="Coach dashboard"
      title={`Good day${user.name ? `, ${user.name}` : ''}`}
      description="Your roster, next sessions, player priorities, and planning tools in one working view."
      actions={<div className="flex gap-3"><Link href="/dashboard/student" className="rounded-full border border-[#092c59]/20 bg-white px-5 py-3 text-sm font-bold">Student view</Link><Link href="/admin/collections/training-sessions/create" className="rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white">Plan a session</Link></div>}
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel title="Active students" icon={UsersRound}><Stat label="Roster" value={profiles.totalDocs} detail={`${inactiveStudents.length} need follow-up`} /></Panel>
        <Panel title="Upcoming sessions" icon={CalendarDays}><Stat label="Scheduled" value={sessions.totalDocs} detail={sessions.docs[0] ? `Next: ${formatDate(sessions.docs[0].scheduledAt)}` : 'No sessions scheduled'} /></Panel>
        <Panel title="Package balance" icon={WalletCards}><Stat label="Sessions remaining" value={totalRemaining} detail="Across all active packages" /></Panel>
        <Panel title="Attendance" icon={UserRoundCheck}><Stat label="Roster average" value={`${attendanceAverage}%`} detail="Current training cycles" /></Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7" title="Upcoming training sessions" subtitle="Students with a session on the calendar" icon={CalendarDays}>
          <div className="space-y-3">{sessions.docs.length ? sessions.docs.slice(0, 8).map((session) => <div key={session.id} className="grid gap-3 rounded-2xl border border-[#092c59]/10 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black">{studentName(session.student)} · {session.title}</p><p className="mt-1 text-sm text-[#718399]">{session.location || 'Location TBC'} · {session.plan?.warmUp || 'Plan in progress'}</p></div><time className="text-sm font-bold text-[#1677ff]">{formatDate(session.scheduledAt)}</time></div>) : <Empty text="No upcoming sessions." />}</div>
        </Panel>

        <Panel className="lg:col-span-5" title="Students requiring assessment" icon={AlertCircle}>
          <div className="space-y-3">{assessmentNeeded.length ? assessmentNeeded.map((profile) => <div key={profile.id} className="flex items-center justify-between rounded-2xl bg-[#fff6e8] p-4"><div><p className="font-black">{profile.displayName}</p><p className="text-sm text-[#8b6a31]">{relationName(profile.program)} · {profile.currentPhase}</p></div><Link href={`/admin/collections/student-profiles/${profile.id}`} className="text-sm font-bold text-[#1677ff]">Review</Link></div>) : <div className="flex items-center gap-3 rounded-2xl bg-[#e9f8ef] p-4 text-sm font-bold text-[#24734b]"><CheckCircle2 className="h-5 w-5" /> All assessments are current.</div>}</div>
        </Panel>

        <Panel className="lg:col-span-8" title="Player overview" subtitle="Program, phase, package balance, attendance, and active drills" icon={UsersRound}>
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[#092c59]/10 text-xs uppercase tracking-wider text-[#718399]"><tr><th className="pb-3">Student</th><th className="pb-3">Program / phase</th><th className="pb-3">Package</th><th className="pb-3">Attendance</th><th className="pb-3">Drills</th></tr></thead><tbody>{profiles.docs.map((profile) => { const activeDrills = assignments.docs.filter((item) => typeof item.student === 'object' && item.student.id === profile.id).length; return <tr key={profile.id} className="border-b border-[#092c59]/5 last:border-0"><td className="py-4 font-black"><Link href={`/admin/collections/student-profiles/${profile.id}`}>{profile.displayName}</Link></td><td className="py-4">{relationName(profile.program)}<span className="block text-xs text-[#718399]">{profile.currentPhase}</span></td><td className="py-4">{profile.sessionsRemaining}/{profile.packageSessions}<span className="block text-xs text-[#718399]">{profile.packageName}</span></td><td className="py-4"><span className="font-bold">{profile.attendanceRate}%</span></td><td className="py-4">{activeDrills}</td></tr>})}</tbody></table>{!profiles.docs.length && <Empty text="Create a student profile to begin building your roster." />}</div>
        </Panel>

        <Panel className="lg:col-span-4" title="Students needing follow-up" subtitle="No training recorded in the last 14 days" icon={Clock3}>
          <div className="space-y-3">{inactiveStudents.length ? inactiveStudents.map((profile) => <div key={profile.id} className="rounded-2xl bg-[#f3f7fc] p-4"><p className="font-black">{profile.displayName}</p><p className="mt-1 text-sm text-[#718399]">Last training: {formatDate(profile.lastTrainingAt, false)}</p></div>) : <Empty text="Every student has trained recently." />}</div>
        </Panel>

        <Panel className="lg:col-span-6" title="Skills needing attention" subtitle="Learning-stage skills or progress below 60%" icon={TrendingUp}>
          <div className="space-y-4">{skillsAttention.length ? skillsAttention.slice(0, 8).map((item) => <ProgressBar key={item.id} label={`${studentName(item.student)} · ${relationName(item.skill as Skill)}`} value={item.progress} trailing={`${item.progress - (item.previousProgress || 0) >= 0 ? '+' : ''}${item.progress - (item.previousProgress || 0)} since last assessment`} />) : <Empty text="No skills are currently below the attention threshold." />}</div>
        </Panel>

        <Panel className="lg:col-span-6" title="Last session notes" icon={ListChecks}>
          <div className="space-y-3">{Array.from(latestByStudent.values()).slice(0, 6).map((session) => <div key={session.id} className="rounded-2xl border border-[#092c59]/10 p-4"><p className="font-black">{studentName(session.student)}</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-[#607286]">{session.studentSummary || session.coachNotes || 'No summary was recorded.'}</p><p className="mt-2 text-xs text-[#718399]">{formatDate(session.scheduledAt, false)}</p></div>)}{!latestByStudent.size && <Empty text="Completed session notes will appear here." />}</div>
        </Panel>

        <Panel className="lg:col-span-7" title="Reusable session planner" subtitle="Build every session from the same complete coaching structure" icon={ClipboardPlus}>
          <div className="grid gap-3 sm:grid-cols-2">{[
            ['01', 'Warm-up'], ['02', 'Movement preparation'], ['03', 'Technical drill'], ['04', 'Progressive drill'], ['05', 'Conditioned game'], ['06', 'Match play'], ['07', 'Cooldown and feedback'],
          ].map(([number, label]) => <div key={number} className="flex items-center gap-4 rounded-2xl bg-[#f3f7fc] p-4"><span className="font-mono text-xs font-bold text-[#1677ff]">{number}</span><span className="font-bold">{label}</span></div>)}</div>
          <Link href="/admin/collections/training-sessions/create" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white"><ClipboardPlus className="h-4 w-4" /> Create a session plan</Link>
        </Panel>

        <Panel className="lg:col-span-5" title="Upcoming assessments & tournaments" icon={Dumbbell}>
          <div className="space-y-3">{events.docs.length ? events.docs.slice(0, 8).map((event) => <div key={event.id} className="rounded-2xl bg-[#f3f7fc] p-4"><div className="flex justify-between gap-4"><p className="font-black">{event.title}</p><span className="text-xs font-bold uppercase text-[#1677ff]">{event.eventType}</span></div><p className="mt-2 text-sm text-[#718399]">{studentName(event.student)} · {formatDate(event.startsAt, false)}</p></div>) : <Empty text="No assessments or tournaments are scheduled." />}</div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
