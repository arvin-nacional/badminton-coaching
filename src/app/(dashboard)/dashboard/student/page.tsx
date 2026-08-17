import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  PlayCircle,
  Target,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  DashboardShell,
  Empty,
  formatDate,
  Panel,
  ProgressBar,
  relationName,
} from '@/components/Dashboard/UI'
import { IndependentPracticeCheck } from '@/components/Dashboard/IndependentPracticeCheck'
import { IndependentPracticeDrills } from '@/components/Dashboard/IndependentPracticeDrills'
import type { PracticeLibrary, Skill } from '@/payload-types'
import { isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

const stageLabels = {
  'not-introduced': 'Not introduced',
  learning: 'Learning',
  controlled: 'Controlled',
  'game-ready': 'Game ready',
  'pressure-ready': 'Pressure ready',
}

const displayedStage = (
  progress: number,
  stage: keyof typeof stageLabels,
): keyof typeof stageLabels => (progress <= 0 ? 'not-introduced' : stage)

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
  // depth 0: only scalar fields and the program ID are used from the profile.
  const profileResult = await payload.find({
    collection: 'student-profiles',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user,
    where: { user: { equals: user.id } },
  })
  const profile = profileResult.docs[0]

  // Guide students through onboarding before showing the full dashboard.
  if (profile && !profile.onboardingCompletedAt) redirect('/onboarding')

  if (!profile) {
    return (
      <DashboardShell
        eyebrow="Student dashboard"
        title={`Welcome${user.name ? `, ${user.name}` : ''}`}
        description="Your account is ready, but a coach has not created your player profile yet."
      >
        <Panel title="Profile setup required" icon={ClipboardList}>
          <p className="text-[#607286]">
            Ask your coach to create a Student Profile and connect it to {user.email}. Your program,
            sessions, drills, and progress will appear here automatically.
          </p>
          {isCoach(user) && (
            <Link
              className="mt-5 inline-flex rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white"
              href="/admin/collections/student-profiles/create"
            >
              Create profile
            </Link>
          )}
        </Panel>
      </DashboardShell>
    )
  }

  const now = new Date().toISOString()
  const programID = typeof profile.program === 'string' ? profile.program : profile.program?.id
  // Keep depth as low as possible: every extra depth level makes Payload run
  // population queries for each relationship on each returned doc, which was
  // the main cause of slow dashboard loads.
  const [program, practices, sessions, skillProgress, events, completedSessions] =
    await Promise.all([
      programID
        ? payload.findByID({
            collection: 'programs',
            id: programID,
            // depth 1 populates phases[].lessons[].independentPractice, which
            // is the only nested relationship this page reads from the program.
            depth: 1,
            overrideAccess: false,
            user,
          })
        : Promise.resolve(null),
      payload.find({
        collection: 'independent-practices',
        // depth 1 populates the practice template; drill docs are fetched
        // separately below so drill IDs are enough here.
        depth: 1,
        limit: 100,
        sort: '-updatedAt',
        overrideAccess: false,
        user,
        where: { student: { equals: profile.id } },
      }),
      payload.find({
        collection: 'training-sessions',
        depth: 0,
        limit: 5,
        sort: 'scheduledAt',
        overrideAccess: false,
        user,
        where: {
          and: [
            { student: { equals: profile.id } },
            { scheduledAt: { greater_than_equal: now } },
            { status: { equals: 'scheduled' } },
          ],
        },
      }),
      payload.find({
        collection: 'skill-progress',
        // depth 1 populates the skill relationship used for names/categories.
        depth: 1,
        limit: 100,
        sort: '-updatedAt',
        overrideAccess: false,
        user,
        where: { student: { equals: profile.id } },
      }),
      payload.find({
        collection: 'coaching-events',
        depth: 0,
        limit: 5,
        sort: 'startsAt',
        overrideAccess: false,
        user,
        where: {
          and: [{ student: { equals: profile.id } }, { startsAt: { greater_than_equal: now } }],
        },
      }),
      payload.find({
        collection: 'training-sessions',
        depth: 0,
        limit: 1,
        sort: '-scheduledAt',
        overrideAccess: false,
        user,
        where: { and: [{ student: { equals: profile.id } }, { status: { equals: 'completed' } }] },
      }),
    ])

  const programWeek = program
    ? Math.min(Math.max(profile.currentProgramWeek || 1, 1), program.durationWeeks)
    : 1
  const phases = program?.phases?.slice().sort((a, b) => a.order - b.order) || []
  const currentPhase =
    phases.find((phase) => programWeek >= phase.startWeek && programWeek <= phase.endWeek) ||
    phases[0]
  const programLessons = phases
    .flatMap((phase) => phase.lessons || [])
    .sort((a, b) => a.week - b.week)
  const currentLesson =
    programLessons.find((programLesson) => programLesson.week === programWeek) || programLessons[0]
  const lessonPractice =
    currentLesson && typeof currentLesson.independentPractice === 'object'
      ? (currentLesson.independentPractice as PracticeLibrary)
      : null
  const currentPractice = practices.docs.find((practice) => {
    const practiceProgramID =
      typeof practice.program === 'string' ? practice.program : practice.program.id
    return practiceProgramID === programID && practice.lessonWeek === programWeek
  })
  const canCompleteCurrentPractice = Boolean(
    currentPractice &&
    (currentPractice.timerStatus === 'finished' || currentPractice.status === 'completed'),
  )
  const practiceTemplate =
    currentPractice && typeof currentPractice.practice === 'object'
      ? (currentPractice.practice as PracticeLibrary)
      : lessonPractice
  const drillReferences = practiceTemplate?.drills.length
    ? practiceTemplate.drills
    : currentPractice?.drills || []
  const drillIDs = drillReferences.map((drill) => (typeof drill === 'string' ? drill : drill.id))
  const drillResult = drillIDs.length
    ? await payload.find({
        collection: 'drills',
        // Only scalar drill fields are rendered, so no population is needed.
        depth: 0,
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
  const practiceDurationMinutes = practiceDrills.reduce(
    (total, drill) => total + drill.durationMinutes,
    0,
  )
  const upcomingLessons = programLessons
    .filter((programLesson) => programLesson.week > programWeek)
    .slice(0, 3)
  const nextSession = sessions.docs[0]
  const completedSkills = skillProgress.docs.filter((item) =>
    ['game-ready', 'pressure-ready'].includes(item.stage),
  )
  const developingSkills = skillProgress.docs.filter((item) =>
    ['not-introduced', 'learning', 'controlled'].includes(item.stage),
  )
  const latestFeedback = completedSessions.docs[0]?.studentSummary || currentPractice?.coachFeedback

  const categoryProgress = Object.entries(categoryLabels).map(([category, label]) => {
    const values = skillProgress.docs
      .filter(
        (item) => typeof item.skill === 'object' && (item.skill as Skill).category === category,
      )
      .map((item) => item.progress)
    return {
      label,
      value: values.length
        ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
        : 0,
    }
  })

  const visibleCategoryProgress = categoryProgress.filter((category) => category.value > 0)
  const priorityCategoryProgress = (
    visibleCategoryProgress.length ? visibleCategoryProgress : categoryProgress
  ).slice(0, 4)
  const prioritySkills = developingSkills.slice(0, 4)
  const videos = practiceDrills.flatMap((drill) =>
    drill.videoURL ? [{ title: drill.name, url: drill.videoURL, level: drill.level }] : [],
  )

  return (
    <DashboardShell
      eyebrow="Student dashboard"
      title={`Hi, ${profile.displayName}`}
      description="Your focus, practice, and next session—all in one place."
    >
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel
          tone="dark"
          className="lg:col-span-8"
          title="This week's focus"
          subtitle="Your coaching priority"
          icon={Target}
        >
          <p className="text-3xl font-black tracking-tight text-[#4cc9ff]">
            {currentLesson?.title || profile.weeklyFocus}
          </p>
          <p className="mt-3 max-w-3xl leading-7 text-white/75">
            {currentLesson?.objective || profile.focusExplanation}
          </p>
          {program ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/80">
                {program.name} · Week {programWeek} of {program.durationWeeks}
              </p>
              <Link
                href="/dashboard/student/roadmap"
                className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#092c59] transition hover:bg-[#4cc9ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc9ff]"
              >
                View roadmap
              </Link>
            </div>
          ) : null}
        </Panel>

        <Panel className="lg:col-span-4" title="Next session" icon={CalendarDays}>
          {nextSession ? (
            <>
              <p className="text-lg font-black text-[#092c59]">{nextSession.title}</p>
              <p className="mt-3 text-xl font-black text-[#1677ff]">
                {formatDate(nextSession.scheduledAt)}
              </p>
              <p className="mt-2 text-sm font-medium text-[#718399]">
                {nextSession.location || 'Location to be confirmed'}
              </p>
            </>
          ) : (
            <Empty text="No upcoming session scheduled." />
          )}
        </Panel>

        <Panel
          className="lg:col-span-12"
          title="Home practice"
          subtitle={
            currentPractice?.status === 'completed'
              ? 'Completed for this program week'
              : 'Complete this before your next session'
          }
          icon={ClipboardList}
        >
          {currentLesson ? (
            <div>
              <div className="flex flex-col gap-3 rounded-2xl bg-[#f6f9fd] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">
                    Week {programWeek}
                  </p>
                  <h3 className="mt-1 text-lg font-black leading-tight text-[#092c59]">
                    {currentPractice?.title || currentLesson.title}
                  </h3>
                </div>
                {practiceDrills.length ? (
                  <p className="shrink-0 text-sm font-bold text-[#607286]">
                    {practiceDrills.length} {practiceDrills.length === 1 ? 'drill' : 'drills'} ·{' '}
                    {practiceDurationMinutes} min
                  </p>
                ) : null}
              </div>

              <h3 className="mb-3 mt-5 text-base font-black text-[#092c59]">Drills</h3>
              {practiceDrills.length ? (
                <IndependentPracticeDrills
                  drills={practiceDrills}
                  practiceID={currentPractice?.id}
                  initialTimerStatus={currentPractice?.timerStatus}
                  initialTimerStartedAt={currentPractice?.timerStartedAt}
                  initialElapsedSeconds={currentPractice?.elapsedSeconds}
                  initialCurrentDrillIndex={currentPractice?.currentDrillIndex}
                  initialCurrentDrillElapsedSeconds={currentPractice?.currentDrillElapsedSeconds}
                  initialCurrentStepIndex={currentPractice?.currentStepIndex}
                  initialCurrentRound={currentPractice?.currentRound}
                  initialCurrentStepElapsedSeconds={currentPractice?.currentStepElapsedSeconds}
                  initialExerciseLogs={currentPractice?.exerciseLogs}
                  initialCompleted={currentPractice?.status === 'completed'}
                />
              ) : (
                <Empty text="The drills for this home practice are being prepared." />
              )}

              {currentPractice ? (
                canCompleteCurrentPractice ? (
                  <IndependentPracticeCheck
                    practiceID={currentPractice.id}
                    initialCompleted={currentPractice.status === 'completed'}
                  />
                ) : null
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-[#9db1c8] p-4 text-sm font-semibold text-[#718399]">
                  Your practice checklist is being prepared. Refresh after your coach saves the
                  program.
                </p>
              )}
            </div>
          ) : (
            <Empty text="Home practice will appear after a program is assigned." />
          )}
        </Panel>

        {latestFeedback ? (
          <Panel className="lg:col-span-4" title="Coach note" icon={MessageSquareText}>
            <blockquote className="rounded-2xl bg-[#eaf3ff] p-5 font-semibold leading-7 text-[#213b58]">
              “{latestFeedback}”
            </blockquote>
          </Panel>
        ) : null}

        <Panel
          className={latestFeedback ? 'lg:col-span-8' : 'lg:col-span-12'}
          title="Your development"
          subtitle={`${developingSkills.length} in progress · ${completedSkills.length} completed`}
          icon={Trophy}
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <h3 className="text-sm font-black text-[#092c59]">Development areas</h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                {priorityCategoryProgress.map((category) => (
                  <ProgressBar key={category.label} label={category.label} value={category.value} />
                ))}
              </div>
            </div>
            <div className="border-t border-[#092c59]/10 pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
              <h3 className="text-sm font-black text-[#092c59]">Current skills</h3>
              {prioritySkills.length ? (
                <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                  {prioritySkills.map((item) => (
                    <ProgressBar
                      key={item.id}
                      label={relationName(item.skill as Skill)}
                      value={item.progress}
                      trailing={stageLabels[displayedStage(item.progress, item.stage)]}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#718399]">No skills are currently in progress.</p>
              )}
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#f3f7fc] p-4 text-sm font-bold text-[#607286]">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1677ff]" />
                {completedSkills.length} {completedSkills.length === 1 ? 'skill' : 'skills'}{' '}
                completed
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          className="lg:col-span-12"
          title="Program roadmap"
          subtitle={program ? program.name : 'No program assigned'}
          icon={BookOpen}
        >
          {program && currentLesson ? (
            <div className="flex flex-col gap-4 rounded-2xl bg-[#f3f7fc] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">
                  {currentPhase?.name || profile.currentPhase} · Week {programWeek} of{' '}
                  {program.durationWeeks}
                </p>
                <h3 className="mt-2 text-lg font-black text-[#092c59]">{currentLesson.title}</h3>
                {upcomingLessons[0] ? (
                  <p className="mt-1 text-sm text-[#607286]">
                    Next: Week {upcomingLessons[0].week} · {upcomingLessons[0].title}
                  </p>
                ) : null}
              </div>
              <Link
                href="/dashboard/student/roadmap"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#092c59] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1677ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
              >
                View full roadmap
              </Link>
            </div>
          ) : (
            <Empty text="Your program roadmap will appear after a program is assigned." />
          )}
        </Panel>

        {events.docs.length ? (
          <Panel
            className={videos.length ? 'lg:col-span-6' : 'lg:col-span-12'}
            title="Upcoming events"
            icon={Trophy}
          >
            <div className="space-y-3">
              {events.docs.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-[#f3f7fc] p-4"
                >
                  <div>
                    <p className="font-black">{event.title}</p>
                    <p className="mt-1 text-sm text-[#718399]">
                      {event.eventType} · {event.location || 'Location TBC'}
                    </p>
                  </div>
                  <time className="text-right text-sm font-bold text-[#1677ff]">
                    {formatDate(event.startsAt, false)}
                  </time>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {videos.length ? (
          <Panel
            className={events.docs.length ? 'lg:col-span-6' : 'lg:col-span-12'}
            title="Training videos"
            icon={PlayCircle}
          >
            <div className="space-y-3">
              {videos.map((video) => (
                <a
                  key={`${video.title}-${video.url}`}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-[#092c59]/10 p-4 transition hover:bg-[#eaf3ff]"
                >
                  <span>
                    <strong className="block">{video.title}</strong>
                    <span className="text-xs uppercase text-[#718399]">{video.level}</span>
                  </span>
                  <PlayCircle className="h-6 w-6 text-[#1677ff]" />
                </a>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </DashboardShell>
  )
}
