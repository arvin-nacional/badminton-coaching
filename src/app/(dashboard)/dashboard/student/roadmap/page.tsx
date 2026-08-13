import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Flag, MapPinned, Target } from 'lucide-react'
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

  const currentWeek = Math.min(Math.max(profile.currentProgramWeek || 1, 1), program.durationWeeks)
  const phases = program.phases.slice().sort((a, b) => a.order - b.order)
  const lessons = phases.flatMap((phase) => phase.lessons).sort((a, b) => a.week - b.week)
  const lessonOrder = new Map(lessons.map((lesson, index) => [lesson.week, index]))
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

        <div className="lg:col-span-12">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">
                <MapPinned className="h-4 w-4" /> Full program
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#092c59]">
                Your journey
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-bold text-[#607286]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2b9f6a]" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1677ff]" /> You are here
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c7d4e3]" /> Ahead
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#092c59]/10 bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_48%,#f8fbff_100%)] p-4 shadow-[0_24px_70px_-50px_rgba(9,44,89,.5)] sm:p-8">
            <div
              aria-hidden="true"
              className="absolute -right-24 top-24 h-64 w-64 rounded-full bg-[#4cc9ff]/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -left-28 bottom-36 h-72 w-72 rounded-full bg-[#1677ff]/10 blur-3xl"
            />
            <div className="absolute bottom-24 left-6 top-28 w-1 overflow-hidden rounded-full bg-[#d6e2ef] md:left-1/2 md:-translate-x-1/2">
              <div
                className="w-full rounded-full bg-[linear-gradient(180deg,#2b9f6a_0%,#1677ff_100%)] transition-all"
                style={{ height: `${currentPosition}%` }}
              />
            </div>

            <div className="relative z-10 space-y-14">
              {phases.map((phase, phaseIndex) => {
                const isCurrentPhase =
                  currentWeek >= phase.startWeek && currentWeek <= phase.endWeek
                const isCompletedPhase = currentWeek > phase.endWeek

                return (
                  <section key={phase.id || `${phase.order}-${phase.name}`}>
                    <div
                      className={`relative mx-auto max-w-xl rounded-[1.75rem] border bg-white/95 p-5 text-center shadow-[0_16px_45px_-32px_rgba(9,44,89,.6)] backdrop-blur sm:p-6 ${
                        isCurrentPhase
                          ? 'border-[#1677ff]/40 ring-4 ring-[#1677ff]/10'
                          : isCompletedPhase
                            ? 'border-[#2b9f6a]/25'
                            : 'border-[#092c59]/10'
                      }`}
                    >
                      <div
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isCurrentPhase
                            ? 'bg-[#1677ff] text-white'
                            : isCompletedPhase
                              ? 'bg-[#e1f5e9] text-[#24734b]'
                              : 'bg-[#eaf3ff] text-[#1677ff]'
                        }`}
                      >
                        {isCurrentPhase ? (
                          <Target className="h-6 w-6" />
                        ) : isCompletedPhase ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <BookOpen className="h-6 w-6" />
                        )}
                      </div>
                      <p className="mt-3 text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">
                        Phase {phaseIndex + 1} · Weeks {phase.startWeek}–{phase.endWeek}
                      </p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-[#092c59]">
                        {phase.name}
                      </h3>
                      {phase.description ? (
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#607286]">
                          {phase.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-7 space-y-6">
                      {phase.lessons
                        .slice()
                        .sort((a, b) => a.week - b.week)
                        .map((lesson) => {
                          const isCompleted = lesson.week < currentWeek
                          const isCurrent = lesson.week === currentWeek
                          const order = lessonOrder.get(lesson.week) || 0
                          const sitsRight = order % 2 === 1

                          return (
                            <div
                              key={lesson.id || `${phase.order}-${lesson.week}`}
                              className="relative"
                            >
                              <div
                                aria-hidden="true"
                                className={`absolute top-[2.625rem] hidden h-0.5 w-12 md:block ${
                                  sitsRight ? 'left-1/2' : 'right-1/2'
                                } ${
                                  isCurrent
                                    ? 'bg-[#1677ff]'
                                    : isCompleted
                                      ? 'bg-[#2b9f6a]'
                                      : 'bg-[#c7d4e3]'
                                }`}
                              />
                              <div
                                className={`absolute left-2 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#edf5ff] text-xs font-black shadow-sm md:left-1/2 md:-translate-x-1/2 ${
                                  isCurrent
                                    ? 'bg-[#1677ff] text-white ring-4 ring-[#1677ff]/15'
                                    : isCompleted
                                      ? 'bg-[#2b9f6a] text-white'
                                      : 'bg-white text-[#718399]'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : isCurrent ? (
                                  <Target className="h-4 w-4" />
                                ) : (
                                  lesson.week
                                )}
                              </div>

                              <article
                                className={`ml-12 rounded-2xl border p-5 shadow-[0_14px_35px_-30px_rgba(9,44,89,.65)] md:ml-0 md:w-[calc(50%-3rem)] ${
                                  sitsRight ? 'md:ml-auto' : 'md:mr-auto'
                                } ${
                                  isCurrent
                                    ? 'border-[#1677ff] bg-[#092c59] text-white shadow-[0_20px_45px_-25px_rgba(22,119,255,.75)]'
                                    : isCompleted
                                      ? 'border-[#2b9f6a]/20 bg-white'
                                      : 'border-[#092c59]/10 bg-white/90'
                                }`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p
                                      className={`text-xs font-black uppercase tracking-[.12em] ${
                                        isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
                                      }`}
                                    >
                                      {isCurrent ? 'You are here · ' : ''}Week {lesson.week}
                                    </p>
                                    <h4
                                      className={`mt-1 text-lg font-black ${
                                        isCurrent ? 'text-white' : 'text-[#092c59]'
                                      }`}
                                    >
                                      {lesson.title}
                                    </h4>
                                  </div>
                                  <span
                                    className={`flex items-center gap-1.5 text-xs font-bold ${
                                      isCurrent ? 'text-white/60' : 'text-[#718399]'
                                    }`}
                                  >
                                    <Clock3
                                      className={`h-4 w-4 ${
                                        isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
                                      }`}
                                    />
                                    {lesson.durationMinutes} min
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                                      isCurrent
                                        ? 'bg-white/10 text-white/75'
                                        : 'bg-[#f3f7fc] text-[#607286]'
                                    }`}
                                  >
                                    {lesson.lessonType.replace('-', ' ')}
                                  </span>
                                  {isCompleted ? (
                                    <span className="rounded-full bg-[#e1f5e9] px-3 py-1 text-[10px] font-black uppercase text-[#24734b]">
                                      Completed
                                    </span>
                                  ) : null}
                                </div>
                                <p
                                  className={`mt-3 text-sm leading-6 ${
                                    isCurrent ? 'text-white/70' : 'text-[#607286]'
                                  }`}
                                >
                                  {lesson.objective}
                                </p>
                                {isCurrent ? (
                                  <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm leading-6 text-white/80">
                                    <strong className="text-[#4cc9ff]">Success target:</strong>{' '}
                                    {lesson.successCriteria}
                                  </div>
                                ) : null}
                              </article>
                            </div>
                          )
                        })}
                    </div>
                  </section>
                )
              })}

              <div className="relative mx-auto flex max-w-sm items-center gap-4 rounded-[1.5rem] border border-[#092c59]/10 bg-white p-5 shadow-[0_16px_45px_-32px_rgba(9,44,89,.6)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#092c59] text-[#4cc9ff]">
                  <Flag className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">
                    Finish line
                  </p>
                  <p className="mt-1 font-black text-[#092c59]">Complete your program journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
