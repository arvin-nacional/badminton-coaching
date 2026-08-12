import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { CoachSessionPlan } from '@/components/Dashboard/CoachSessionPlan'
import { CompleteSession } from '@/components/Dashboard/CompleteSession'
import {
  DashboardShell,
  Empty,
  formatDate,
  Panel,
  ProgressBar,
  relationName,
  Stat,
} from '@/components/Dashboard/UI'
import { SessionSkillScoring, type SkillScoreRow } from '@/components/Dashboard/SessionSkillScoring'
import { StartAssessmentButton } from '@/components/Dashboard/StartAssessmentButton'
import type { Drill, Skill, TrainingSession } from '@/payload-types'
import { isAdmin, isCoach, requireDashboardUser } from '@/utilities/dashboardAuth'

const statusTone: Record<string, string> = {
  planned: 'bg-[#eaf3ff] text-[#1677ff]',
  scheduled: 'bg-[#e9f8ef] text-[#24734b]',
  completed: 'bg-[#092c59] text-white',
  cancelled: 'bg-[#f3f7fc] text-[#718399]',
  missed: 'bg-[#fff0ee] text-[#b42318]',
}

const formatPracticeTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return hours
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default async function CoachStudentWorkspace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { payload, user } = await requireDashboardUser()
  if (!isCoach(user)) redirect('/dashboard/student')

  const profileResult = await payload.find({
    collection: 'student-profiles',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    user,
    where: {
      and: [{ id: { equals: id } }, ...(!isAdmin(user) ? [{ coach: { equals: user.id } }] : [])],
    },
  })
  const profile = profileResult.docs[0]
  if (!profile) notFound()

  const [sessions, practices, progress, sessionScores] = await Promise.all([
    payload.find({
      collection: 'training-sessions',
      depth: 2,
      limit: 200,
      sort: 'lessonWeek',
      overrideAccess: false,
      user,
      where: { student: { equals: profile.id } },
    }),
    payload.find({
      collection: 'independent-practices',
      depth: 2,
      limit: 100,
      sort: 'lessonWeek',
      overrideAccess: false,
      user,
      where: { student: { equals: profile.id } },
    }),
    payload.find({
      collection: 'skill-progress',
      depth: 2,
      limit: 100,
      sort: '-updatedAt',
      overrideAccess: false,
      user,
      where: { student: { equals: profile.id } },
    }),
    payload.find({
      collection: 'session-skill-scores',
      depth: 2,
      limit: 500,
      sort: 'createdAt',
      overrideAccess: false,
      user,
      where: { student: { equals: profile.id } },
    }),
  ])
  const programSessions = sessions.docs.filter((session) => session.source === 'program')
  const currentSession =
    programSessions.find(
      (session) =>
        session.lessonWeek === profile.currentProgramWeek && session.status !== 'cancelled',
    ) ||
    programSessions.find(
      (session) =>
        (session.lessonWeek || 0) > profile.currentProgramWeek && session.status !== 'cancelled',
    )
  const currentPractice = practices.docs.find(
    (practice) => practice.lessonWeek === profile.currentProgramWeek,
  )
  const attentionSkills = progress.docs
    .filter((item) => item.progress < 60 || item.stage === 'learning')
    .slice(0, 6)
  const completedSessions = programSessions.filter(
    (session) => session.status === 'completed',
  ).length
  const scheduledSessions = programSessions.filter(
    (session) => session.status === 'scheduled',
  ).length
  const currentDrills = [
    currentSession?.plan?.technicalDrill,
    currentSession?.plan?.progressiveDrill,
  ].filter((drill): drill is Drill => Boolean(drill) && typeof drill === 'object')
  const currentScoreRows: SkillScoreRow[] = currentSession
    ? sessionScores.docs
        .filter((score) => {
          const sessionID = typeof score.session === 'object' ? score.session.id : score.session
          return sessionID === currentSession.id && score.status !== 'not-assessed'
        })
        .map((score) => {
          const skill = typeof score.skill === 'object' ? score.skill : null
          return {
            category: skill?.category || 'skill-development',
            evidence: score.evidence,
            id: score.id,
            nextFocus: score.nextFocus,
            score: score.score,
            skillName: skill?.name || 'Skill',
            status: score.status,
          }
        })
    : []
  const phases = Array.from(
    new Set(programSessions.map((session) => session.phase || 'Program lessons')),
  )

  return (
    <DashboardShell
      eyebrow="Player coaching workspace"
      title={profile.displayName}
      description={`${relationName(profile.program)} · ${profile.currentPhase} · Week ${profile.currentProgramWeek}`}
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/coach"
            className="inline-flex items-center gap-2 rounded-full border border-[#092c59]/20 bg-white px-5 py-3 text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Coach dashboard
          </Link>
          <StartAssessmentButton studentID={profile.id} />
          <Link
            href={`/admin/collections/student-profiles/${profile.id}`}
            className="rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white"
          >
            Edit player profile
          </Link>
        </div>
      }
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel title="Current position" icon={BookOpen}>
          <Stat
            label="Program week"
            value={`${profile.currentProgramWeek}`}
            detail={profile.currentPhase}
          />
        </Panel>
        <Panel title="Program progress" icon={TrendingUp}>
          <Stat
            label="Sessions completed"
            value={`${completedSessions}/${programSessions.length}`}
            detail={`${scheduledSessions} currently scheduled`}
          />
        </Panel>
        <Panel title="Package balance" icon={ClipboardList}>
          <Stat
            label="Sessions remaining"
            value={profile.sessionsRemaining}
            detail={`${profile.packageName} · ${profile.packageSessions} total`}
          />
        </Panel>
        <Panel title="Attendance" icon={UserRound}>
          <Stat
            label="Current cycle"
            value={`${profile.attendanceRate}%`}
            detail={`Last training: ${formatDate(profile.lastTrainingAt, false)}`}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel
          tone="dark"
          className="lg:col-span-12"
          title="Current lesson"
          subtitle={
            currentSession
              ? `${currentSession.phase} · Week ${currentSession.lessonWeek}`
              : 'No lesson is prepared'
          }
          icon={Target}
        >
          {currentSession ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${currentSession.status === 'scheduled' ? 'bg-[#4cc9ff] text-[#092c59]' : 'bg-white/10 text-white'}`}
                  >
                    {currentSession.status}
                  </span>
                  {currentSession.durationMinutes ? (
                    <span className="text-xs font-bold text-white/55">
                      {currentSession.durationMinutes} minutes
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-[#4cc9ff]">
                  {currentSession.title}
                </h2>
                <p className="mt-3 max-w-4xl leading-7 text-white/75">{currentSession.objective}</p>
              </div>
              <div className="flex flex-col items-start gap-3 xl:items-end">
                <div className="xl:text-right">
                  <p className="text-xs font-bold uppercase text-white/50">Session date</p>
                  <p className="mt-1 font-black">
                    {currentSession.scheduledAt
                      ? formatDate(currentSession.scheduledAt)
                      : 'Ready to schedule'}
                  </p>
                </div>
                <Link
                  href={`/admin/collections/training-sessions/${currentSession.id}`}
                  className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#092c59]"
                >
                  Schedule or edit session
                </Link>
              </div>
            </div>
          ) : (
            <Empty text="Assign a program and coach to create this player's lesson plans." />
          )}
        </Panel>

        {currentSession ? (
          <Panel
            className="lg:col-span-12"
            title="Complete session plan"
            subtitle="The exact coaching sequence for this player"
            icon={ClipboardList}
          >
            <CoachSessionPlan session={currentSession as TrainingSession} />
          </Panel>
        ) : null}

        <Panel
          className="lg:col-span-12"
          title="Assess this lesson's skills"
          subtitle="One observation updates the student's long-term development profile"
          icon={TrendingUp}
        >
          {currentScoreRows.length ? (
            <SessionSkillScoring rows={currentScoreRows} />
          ) : (
            <Empty text="Skill scoring records are being prepared from the lesson drills." />
          )}
        </Panel>

        {currentSession && currentSession.status !== 'completed' ? (
          <div className="lg:col-span-12">
            <CompleteSession
              sessionID={currentSession.id}
              assessedSkills={currentScoreRows.filter((score) => score.status === 'scored').length}
              totalSkills={currentScoreRows.length}
              sessionsRemaining={profile.sessionsRemaining}
            />
          </div>
        ) : null}

        <Panel
          className="lg:col-span-7"
          title="Current drills"
          subtitle="Technical and progressive work for this lesson"
          icon={Target}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {currentDrills.length ? (
              currentDrills.map((drill) => (
                <div key={drill.id} className="rounded-2xl border border-[#092c59]/10 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black">{drill.name}</h3>
                    <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-black uppercase text-[#1677ff]">
                      {drill.difficulty}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#607286]">{drill.instructions}</p>
                  <div className="mt-4 rounded-xl bg-[#f3f7fc] p-3 text-xs leading-5">
                    <strong>Coach for:</strong> {drill.coachingPoints}
                  </div>
                  <p className="mt-3 text-xs font-bold text-[#1677ff]">
                    Target: {drill.successTarget}
                  </p>
                </div>
              ))
            ) : (
              <div className="md:col-span-2">
                <Empty text="No drills are attached to the current lesson." />
              </div>
            )}
          </div>
        </Panel>

        <Panel
          className="lg:col-span-5"
          title="Independent practice"
          subtitle={`Week ${profile.currentProgramWeek} follow-through`}
          icon={CheckCircle2}
        >
          {currentPractice ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black">{currentPractice.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${currentPractice.status === 'completed' ? 'bg-[#e9f8ef] text-[#24734b]' : 'bg-[#eaf3ff] text-[#1677ff]'}`}
                >
                  {currentPractice.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#607286]">
                {currentPractice.instructions}
              </p>
              <div className="mt-5 rounded-2xl bg-[#f3f7fc] p-4">
                <p className="text-xs font-black uppercase tracking-wider text-[#718399]">
                  Completion target
                </p>
                <p className="mt-2 text-sm leading-6">{currentPractice.successCriteria}</p>
              </div>
              <div className="mt-4 rounded-2xl border border-[#1677ff]/15 bg-[#eaf3ff] p-4">
                <p className="text-xs font-black uppercase tracking-wider text-[#1677ff]">
                  Recorded workout evidence
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white p-3 text-center">
                    <p className="font-mono text-lg font-black tabular-nums text-[#092c59]">
                      {formatPracticeTime(currentPractice.elapsedSeconds)}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase text-[#718399]">Time</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center">
                    <p className="text-lg font-black text-[#092c59]">
                      {currentPractice.exerciseLogs?.length || 0}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase text-[#718399]">Logs</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center">
                    <p className="text-lg font-black text-[#092c59]">
                      {
                        new Set((currentPractice.exerciseLogs || []).map((log) => log.drillIndex))
                          .size
                      }
                      /{currentPractice.drills.length}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase text-[#718399]">Drills</p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold leading-5 text-[#4f647b]">
                  Timer status:{' '}
                  <span className="font-black capitalize">{currentPractice.timerStatus}</span>.
                  Review unusually short times or missing logs with the student.
                </p>
              </div>
              {currentPractice.coachFeedback ? (
                <p className="mt-4 text-sm leading-6">
                  <strong>Coach feedback:</strong> {currentPractice.coachFeedback}
                </p>
              ) : null}
            </div>
          ) : (
            <Empty text="No independent practice exists for the current week." />
          )}
        </Panel>

        <Panel
          className="lg:col-span-12"
          title="Full program roadmap"
          subtitle="Every generated lesson, grouped by program phase"
          icon={CalendarDays}
        >
          <div className="space-y-7">
            {phases.map((phase) => {
              const phaseSessions = programSessions.filter(
                (session) => (session.phase || 'Program lessons') === phase,
              )
              return (
                <section key={phase}>
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <h3 className="text-lg font-black">{phase}</h3>
                      <p className="mt-1 text-xs text-[#718399]">
                        {phaseSessions.length} {phaseSessions.length === 1 ? 'lesson' : 'lessons'}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {phaseSessions.map((session) => (
                      <Link
                        key={session.id}
                        href={`/admin/collections/training-sessions/${session.id}`}
                        className={`rounded-2xl border p-4 transition hover:border-[#1677ff]/40 ${session.lessonWeek === profile.currentProgramWeek ? 'border-[#1677ff]/40 bg-[#eaf3ff]' : 'border-[#092c59]/10 bg-white'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-black uppercase text-[#1677ff]">
                            Week {session.lessonWeek}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${statusTone[session.status] || statusTone.planned}`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <h4 className="mt-2 font-black">
                          {session.title.replace(/^Week \d+:\s*/, '')}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#718399]">
                          {session.objective}
                        </p>
                        <p className="mt-3 text-xs font-bold text-[#607286]">
                          {session.scheduledAt ? formatDate(session.scheduledAt) : 'Not scheduled'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
            {!programSessions.length ? (
              <Empty text="No program roadmap has been generated." />
            ) : null}
          </div>
        </Panel>

        <Panel
          className="lg:col-span-12"
          title="Skills needing attention"
          subtitle="Use these when adapting the prepared lesson"
          icon={TrendingUp}
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {attentionSkills.length ? (
              attentionSkills.map((item) => (
                <ProgressBar
                  key={item.id}
                  label={relationName(item.skill as Skill)}
                  value={item.progress}
                  trailing={item.stage}
                />
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <Empty text="No skills are currently below the attention threshold." />
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
