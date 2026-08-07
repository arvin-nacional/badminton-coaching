import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MessageSquareText,
  PlayCircle,
  Target,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'

import { DashboardShell, Empty, formatDate, Panel, ProgressBar, relationName, Stat } from '@/components/Dashboard/UI'
import { IndependentPracticeCheck } from '@/components/Dashboard/IndependentPracticeCheck'
import type { PracticeLibrary, Skill } from '@/payload-types'
import { isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

const stageLabels = {
  'not-introduced': 'Not introduced',
  learning: 'Learning',
  controlled: 'Controlled',
  'game-ready': 'Game ready',
  'pressure-ready': 'Pressure ready',
}

const displayedStage = (progress: number, stage: keyof typeof stageLabels): keyof typeof stageLabels => (
  progress <= 0 ? 'not-introduced' : stage
)

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
    return (
      <DashboardShell
        eyebrow="Student dashboard"
        title={`Welcome${user.name ? `, ${user.name}` : ''}`}
        description="Your account is ready, but a coach has not created your player profile yet."
      >
        <Panel title="Profile setup required" icon={ClipboardList}>
          <p className="text-[#607286]">Ask your coach to create a Student Profile and connect it to {user.email}. Your program, sessions, drills, and progress will appear here automatically.</p>
          {isCoach(user) && <Link className="mt-5 inline-flex rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white" href="/admin/collections/student-profiles/create">Create profile</Link>}
        </Panel>
      </DashboardShell>
    )
  }

  const now = new Date().toISOString()
  const programID = typeof profile.program === 'string' ? profile.program : profile.program?.id
  const [program, practices, sessions, skillProgress, events, completedSessions] = await Promise.all([
    programID
      ? payload.findByID({ collection: 'programs', id: programID, depth: 2, overrideAccess: false, user })
      : Promise.resolve(null),
    payload.find({ collection: 'independent-practices', depth: 2, limit: 100, sort: '-updatedAt', overrideAccess: false, user, where: { student: { equals: profile.id } } }),
    payload.find({ collection: 'training-sessions', depth: 2, limit: 5, sort: 'scheduledAt', overrideAccess: false, user, where: { and: [{ student: { equals: profile.id } }, { scheduledAt: { greater_than_equal: now } }, { status: { equals: 'scheduled' } }] } }),
    payload.find({ collection: 'skill-progress', depth: 2, limit: 100, sort: '-updatedAt', overrideAccess: false, user, where: { student: { equals: profile.id } } }),
    payload.find({ collection: 'coaching-events', depth: 1, limit: 5, sort: 'startsAt', overrideAccess: false, user, where: { and: [{ student: { equals: profile.id } }, { startsAt: { greater_than_equal: now } }] } }),
    payload.find({ collection: 'training-sessions', depth: 1, limit: 1, sort: '-scheduledAt', overrideAccess: false, user, where: { and: [{ student: { equals: profile.id } }, { status: { equals: 'completed' } }] } }),
  ])

  const programWeek = program ? Math.min(Math.max(profile.currentProgramWeek || 1, 1), program.durationWeeks) : 1
  const phases = program?.phases?.slice().sort((a, b) => a.order - b.order) || []
  const currentPhase = phases.find((phase) => programWeek >= phase.startWeek && programWeek <= phase.endWeek) || phases[0]
  const programLessons = phases.flatMap((phase) => phase.lessons || []).sort((a, b) => a.week - b.week)
  const currentLesson = programLessons.find((programLesson) => programLesson.week === programWeek) || programLessons[0]
  const lessonPractice = currentLesson && typeof currentLesson.independentPractice === 'object'
    ? currentLesson.independentPractice as PracticeLibrary
    : null
  const currentPractice = practices.docs.find((practice) => {
    const practiceProgramID = typeof practice.program === 'string' ? practice.program : practice.program.id
    return practiceProgramID === programID && practice.lessonWeek === programWeek
  })
  const practiceTemplate = currentPractice && typeof currentPractice.practice === 'object'
    ? currentPractice.practice as PracticeLibrary
    : lessonPractice
  const drillReferences = practiceTemplate?.drills.length
    ? practiceTemplate.drills
    : currentPractice?.drills || []
  const drillIDs = drillReferences.map((drill) => typeof drill === 'string' ? drill : drill.id)
  const drillResult = drillIDs.length
    ? await payload.find({
        collection: 'drills',
        depth: 1,
        limit: drillIDs.length,
        overrideAccess: false,
        user,
        where: { id: { in: drillIDs } },
      })
    : null
  const drillsByID = new Map((drillResult?.docs || []).map((drill) => [drill.id, drill]))
  const practiceDrills = drillIDs.flatMap((drillID) => {
    const drill = drillsByID.get(drillID)
    return drill ? [drill] : []
  })
  const upcomingLessons = programLessons.filter((programLesson) => programLesson.week > programWeek).slice(0, 3)
  const nextSession = sessions.docs[0]
  const completedSkills = skillProgress.docs.filter((item) => ['game-ready', 'pressure-ready'].includes(item.stage))
  const developingSkills = skillProgress.docs.filter((item) => ['not-introduced', 'learning', 'controlled'].includes(item.stage))
  const latestFeedback = completedSessions.docs[0]?.studentSummary || currentPractice?.coachFeedback

  const categoryProgress = Object.entries(categoryLabels).map(([category, label]) => {
    const values = skillProgress.docs
      .filter((item) => typeof item.skill === 'object' && (item.skill as Skill).category === category)
      .map((item) => item.progress)
    return { label, value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0 }
  })

  const videos = practiceDrills.flatMap((drill) => drill.videoURL ? [{ title: drill.name, url: drill.videoURL, level: drill.level }] : [])

  return (
    <DashboardShell
      eyebrow="Student dashboard"
      title={`Hi, ${profile.displayName}`}
      description="Everything you need for your next session and the clearest view of where your game is improving."
    >
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel tone="dark" className="lg:col-span-8" title="Your next focus" subtitle="This week's coaching priority" icon={Target}>
          <p className="text-3xl font-black tracking-tight text-[#4cc9ff]">{currentLesson?.title || profile.weeklyFocus}</p>
          <p className="mt-3 max-w-3xl leading-7 text-white/75">{currentLesson?.objective || profile.focusExplanation}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat
              label="Current program"
              value={program?.name || 'Not assigned'}
              detail={program ? `${currentPhase?.name || profile.currentPhase} · Week ${programWeek} of ${program.durationWeeks}` : profile.currentPhase}
            />
            <Stat label="Attendance" value={`${profile.attendanceRate}%`} detail="Current training cycle" />
            <Stat label="Package balance" value={profile.sessionsRemaining} detail={`${profile.packageName} · ${profile.packageSessions} sessions`} />
          </div>
        </Panel>

        <Panel className="lg:col-span-4" title="Next training session" icon={CalendarDays}>
          {nextSession ? (
            <>
              <p className="text-2xl font-black">{nextSession.title}</p>
              <p className="mt-2 font-bold text-[#1677ff]">{formatDate(nextSession.scheduledAt)}</p>
              <p className="mt-2 text-sm text-[#718399]">{nextSession.location || 'Location to be confirmed'}</p>
              <div className="mt-5 rounded-2xl bg-[#eaf3ff] p-4 text-sm"><strong>Session plan:</strong><p className="mt-1 text-[#607286]">{nextSession.plan?.warmUp || 'Your coach is preparing the session plan.'}</p></div>
            </>
          ) : <Empty text="No upcoming training session is scheduled." />}
        </Panel>

        <Panel className="lg:col-span-12" title="Your program plan" subtitle={program ? `${program.name} · Week ${programWeek} of ${program.durationWeeks}` : 'Your coach will assign the right pathway'} icon={BookOpen}>
          {program && currentLesson ? (
            <div className={upcomingLessons.length ? 'grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]' : ''}>
              <div className="rounded-3xl bg-[#eaf3ff] p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#1677ff]">
                  <span>{currentPhase?.name}</span><span>·</span><span>Week {currentLesson.week}</span><span>·</span><span>{currentLesson.lessonType.replace('-', ' ')}</span>
                </div>
                <h3 className="mt-3 text-2xl font-black">{currentLesson.title}</h3>
                <p className="mt-2 leading-7 text-[#607286]">{currentLesson.objective}</p>
                <div className="mt-5 rounded-2xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#718399]">Success criteria</p>
                  <p className="mt-2 text-sm leading-6">{currentLesson.successCriteria}</p>
                </div>
              </div>
              {upcomingLessons.length ? (
                <div className="border-t border-[#092c59]/10 pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-1">
                  <p className="mb-3 text-sm font-black">Coming up next</p>
                  <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                    {upcomingLessons.map((programLesson) => <div key={programLesson.id || programLesson.week} className="rounded-2xl bg-[#f3f7fc] p-4"><p className="text-xs font-black uppercase text-[#1677ff]">Week {programLesson.week}</p><p className="mt-2 font-black">{programLesson.title}</p></div>)}
                  </div>
                </div>
              ) : null}
            </div>
          ) : <Empty text="No program has been assigned yet. Once your coach selects one, its current lesson and drills will appear here automatically." />}
        </Panel>

        <Panel className="lg:col-span-12" title="Independent practice" subtitle={currentPractice?.status === 'completed' ? 'Completed for this program week' : 'Complete this before your next session'} icon={ClipboardList}>
          {currentLesson ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(280px,.78fr)_minmax(0,1.72fr)]">
              <div className="rounded-3xl bg-[#f6f9fd] p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">This week</p>
                    <h3 className="mt-2 text-xl font-black leading-tight text-[#092c59]">{currentPractice?.title || currentLesson.title}</h3>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#607286]"><Clock3 className="h-4 w-4 text-[#1677ff]" /> Week {programWeek}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#607286]">{practiceTemplate?.instructions || currentPractice?.instructions}</p>

                <div className="mt-6 rounded-2xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#718399]">Completion target</p>
                  <p className="mt-2 text-sm leading-6 text-[#213b58]">{practiceTemplate?.successCriteria || currentPractice?.successCriteria || currentLesson.successCriteria}</p>
                </div>

                {currentPractice ? <IndependentPracticeCheck practiceID={currentPractice.id} initialCompleted={currentPractice.status === 'completed'} /> : <p className="mt-5 rounded-2xl border border-dashed border-[#9db1c8] p-4 text-sm font-semibold text-[#718399]">Your practice checklist is being prepared. Refresh after your coach saves the program.</p>}
              </div>

              <div>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">Practice drills</p>
                    <h3 className="mt-1 text-xl font-black text-[#092c59]">What to work through</h3>
                  </div>
                  {practiceDrills.length ? <p className="text-xs font-bold text-[#718399]">{practiceDrills.length} {practiceDrills.length === 1 ? 'drill' : 'drills'} · {practiceDrills.reduce((total, drill) => total + drill.durationMinutes, 0)} minutes</p> : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {practiceDrills.length ? practiceDrills.map((drill, index) => (
                    <article key={drill.id} className="overflow-hidden rounded-3xl border border-[#092c59]/10 bg-white shadow-[0_14px_32px_-28px_rgba(9,44,89,.45)]">
                      <div className="border-b border-[#092c59]/8 bg-[#f8fbff] p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1677ff] text-xs font-black text-white">{index + 1}</span>
                            <div>
                              <p className="font-black leading-5 text-[#092c59]">{drill.name}</p>
                              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold text-[#607286]">
                                <span className="rounded-full bg-white px-2.5 py-1">{drill.durationMinutes} min</span>
                                <span className="rounded-full bg-white px-2.5 py-1 capitalize">{drill.eventType}</span>
                                <span className="rounded-full bg-white px-2.5 py-1">{drill.numberOfPlayers} {drill.numberOfPlayers === 1 ? 'player' : 'players'}</span>
                              </div>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-black uppercase text-[#1677ff]">{drill.difficulty}</span>
                        </div>
                      </div>

                      <div className="space-y-4 p-5 text-sm leading-6">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-[#718399]">How to do it</p>
                          <p className="mt-1 text-[#334b65]">{drill.instructions}</p>
                        </div>
                        <div className="rounded-xl bg-[#eaf3ff] p-3.5">
                          <p className="text-xs font-black uppercase tracking-wider text-[#1677ff]">Coaching points</p>
                          <p className="mt-1 text-[#334b65]">{drill.coachingPoints}</p>
                        </div>
                        {drill.commonMistakes ? <div className="rounded-xl bg-[#fff7e6] p-3.5"><p className="text-xs font-black uppercase tracking-wider text-[#9a6500]">Avoid</p><p className="mt-1 text-[#5d4a24]">{drill.commonMistakes}</p></div> : null}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div><p className="text-xs font-black uppercase tracking-wider text-[#718399]">Equipment</p><p className="mt-1 text-[#334b65]">{drill.equipment}</p></div>
                          <div><p className="text-xs font-black uppercase tracking-wider text-[#718399]">Success target</p><p className="mt-1 font-semibold text-[#24513b]">{drill.successTarget}</p></div>
                        </div>
                        {(drill.easierVariation || drill.harderProgression) ? <div className="grid gap-3 border-t border-[#092c59]/8 pt-4 sm:grid-cols-2">{drill.easierVariation ? <div><p className="text-xs font-black uppercase tracking-wider text-[#718399]">Make it easier</p><p className="mt-1 text-[#334b65]">{drill.easierVariation}</p></div> : null}{drill.harderProgression ? <div><p className="text-xs font-black uppercase tracking-wider text-[#718399]">Next progression</p><p className="mt-1 text-[#334b65]">{drill.harderProgression}</p></div> : null}</div> : null}
                        {drill.completionRequirement ? <div className="rounded-xl border border-[#2b9f6a]/20 bg-[#eef9f3] p-3.5"><p className="text-xs font-black uppercase tracking-wider text-[#157347]">Ready to complete when</p><p className="mt-1 text-[#24513b]">{drill.completionRequirement}</p></div> : null}
                      </div>
                    </article>
                  )) : <div className="lg:col-span-2"><Empty text="The drills for this practice are being prepared." /></div>}
                </div>
              </div>
            </div>
          ) : <Empty text="Independent practice will appear after a program is assigned." />}
        </Panel>

        <Panel className="lg:col-span-12" title="Coach feedback" icon={MessageSquareText}>
          {latestFeedback ? <blockquote className="rounded-2xl bg-[#eaf3ff] p-5 text-lg font-semibold leading-8">“{latestFeedback}”</blockquote> : <Empty text="Feedback will appear after your coach completes a session review." />}
        </Panel>

        <Panel className="lg:col-span-6" title="Progress by development area" subtitle="Separate categories show what is really changing" icon={Trophy}>
          <div className="grid gap-5 sm:grid-cols-2">{categoryProgress.map((category) => <ProgressBar key={category.label} label={category.label} value={category.value} />)}</div>
        </Panel>

        <Panel className="lg:col-span-6" title="Skills in development" subtitle={`${developingSkills.length} ${developingSkills.length === 1 ? 'skill' : 'skills'} in this program`} icon={Target}>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{developingSkills.length ? developingSkills.map((item) => <div key={item.id}><ProgressBar label={relationName(item.skill as Skill)} value={item.progress} trailing={stageLabels[displayedStage(item.progress, item.stage)]} />{item.coachFeedback ? <p className="mt-2 whitespace-pre-line rounded-xl bg-[#f3f7fc] p-3 text-xs leading-5 text-[#607286]">{item.coachFeedback}</p> : null}</div>) : <div className="sm:col-span-2"><Empty text="Skills from your current program lessons will appear here automatically." /></div>}</div>
          <div className="mt-6 border-t border-[#092c59]/10 pt-5"><p className="mb-3 flex items-center gap-2 text-sm font-black"><CheckCircle2 className="h-4 w-4 text-[#1677ff]" /> Skills completed</p><div className="flex flex-wrap gap-2">{completedSkills.length ? completedSkills.map((item) => <span key={item.id} className="rounded-full bg-[#eaf3ff] px-3 py-2 text-xs font-bold">{relationName(item.skill as Skill)}</span>) : <span className="text-sm text-[#718399]">Completed skills will appear here.</span>}</div></div>
        </Panel>

        <Panel className="lg:col-span-6" title="Upcoming assessment or tournament" icon={Trophy}>
          <div className="space-y-3">{events.docs.length ? events.docs.map((event) => <div key={event.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f3f7fc] p-4"><div><p className="font-black">{event.title}</p><p className="mt-1 text-sm text-[#718399]">{event.eventType} · {event.location || 'Location TBC'}</p></div><time className="text-right text-sm font-bold text-[#1677ff]">{formatDate(event.startsAt, false)}</time></div>) : <Empty text="No upcoming assessment or tournament." />}</div>
        </Panel>

        <Panel className="lg:col-span-6" title="Training videos" subtitle="Demonstrations from your current lesson and assigned drills" icon={PlayCircle}>
          <div className="space-y-3">{videos.length ? videos.map((video) => <a key={`${video.title}-${video.url}`} href={video.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[#092c59]/10 p-4 transition hover:bg-[#eaf3ff]"><span><strong className="block">{video.title}</strong><span className="text-xs uppercase text-[#718399]">{video.level}</span></span><PlayCircle className="h-6 w-6 text-[#1677ff]" /></a>) : <Empty text="Training videos will appear when a coach adds them to your drills." />}</div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
