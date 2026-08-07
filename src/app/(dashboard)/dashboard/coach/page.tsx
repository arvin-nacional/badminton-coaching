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

import { CoachRoster, type CoachRosterRow } from '@/components/Dashboard/CoachRoster'
import { DashboardShell, Empty, formatDate, Panel, ProgressBar, relationName, Stat } from '@/components/Dashboard/UI'
import type { Skill, StudentProfile } from '@/payload-types'
import { isAdmin, isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

export default async function CoachDashboardPage() {
  const { payload, user } = await requireDashboardUser()
  if (!isCoach(user)) redirect('/dashboard/student')

  const now = new Date()
  const nowISO = now.toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000)
  const profiles = await payload.find({
    collection: 'student-profiles',
    depth: 2,
    limit: 200,
    sort: 'displayName',
    overrideAccess: false,
    user,
    ...(!isAdmin(user) ? { where: { coach: { equals: user.id } } } : {}),
  })
  const studentIDs = profiles.docs.map((profile) => profile.id)
  const studentScope = { student: { in: studentIDs.length ? studentIDs : ['__no_assigned_students__'] } }
  const [sessions, completedSessions, progress, events] = await Promise.all([
    payload.find({ collection: 'training-sessions', depth: 2, limit: 500, sort: 'lessonWeek', overrideAccess: false, user, where: { and: [studentScope, { or: [{ status: { equals: 'planned' } }, { and: [{ scheduledAt: { greater_than_equal: nowISO } }, { status: { equals: 'scheduled' } }] }] }] } }),
    payload.find({ collection: 'training-sessions', depth: 2, limit: 100, sort: '-scheduledAt', overrideAccess: false, user, where: { and: [studentScope, { status: { equals: 'completed' } }] } }),
    payload.find({ collection: 'skill-progress', depth: 2, limit: 500, sort: '-updatedAt', overrideAccess: false, user, where: studentScope }),
    payload.find({ collection: 'coaching-events', depth: 2, limit: 100, sort: 'startsAt', overrideAccess: false, user, where: { and: [studentScope, { startsAt: { greater_than_equal: nowISO } }] } }),
  ])

  const assessmentNeeded = profiles.docs.filter((profile) => profile.assessmentStatus === 'required')
  const inactiveStudents = profiles.docs.filter((profile) => !profile.lastTrainingAt || new Date(profile.lastTrainingAt) < fourteenDaysAgo)
  const skillsAttention = progress.docs.filter((item) => item.progress < 60 || item.stage === 'learning')
  const attendanceAverage = profiles.docs.length ? Math.round(profiles.docs.reduce((sum, profile) => sum + profile.attendanceRate, 0) / profiles.docs.length) : 0
  const totalRemaining = profiles.docs.reduce((sum, profile) => sum + profile.sessionsRemaining, 0)
  const plannedSessions = sessions.docs.filter((session) => session.status === 'planned')
  const scheduledSessions = sessions.docs.filter((session) => session.status === 'scheduled')
  const visibleSessions = sessions.docs.filter((session) => {
    if (session.source !== 'program' || !session.lessonWeek || typeof session.student !== 'object') return true
    return session.lessonWeek >= session.student.currentProgramWeek
  })
  const rosterRows: CoachRosterRow[] = profiles.docs.map((profile) => {
    const nextSession = visibleSessions.find((session) => {
      const sessionStudentID = typeof session.student === 'object' ? session.student.id : session.student
      return sessionStudentID === profile.id && session.source === 'program' && session.lessonWeek === profile.currentProgramWeek
    }) || visibleSessions.find((session) => {
      const sessionStudentID = typeof session.student === 'object' ? session.student.id : session.student
      return sessionStudentID === profile.id && session.source === 'program'
    })
    return {
      assessmentRequired: profile.assessmentStatus === 'required',
      attendance: profile.attendanceRate,
      currentWeek: profile.currentProgramWeek,
      lessonTitle: nextSession?.title.replace(/^Week \d+:\s*/, '') || profile.weeklyFocus || 'Session plan not created',
      name: profile.displayName,
      phase: profile.currentPhase,
      program: relationName(profile.program),
      scheduledAt: nextSession?.scheduledAt,
      sessionStatus: nextSession?.status === 'scheduled' ? 'scheduled' : nextSession?.status === 'planned' ? 'planned' : 'missing',
      sessionsRemaining: profile.sessionsRemaining,
      studentID: profile.id,
    }
  })
  const upcomingCalendar = scheduledSessions.slice().sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime())

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
        <Panel title="Training plans" icon={CalendarDays}><Stat label="Program sessions" value={sessions.totalDocs} detail={`${plannedSessions.length} ready to schedule · ${scheduledSessions.length} scheduled`} /></Panel>
        <Panel title="Package balance" icon={WalletCards}><Stat label="Sessions remaining" value={totalRemaining} detail="Across all active packages" /></Panel>
        <Panel title="Attendance" icon={UserRoundCheck}><Stat label="Roster average" value={`${attendanceAverage}%`} detail="Current training cycles" /></Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-8" title="Upcoming calendar" subtitle="Confirmed sessions across your assigned roster" icon={CalendarDays}>
          <div className="space-y-3">{upcomingCalendar.length ? upcomingCalendar.slice(0, 8).map((session) => <Link key={session.id} href={typeof session.student === 'object' ? `/dashboard/coach/students/${session.student.id}` : `/admin/collections/training-sessions/${session.id}`} className="grid gap-3 rounded-2xl border border-[#092c59]/10 p-4 transition hover:bg-[#f8fbff] sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black">{studentName(session.student)} · {session.title}</p><p className="mt-1 text-sm text-[#718399]">{session.location || 'Location TBC'} · {session.phase || 'Program session'}</p></div><time className="text-sm font-bold text-[#1677ff]">{formatDate(session.scheduledAt)}</time></Link>) : <Empty text="No sessions are on the calendar yet. Use the roster below to schedule each prepared lesson." />}</div>
        </Panel>

        <Panel className="lg:col-span-4" title="Students requiring assessment" icon={AlertCircle}>
          <div className="space-y-3">{assessmentNeeded.length ? assessmentNeeded.map((profile) => <div key={profile.id} className="flex items-center justify-between rounded-2xl bg-[#fff6e8] p-4"><div><p className="font-black">{profile.displayName}</p><p className="text-sm text-[#8b6a31]">{relationName(profile.program)} · {profile.currentPhase}</p></div><Link href={`/dashboard/coach/students/${profile.id}`} className="text-sm font-bold text-[#1677ff]">Review</Link></div>) : <div className="flex items-center gap-3 rounded-2xl bg-[#e9f8ef] p-4 text-sm font-bold text-[#24734b]"><CheckCircle2 className="h-5 w-5" /> All assessments are current.</div>}</div>
        </Panel>

        <Panel className="lg:col-span-12" title="Student lesson queue" subtitle="Search all assigned players and open the exact lesson they need next" icon={UsersRound}>
          <CoachRoster rows={rosterRows} />
        </Panel>

        <Panel className="lg:col-span-4" title="Students needing follow-up" subtitle="No training recorded in the last 14 days" icon={Clock3}>
          <div className="space-y-3">{inactiveStudents.length ? inactiveStudents.map((profile) => <div key={profile.id} className="rounded-2xl bg-[#f3f7fc] p-4"><p className="font-black">{profile.displayName}</p><p className="mt-1 text-sm text-[#718399]">Last training: {formatDate(profile.lastTrainingAt, false)}</p></div>) : <Empty text="Every student has trained recently." />}</div>
        </Panel>

        <Panel className="lg:col-span-8" title="Skills needing attention" subtitle="Learning-stage skills or progress below 60%" icon={TrendingUp}>
          <div className="space-y-4">{skillsAttention.length ? skillsAttention.slice(0, 8).map((item) => <ProgressBar key={item.id} label={`${studentName(item.student)} · ${relationName(item.skill as Skill)}`} value={item.progress} trailing={`${item.progress - (item.previousProgress || 0) >= 0 ? '+' : ''}${item.progress - (item.previousProgress || 0)} since last assessment`} />) : <Empty text="No skills are currently below the attention threshold." />}</div>
        </Panel>

        <Panel className="lg:col-span-5" title="Last session notes" icon={ListChecks}>
          <div className="space-y-3">{Array.from(latestByStudent.values()).slice(0, 6).map((session) => <div key={session.id} className="rounded-2xl border border-[#092c59]/10 p-4"><p className="font-black">{studentName(session.student)}</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-[#607286]">{session.studentSummary || session.coachNotes || 'No summary was recorded.'}</p><p className="mt-2 text-xs text-[#718399]">{formatDate(session.scheduledAt, false)}</p></div>)}{!latestByStudent.size && <Empty text="Completed session notes will appear here." />}</div>
        </Panel>

        <Panel className="lg:col-span-7" title="Reusable session planner" subtitle="Build every session from the same complete coaching structure" icon={ClipboardPlus}>
          <div className="grid gap-3 sm:grid-cols-2">{[
            ['01', 'Warm-up'], ['02', 'Movement preparation'], ['03', 'Technical drill'], ['04', 'Progressive drill'], ['05', 'Conditioned game'], ['06', 'Match play'], ['07', 'Cooldown and feedback'],
          ].map(([number, label]) => <div key={number} className="flex items-center gap-4 rounded-2xl bg-[#f3f7fc] p-4"><span className="font-mono text-xs font-bold text-[#1677ff]">{number}</span><span className="font-bold">{label}</span></div>)}</div>
          <Link href="/admin/collections/training-sessions/create" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white"><ClipboardPlus className="h-4 w-4" /> Create a session plan</Link>
        </Panel>

        <Panel className="lg:col-span-12" title="Upcoming assessments & tournaments" icon={Dumbbell}>
          <div className="space-y-3">{events.docs.length ? events.docs.slice(0, 8).map((event) => <div key={event.id} className="rounded-2xl bg-[#f3f7fc] p-4"><div className="flex justify-between gap-4"><p className="font-black">{event.title}</p><span className="text-xs font-bold uppercase text-[#1677ff]">{event.eventType}</span></div><p className="mt-2 text-sm text-[#718399]">{studentName(event.student)} · {formatDate(event.startsAt, false)}</p></div>) : <Empty text="No assessments or tournaments are scheduled." />}</div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
