import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Target } from 'lucide-react'
import Link from 'next/link'

import { DashboardShell, Empty, Panel } from '@/components/Dashboard/UI'
import { requireDashboardUser } from '@/utilities/dashboardAuth'

const dashboardLink = (
  <Link
    href="/dashboard/student"
    className="inline-flex items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1677ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
  >
    <ArrowLeft className="h-4 w-4" /> Dashboard
  </Link>
)

export default async function StudentRoadmapPage() {
  const { payload, user } = await requireDashboardUser()
  const profileResult = await payload.find({
    collection: 'student-profiles',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user,
    where: { user: { equals: user.id } },
  })
  const profile = profileResult.docs[0]

  if (!profile) {
    return (
      <DashboardShell
        eyebrow="Student roadmap"
        title="Your roadmap"
        description="Your program journey will appear after your player profile is ready."
        actions={dashboardLink}
      >
        <Panel title="Roadmap unavailable" icon={BookOpen}>
          <Empty text="Ask your coach to finish setting up your player profile." />
        </Panel>
      </DashboardShell>
    )
  }

  const programID = typeof profile.program === 'string' ? profile.program : profile.program?.id
  const program = programID
    ? await payload.findByID({
        collection: 'programs',
        id: programID,
        depth: 1,
        overrideAccess: false,
        user,
      })
    : null

  if (!program) {
    return (
      <DashboardShell
        eyebrow="Student roadmap"
        title="Your roadmap"
        description="Your program journey will appear here once your coach assigns it."
        actions={dashboardLink}
      >
        <Panel title="No program assigned" icon={BookOpen}>
          <Empty text="Your coach has not assigned a training program yet." />
        </Panel>
      </DashboardShell>
    )
  }

  const currentWeek = Math.min(
    Math.max(profile.currentProgramWeek || 1, 1),
    program.durationWeeks,
  )
  const phases = program.phases.slice().sort((a, b) => a.order - b.order)
  const lessons = phases.flatMap((phase) => phase.lessons).sort((a, b) => a.week - b.week)
  const currentPhase =
    phases.find((phase) => currentWeek >= phase.startWeek && currentWeek <= phase.endWeek) ||
    phases[0]
  const completedLessons = lessons.filter((lesson) => lesson.week < currentWeek).length
  const currentPosition = Math.round((currentWeek / program.durationWeeks) * 100)

  return (
    <DashboardShell
      eyebrow="Student roadmap"
      title={program.name}
      description={program.description}
      actions={dashboardLink}
    >
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel
          tone="dark"
          className="lg:col-span-5"
          title="Current position"
          subtitle={`Week ${currentWeek} of ${program.durationWeeks}`}
          icon={Target}
        >
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#4cc9ff]">
            Current phase
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
            {currentPhase?.name || profile.currentPhase}
          </h2>
          {currentPhase?.description ? (
            <p className="mt-3 leading-7 text-white/70">{currentPhase.description}</p>
          ) : null}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/65">
              <span>Program position</span>
              <span>{currentPosition}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#4cc9ff]"
                style={{ width: `${currentPosition}%` }}
              />
            </div>
          </div>
        </Panel>

        <Panel
          className="lg:col-span-7"
          title="Program overview"
          subtitle={`${program.level} · ${program.durationWeeks} weeks`}
          icon={BookOpen}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f3f7fc] p-4">
              <p className="text-xs font-bold text-[#718399]">Phases</p>
              <p className="mt-2 text-2xl font-black text-[#092c59]">{phases.length}</p>
            </div>
            <div className="rounded-2xl bg-[#f3f7fc] p-4">
              <p className="text-xs font-bold text-[#718399]">Lessons</p>
              <p className="mt-2 text-2xl font-black text-[#092c59]">{lessons.length}</p>
            </div>
            <div className="rounded-2xl bg-[#eaf3ff] p-4">
              <p className="text-xs font-bold text-[#1677ff]">Completed</p>
              <p className="mt-2 text-2xl font-black text-[#092c59]">{completedLessons}</p>
            </div>
          </div>
        </Panel>

        <div className="space-y-5 lg:col-span-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">
              Full program
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#092c59]">
              Your journey
            </h2>
          </div>

          {phases.map((phase, phaseIndex) => {
            const isCurrentPhase = currentWeek >= phase.startWeek && currentWeek <= phase.endWeek
            const isCompletedPhase = currentWeek > phase.endWeek

            return (
              <Panel
                key={phase.id || `${phase.order}-${phase.name}`}
                title={`Phase ${phaseIndex + 1}: ${phase.name}`}
                subtitle={`Weeks ${phase.startWeek}–${phase.endWeek}`}
                icon={isCurrentPhase ? Target : isCompletedPhase ? CheckCircle2 : BookOpen}
                className={isCurrentPhase ? 'border-[#1677ff]/35' : ''}
              >
                {phase.description ? (
                  <p className="mb-5 max-w-4xl text-sm leading-6 text-[#607286]">
                    {phase.description}
                  </p>
                ) : null}
                <div className="grid gap-3">
                  {phase.lessons
                    .slice()
                    .sort((a, b) => a.week - b.week)
                    .map((lesson) => {
                      const isCompleted = lesson.week < currentWeek
                      const isCurrent = lesson.week === currentWeek

                      return (
                        <article
                          key={lesson.id || `${phase.order}-${lesson.week}`}
                          className={`grid gap-4 rounded-2xl border p-4 sm:grid-cols-[44px_minmax(0,1fr)] sm:p-5 ${
                            isCurrent
                              ? 'border-[#1677ff]/30 bg-[#eaf3ff]'
                              : isCompleted
                                ? 'border-[#2b9f6a]/15 bg-[#f2fbf6]'
                                : 'border-[#092c59]/10 bg-white'
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full font-black ${
                              isCurrent
                                ? 'bg-[#1677ff] text-white'
                                : isCompleted
                                  ? 'bg-[#e1f5e9] text-[#24734b]'
                                  : 'bg-[#f3f7fc] text-[#607286]'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : isCurrent ? (
                              <Target className="h-5 w-5" />
                            ) : (
                              lesson.week
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[.12em] text-[#1677ff]">
                                  Week {lesson.week} · {lesson.lessonType.replace('-', ' ')}
                                </p>
                                <h3 className="mt-1 text-lg font-black text-[#092c59]">
                                  {lesson.title}
                                </h3>
                              </div>
                              <span className="flex items-center gap-1.5 text-xs font-bold text-[#718399]">
                                <Clock3 className="h-4 w-4 text-[#1677ff]" />
                                {lesson.durationMinutes} min
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#607286]">
                              {lesson.objective}
                            </p>
                            {isCurrent ? (
                              <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-[#213b58]">
                                <strong className="text-[#092c59]">Success target:</strong>{' '}
                                {lesson.successCriteria}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      )
                    })}
                </div>
              </Panel>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
