import type { ReactNode } from 'react'

import type { Drill, TrainingSession } from '@/payload-types'

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-[#092c59]/10 bg-white p-4"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf3ff] text-[10px] font-black text-[#1677ff]">{number}</span><p className="text-xs font-black uppercase tracking-wider text-[#607286]">{title}</p></div><div className="mt-3 text-sm leading-6 text-[#334b65]">{children}</div></div>
}

function DrillDetail({ drill }: { drill: string | Drill | null | undefined }) {
  if (!drill || typeof drill === 'string') return <p>Drill details are being prepared.</p>
  return <><p className="font-black text-[#092c59]">{drill.name}</p><p className="mt-1">{drill.instructions}</p><p className="mt-2 text-xs"><strong>Coach for:</strong> {drill.coachingPoints}</p><p className="mt-2 text-xs font-bold text-[#1677ff]">Target: {drill.successTarget}</p></>
}

export function CoachSessionPlan({ session }: { session: TrainingSession }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Step number="01" title="Warm-up"><p>{session.plan?.warmUp || 'Add the warm-up plan.'}</p></Step>
      <Step number="02" title="Movement preparation"><p>{session.plan?.movementPreparation || 'Add the movement preparation.'}</p></Step>
      <Step number="03" title="Technical drill"><DrillDetail drill={session.plan?.technicalDrill} /></Step>
      <Step number="04" title="Progressive drill"><DrillDetail drill={session.plan?.progressiveDrill} /></Step>
      <Step number="05" title="Conditioned game"><p>{session.plan?.conditionedGame || 'Add the conditioned game.'}</p></Step>
      <Step number="06" title="Match play"><p>{session.plan?.matchPlay || 'Add the match-play conditions.'}</p></Step>
      <Step number="07" title="Cooldown and feedback"><p>{session.plan?.cooldownAndFeedback || 'Add the cooldown and feedback prompts.'}</p></Step>
      <div className="rounded-2xl bg-[#092c59] p-4 text-white"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">✓</span><p className="text-xs font-black uppercase tracking-wider text-white/65">Success criteria</p></div><p className="mt-3 text-sm font-semibold leading-6">{session.successCriteria || 'Add a measurable success standard.'}</p></div>
    </div>
  )
}
