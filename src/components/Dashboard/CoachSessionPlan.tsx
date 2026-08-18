import type { ReactNode } from 'react'

import type { Drill, Skill, TrainingSession } from '@/payload-types'
import { buildSessionTiming, stripSessionTimePrefix } from '@/utilities/sessionTiming'

function Step({
  number,
  title,
  minutes,
  children,
}: {
  number: string
  title: string
  minutes: number
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#092c59]/10 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf3ff] text-[10px] font-black text-[#1677ff]">
          {number}
        </span>
        <p className="text-xs font-black uppercase tracking-wider text-[#607286]">
          {title} · {minutes} min
        </p>
      </div>
      <div className="mt-3 text-sm leading-6 text-[#334b65]">{children}</div>
    </div>
  )
}

function DrillDetail({ drill }: { drill: string | Drill | null | undefined }) {
  if (!drill || typeof drill === 'string') return <p>Drill details are being prepared.</p>
  const skill = typeof drill.skill === 'object' ? drill.skill : null
  return (
    <>
      <p className="font-black text-[#092c59]">{drill.name}</p>
      {skill ? (
        <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#1677ff]">
          Develops: {skill.name}
        </p>
      ) : null}
      <p className="mt-2">{drill.instructions}</p>
      <p className="mt-2 text-xs">
        <strong>Coach for:</strong> {drill.coachingPoints}
      </p>
      <p className="mt-2 text-xs font-bold text-[#1677ff]">Target: {drill.successTarget}</p>
    </>
  )
}

export function CoachSessionPlan({ session }: { session: TrainingSession }) {
  const skills = (session.skills || []).filter((skill): skill is Skill => typeof skill === 'object')
  const technicalDrill = session.plan?.technicalDrill
  const progressiveDrill = session.plan?.progressiveDrill
  const allAdditionalDrills = session.plan?.additionalDrills || []
  const drillCount = 2 + allAdditionalDrills.length
  const timing = buildSessionTiming(session.durationMinutes, drillCount)
  let drillTimingIndex = 0
  const nextDrillMinutes = () => timing.drillMinutes[drillTimingIndex++] || 0

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-[#1677ff]/20 bg-[#eaf3ff] p-5 md:col-span-2 xl:col-span-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#1677ff]">
              Skills developed and scored
            </p>
            <p className="mt-1 text-sm leading-6 text-[#526b85]">
              Use every activity below to gather evidence for these lesson outcomes. This plan is
              balanced to exactly {timing.durationMinutes} minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.length ? (
              skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#092c59] shadow-sm"
                >
                  {skill.name}
                </span>
              ))
            ) : (
              <span className="text-sm font-bold text-[#607286]">No lesson skills selected.</span>
            )}
          </div>
        </div>
      </div>
      <Step number="01" title="Warm-up" minutes={timing.warmUp}>
        <p>{stripSessionTimePrefix(session.plan?.warmUp || 'Add the warm-up plan.')}</p>
      </Step>
      <Step number="02" title="Movement preparation" minutes={timing.movementPreparation}>
        <p>
          {stripSessionTimePrefix(
            session.plan?.movementPreparation || 'Add the movement preparation.',
          )}
        </p>
      </Step>
      <Step number="03" title="Technical drill" minutes={nextDrillMinutes()}>
        <DrillDetail drill={technicalDrill} />
      </Step>
      <Step number="04" title="Progressive drill" minutes={nextDrillMinutes()}>
        <DrillDetail drill={progressiveDrill} />
      </Step>
      {allAdditionalDrills.map((drill, index) => (
        <Step
          key={typeof drill === 'string' ? drill : drill.id}
          number={`04.${index + 1}`}
          title="Additional lesson drill"
          minutes={nextDrillMinutes()}
        >
          <DrillDetail drill={drill} />
        </Step>
      ))}
      <Step number="05" title="Conditioned game" minutes={timing.conditionedGame}>
        <p>
          {stripSessionTimePrefix(session.plan?.conditionedGame || 'Add the conditioned game.')}
        </p>
      </Step>
      <Step number="06" title="Match play" minutes={timing.matchPlay}>
        <p>{stripSessionTimePrefix(session.plan?.matchPlay || 'Add the match-play conditions.')}</p>
      </Step>
      <Step number="07" title="Cooldown and feedback" minutes={timing.cooldownAndFeedback}>
        <p>
          {stripSessionTimePrefix(
            session.plan?.cooldownAndFeedback || 'Add the cooldown and feedback prompts.',
          )}
        </p>
      </Step>
      <div className="rounded-2xl bg-[#092c59] p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">
            ✓
          </span>
          <p className="text-xs font-black uppercase tracking-wider text-white/65">
            Success criteria
          </p>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6">
          {session.successCriteria || 'Add a measurable success standard.'}
        </p>
      </div>
    </div>
  )
}
