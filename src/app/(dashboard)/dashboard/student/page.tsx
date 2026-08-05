import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  PlayCircle,
  Target,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'

import { DashboardShell, Empty, formatDate, Panel, ProgressBar, relationName, Stat } from '@/components/Dashboard/UI'
import type { Drill, Program, Skill } from '@/payload-types'
import { isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

const stageLabels = {
  'not-introduced': 'Not introduced',
  learning: 'Learning',
  controlled: 'Controlled',
  'game-ready': 'Game ready',
  'pressure-ready': 'Pressure ready',
}

const categoryLabels: Record<string, string> = {
  'stroke-technique': 'Stroke technique',
  footwork: 'Footwork',
  consistency: 'Consistency',
  'tactical-decisions': 'Tactical decisions',
  'match-performance': 'Match performance',
  'physical-readiness': 'Physical readiness',
  'training-habits': 'Training habits',
}

export default async function StudentDashboardPage() {
  const { payload, user } = await requireDashboardUser()
  const profileResult = await payload.find({
    collection: 'student-profiles',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    user,
    where: { user: { equals: user.id } },
  })
  const profile = profileResult.docs[0]

  if (!profile) {
    return <DashboardShell eyebrow="Student dashboard" title={`Welcome${user.name ? `, ${user.name}` : ''}`} description="Your account is ready, but a coach has not created your player profile yet."><Panel title="Profile setup required" icon={ClipboardList}><p className="text-[#607286]">Ask your coach to create a Student Profile and connect it to {user.email}. Your program, sessions, drills, and progress will appear here automatically.</p>{isCoach(user) && <Link className="mt-5 inline-flex rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white" href="/admin/collections/student-profiles/create">Create profile</Link>}</Panel></DashboardShell>
  }

  const now = new Date().toISOString()
  const [sessions, assignments, skillProgress, events, completedSessions] = await Promise.all([
    payload.find({ collection: 'training-sessions', depth: 2, limit: 5, sort: 'scheduledAt', overrideAccess: false, user, where: { and: [{ student: { equals: profile.id } }, { scheduledAt: { greater_than_equal: now } }, { status: { equals: 'scheduled' } }] } }),
    payload.find({ collection: 'assignments', depth: 2, limit: 20, sort: 'dueAt', overrideAccess: false, user, where: { student: { equals: profile.id } } }),
    payload.find({ collection: 'skill-progress', depth: 2, limit: 100, sort: '-updatedAt', overrideAccess: false, user, where: { student: { equals: profile.id } } }),
    payload.find({ collection: 'coaching-events', depth: 1, limit: 5, sort: 'startsAt', overrideAccess: false, user, where: { and: [{ student: { equals: profile.id } }, { startsAt: { greater_than_equal: now } }] } }),
    payload.find({ collection: 'training-sessions', depth: 1, limit: 1, sort: '-scheduledAt', overrideAccess: false, user, where: { and: [{ student: { equals: profile.id } }, { status: { equals: 'completed' } }] } }),
  ])

  const program = typeof profile.program === 'object' ? profile.program as Program : null
  const nextSession = sessions.docs[0]
  const activeAssignments = assignments.docs.filter((item) => item.status !== 'completed')
  const completedAssignments = assignments.docs.filter((item) => item.status === 'completed')
  const completedSkills = skillProgress.docs.filter((item) => ['game-ready', 'pressure-ready'].includes(item.stage))
  const developingSkills = skillProgress.docs.filter((item) => ['learning', 'controlled'].includes(item.stage))
  const latestFeedback = completedSessions.docs[0]?.studentSummary || completedSessions.docs[0]?.coachNotes || activeAssignments.find((item) => item.coachFeedback)?.coachFeedback

  const categoryProgress = Object.entries(categoryLabels).map(([category, label]) => {
    const values = skillProgress.docs.filter((item) => typeof item.skill === 'object' && (item.skill as Skill).category === category).map((item) => item.progress)
    return { label, value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0 }
  })

  const videos = assignments.docs.flatMap((assignment) => {
    const drill = typeof assignment.drill === 'object' ? assignment.drill as Drill : null
    return drill?.videoURL ? [{ title: drill.name, url: drill.videoURL, level: drill.level }] : []
  })

  return (
    <DashboardShell eyebrow="Student dashboard" title={`Hi, ${profile.displayName}`} description="Everything you need for your next session and the clearest view of where your game is improving.">
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="bg-[#092c59] text-white lg:col-span-8" title="Your next focus" subtitle="This week's coaching priority" icon={Target}>
          <p className="text-3xl font-black tracking-tight text-[#4cc9ff]">{profile.weeklyFocus}</p>
          <p className="mt-3 max-w-3xl leading-7 text-white/75">{profile.focusExplanation}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><Stat label="Current program" value={program?.name || 'Program'} detail={profile.currentPhase} /><Stat label="Attendance" value={`${profile.attendanceRate}%`} detail="Current training cycle" /><Stat label="Package balance" value={profile.sessionsRemaining} detail={`${profile.packageName} · ${profile.packageSessions} sessions`} /></div>
        </Panel>

        <Panel className="lg:col-span-4" title="Next training session" icon={CalendarDays}>
          {nextSession ? <><p className="text-2xl font-black">{nextSession.title}</p><p className="mt-2 text-[#1677ff] font-bold">{formatDate(nextSession.scheduledAt)}</p><p className="mt-2 text-sm text-[#718399]">{nextSession.location || 'Location to be confirmed'}</p><div className="mt-5 rounded-2xl bg-[#eaf3ff] p-4 text-sm"><strong>Session plan:</strong><p className="mt-1 text-[#607286]">{nextSession.plan?.warmUp || 'Your coach is preparing the session plan.'}</p></div></> : <Empty text="No upcoming training session is scheduled." />}
        </Panel>

        <Panel className="lg:col-span-5" title="Assigned drills" subtitle={`${activeAssignments.length} active · ${completedAssignments.length} completed`} icon={ClipboardList}>
          <div className="space-y-3">{activeAssignments.length ? activeAssignments.slice(0, 5).map((assignment) => { const drill = typeof assignment.drill === 'object' ? assignment.drill as Drill : null; return <div key={assignment.id} className="rounded-2xl border border-[#092c59]/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{drill?.name || assignment.title}</p><p className="mt-1 text-sm text-[#718399]">{drill?.successTarget || assignment.title}</p></div><span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold text-[#1677ff]">{assignment.status}</span></div>{assignment.dueAt && <p className="mt-3 text-xs text-[#718399]">Due {formatDate(assignment.dueAt, false)}</p>}</div> }) : <Empty text="No drills are currently assigned." />}</div>
        </Panel>

        <Panel className="lg:col-span-7" title="Coach feedback" icon={MessageSquareText}>
          {latestFeedback ? <blockquote className="rounded-2xl bg-[#eaf3ff] p-5 text-lg font-semibold leading-8">“{latestFeedback}”</blockquote> : <Empty text="Feedback will appear after your coach completes a session review." />}
        </Panel>

        <Panel className="lg:col-span-7" title="Progress by development area" subtitle="Separate categories show what is really changing" icon={Trophy}>
          <div className="grid gap-5 sm:grid-cols-2">{categoryProgress.map((category) => <ProgressBar key={category.label} label={category.label} value={category.value} />)}</div>
        </Panel>

        <Panel className="lg:col-span-5" title="Skills in development" icon={Target}>
          <div className="space-y-4">{developingSkills.length ? developingSkills.slice(0, 6).map((item) => <ProgressBar key={item.id} label={relationName(item.skill as Skill)} value={item.progress} trailing={stageLabels[item.stage]} />) : <Empty text="No skills are currently marked as learning or controlled." />}</div>
          <div className="mt-6 border-t border-[#092c59]/10 pt-5"><p className="mb-3 flex items-center gap-2 text-sm font-black"><CheckCircle2 className="h-4 w-4 text-[#1677ff]" /> Skills completed</p><div className="flex flex-wrap gap-2">{completedSkills.length ? completedSkills.map((item) => <span key={item.id} className="rounded-full bg-[#eaf3ff] px-3 py-2 text-xs font-bold">{relationName(item.skill as Skill)}</span>) : <span className="text-sm text-[#718399]">Completed skills will appear here.</span>}</div></div>
        </Panel>

        <Panel className="lg:col-span-6" title="Upcoming assessment or tournament" icon={Trophy}>
          <div className="space-y-3">{events.docs.length ? events.docs.map((event) => <div key={event.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f3f7fc] p-4"><div><p className="font-black">{event.title}</p><p className="mt-1 text-sm text-[#718399]">{event.eventType} · {event.location || 'Location TBC'}</p></div><time className="text-right text-sm font-bold text-[#1677ff]">{formatDate(event.startsAt, false)}</time></div>) : <Empty text="No upcoming assessment or tournament." />}</div>
        </Panel>

        <Panel className="lg:col-span-6" title="Training videos" subtitle="Demonstrations attached to your assigned drills" icon={PlayCircle}>
          <div className="space-y-3">{videos.length ? videos.map((video) => <a key={`${video.title}-${video.url}`} href={video.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[#092c59]/10 p-4 transition hover:bg-[#eaf3ff]"><span><strong className="block">{video.title}</strong><span className="text-xs uppercase text-[#718399]">{video.level}</span></span><PlayCircle className="h-6 w-6 text-[#1677ff]" /></a>) : <Empty text="Training videos will appear when a coach adds them to your drills." />}</div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
