import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  ClipboardCheck,
  Crosshair,
  Footprints,
  Play,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'

type Button = { label?: string | null; url?: string | null }
type Row<T> = T & { id?: string | null }

const ButtonLink = ({ button, secondary = false }: { button?: Button | null; secondary?: boolean }) => {
  if (!button?.label || !button.url) return null
  return (
    <Link
      href={button.url}
      className={secondary ? 'coach-button-secondary' : 'coach-button-primary'}
    >
      {button.label} {secondary ? <ChevronRight className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
    </Link>
  )
}

export function CoachHeroBlock(props: {
  eyebrow?: string | null
  heading?: string | null
  highlight?: string | null
  description?: string | null
  primaryButton?: Button | null
  secondaryButton?: Button | null
  benefits?: Row<{ text?: string | null }>[] | null
  dashboard?: {
    label?: string | null
    title?: string | null
    status?: string | null
    stage?: string | null
    skill?: string | null
    feedback?: string | null
    progress?: number | null
    drillLabel?: string | null
    stats?: Row<{ value?: string | null; label?: string | null }>[] | null
  } | null
}) {
  const { dashboard } = props
  return (
    <section className="coach-hero">
      <div className="court-grid absolute inset-0 opacity-40" />
      <div className="absolute -right-28 top-6 h-[520px] w-[520px] rounded-full bg-[#4cc9ff]/25 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div>
          {props.eyebrow && <div className="coach-pill"><Sparkles className="h-4 w-4" />{props.eyebrow}</div>}
          <h1 className="coach-hero-title">{props.heading} <span>{props.highlight}</span></h1>
          {props.description && <p className="coach-lead">{props.description}</p>}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><ButtonLink button={props.primaryButton} /><ButtonLink button={props.secondaryButton} secondary /></div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#50657c]">
            {props.benefits?.map((benefit, index) => <span key={benefit.id || index} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1677ff]" />{benefit.text}</span>)}
          </div>
        </div>
        {dashboard && (
          <div className="relative mx-auto w-full max-w-[530px]">
            <div className="absolute -left-10 -top-8 h-24 w-24 rounded-full border-[18px] border-[#4cc9ff] opacity-70" />
            <div className="relative rotate-2 rounded-[2.4rem] bg-[#092c59] p-3 shadow-[0_35px_70px_-25px_rgba(9,44,89,.55)]">
              <div className="rounded-[1.8rem] bg-[#f4f8fd] p-6 md:p-8">
                <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#6a7b90]">{dashboard.label}</p><h2 className="mt-2 text-2xl font-black">{dashboard.title}</h2></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4cc9ff]"><Crosshair className="h-6 w-6" /></div></div>
                <div className="mt-7 rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><span className="rounded-full bg-[#dff5ff] px-3 py-1 text-xs font-bold text-[#08648c]">{dashboard.status}</span><span className="text-sm font-bold">{dashboard.stage}</span></div>
                  <h3 className="mt-5 text-2xl font-black">{dashboard.skill}</h3><p className="mt-2 text-sm leading-6 text-[#607286]">{dashboard.feedback}</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e5edf6]"><div className="h-full rounded-full bg-[#1677ff]" style={{ width: `${dashboard.progress || 0}%` }} /></div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">{dashboard.stats?.map((stat, index) => <div key={stat.id || index} className="rounded-2xl border border-[#092c59]/5 bg-[#e7eef7] px-3 py-4 text-center"><strong className="block text-xl font-black">{stat.value}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-[#65768a]">{stat.label}</span></div>)}</div>
                <div className="mt-5 flex w-full items-center justify-between rounded-2xl bg-[#092c59] px-5 py-4 text-sm font-bold text-white"><span className="flex items-center gap-3"><Play className="h-4 w-4 fill-current" />{dashboard.drillLabel}</span><ArrowRight className="h-4 w-4" /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function DevelopmentLoopBlock({ label, steps }: { label?: string | null; steps?: Row<{ title?: string | null }>[] | null }) {
  return <section className="bg-[#092c59] px-5 py-7 text-white md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-10 gap-y-5 text-sm font-bold uppercase tracking-[.16em] md:justify-between"><span className="text-[#4cc9ff]">{label}</span>{steps?.map((step, index) => <div key={step.id || index} className="flex items-center gap-5"><span>{step.title}</span>{index < steps.length - 1 && <ArrowRight className="hidden h-4 w-4 text-[#829bb9] md:block" />}</div>)}</div></section>
}

export function ProgramsGridBlock(props: {
  anchor?: string | null
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  programs?: Row<{ number?: string | null; audience?: string | null; name?: string | null; description?: string | null; skills?: Row<{ skill?: string | null }>[] | null; linkLabel?: string | null; linkURL?: string | null; accent?: string | null }>[] | null
}) {
  return <section id={props.anchor || undefined} className="coach-section bg-[#f7faff] text-[#071f42]"><div className="mx-auto max-w-[1320px]"><div className="grid gap-8 md:grid-cols-[1fr_.8fr] md:items-end"><div><p className="coach-eyebrow">{props.eyebrow}</p><h2 className="coach-title whitespace-pre-line">{props.heading}</h2></div><p className="max-w-xl text-lg leading-8 text-[#586d84] md:justify-self-end">{props.description}</p></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{props.programs?.map((program, index) => <article key={program.id || index} className={`program-card program-${program.accent || 'sky'}`}><div className="flex items-center justify-between"><span className="text-sm font-black tracking-[.15em]">{program.number}</span><Target className="h-6 w-6" /></div><p className="mt-14 text-xs font-bold uppercase tracking-[.16em] opacity-65">{program.audience}</p><h3 className="mt-3 text-3xl font-black tracking-tight">{program.name}</h3><p className="mt-4 min-h-20 leading-7 opacity-75">{program.description}</p><div className="my-7 h-px bg-current opacity-15" /><ul className="space-y-3">{program.skills?.map((item, skillIndex) => <li key={item.id || skillIndex} className="flex items-center gap-3 text-sm font-bold"><Check className="h-4 w-4" />{item.skill}</li>)}</ul>{program.linkURL && <Link href={program.linkURL} className="mt-9 inline-flex items-center gap-2 font-black">{program.linkLabel}<ArrowRight className="h-4 w-4" /></Link>}</article>)}</div></div></section>
}

export function AssessmentStepsBlock(props: { anchor?: string | null; eyebrow?: string | null; heading?: string | null; description?: string | null; stepLabel?: string | null; button?: Button | null; steps?: Row<{ title?: string | null; description?: string | null }>[] | null }) {
  const icons = [ClipboardCheck, Footprints, Crosshair, BarChart3]
  return <section id={props.anchor || undefined} className="coach-section bg-[#eaf3ff] text-[#071f42]"><div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[.8fr_1.2fr]"><div className="lg:sticky lg:top-28 lg:self-start"><p className="coach-eyebrow">{props.eyebrow}</p><h2 className="coach-title whitespace-pre-line">{props.heading}</h2><p className="mt-7 max-w-md text-lg leading-8 text-[#586d84]">{props.description}</p><div className="mt-8"><ButtonLink button={props.button} /></div></div><div className="grid gap-4 sm:grid-cols-2">{props.steps?.map((step, index) => { const Icon = icons[index % icons.length]; return <article key={step.id || index} className={`rounded-[2rem] p-7 text-[#071f42] ${index === props.steps!.length - 1 ? 'bg-[#4cc9ff]' : 'bg-white'}`}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#092c59] text-white"><Icon className="h-6 w-6" /></div><span className="mt-10 block text-xs font-black uppercase tracking-[.16em]">{props.stepLabel} {index + 1}</span><h3 className="mt-2 text-2xl font-black">{step.title}</h3><p className="mt-3 leading-7 opacity-70">{step.description}</p></article>})}</div></div></section>
}

export function TrainingCycleBlock(props: { eyebrow?: string | null; heading?: string | null; note?: string | null; sessions?: Row<{ number?: string | null; title?: string | null; description?: string | null }>[] | null }) {
  return <section className="coach-section bg-white text-[#071f42]"><div className="mx-auto max-w-[1320px]"><div className="text-center"><p className="coach-eyebrow">{props.eyebrow}</p><h2 className="coach-title mx-auto max-w-4xl whitespace-pre-line">{props.heading}</h2></div><div className="mt-14 overflow-hidden rounded-[2rem] border border-[#092c59]/15 bg-white text-[#071f42]">{props.sessions?.map((session, index) => <div key={session.id || index} className="grid gap-2 border-b border-[#092c59]/10 p-5 last:border-0 sm:grid-cols-[70px_1fr_1.4fr_30px] sm:items-center md:px-8"><span className="font-mono text-sm font-bold text-[#718399]">{session.number}</span><h3 className="text-lg font-black">{session.title}</h3><p className="text-sm text-[#607286]">{session.description}</p>{index === props.sessions!.length - 1 ? <Trophy className="h-5 w-5 text-[#1677ff]" /> : <ChevronRight className="hidden h-4 w-4 sm:block" />}</div>)}</div>{props.note && <p className="mt-5 text-center text-sm text-[#65778d]">{props.note}</p>}</div></section>
}

export function ProgressProfileBlock(props: { eyebrow?: string | null; heading?: string | null; description?: string | null; stages?: Row<{ label?: string | null }>[] | null; profileTitle?: string | null; profileLabel?: string | null; skills?: Row<{ name?: string | null; stage?: string | null; progress?: number | null }>[] | null }) {
  return <section className="coach-section bg-[#092c59] text-white"><div className="mx-auto grid max-w-[1320px] gap-16 lg:grid-cols-2 lg:items-center"><div><p className="coach-eyebrow text-[#4cc9ff]">{props.eyebrow}</p><h2 className="coach-title whitespace-pre-line">{props.heading}</h2><p className="mt-7 max-w-lg text-lg leading-8 text-white/65">{props.description}</p><div className="mt-8 flex flex-wrap gap-3">{props.stages?.map((stage, index) => <span key={stage.id || index} className={`rounded-full border px-4 py-2 text-xs font-bold ${index === 2 ? 'border-[#4cc9ff] bg-[#4cc9ff] text-[#092c59]' : 'border-white/20 text-white/65'}`}>{stage.label}</span>)}</div></div><div className="rounded-[2rem] bg-white p-6 text-[#092c59] md:p-9"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#718399]">{props.profileLabel}</p><h3 className="mt-2 text-2xl font-black">{props.profileTitle}</h3></div><ShieldCheck className="h-8 w-8 text-[#1677ff]" /></div><div className="mt-8 space-y-6">{props.skills?.map((skill, index) => <div key={skill.id || index}><div className="mb-2 flex justify-between text-sm"><span className="font-bold">{skill.name}</span><span className="text-[#65778d]">{skill.stage}</span></div><div className="h-2.5 rounded-full bg-[#e5edf6]"><div className="h-full rounded-full bg-[#1677ff]" style={{ width: `${skill.progress || 0}%` }} /></div></div>)}</div></div></div></section>
}

export function CoachingQuoteBlock({ quote, attribution }: { quote?: string | null; attribution?: string | null }) {
  return <section className="coach-section bg-[#f7faff] text-center text-[#071f42]"><div className="mx-auto max-w-[1320px]"><Quote className="mx-auto h-10 w-10 fill-[#4cc9ff] text-[#4cc9ff]" /><blockquote className="mx-auto mt-7 max-w-4xl text-3xl font-black leading-tight tracking-tight md:text-5xl">“{quote}”</blockquote><p className="mt-6 font-bold text-[#607286]">{attribution}</p></div></section>
}

export function CoachingCTABlock({ anchor, eyebrow, heading, button }: { anchor?: string | null; eyebrow?: string | null; heading?: string | null; button?: Button | null }) {
  return <section id={anchor || undefined} className="bg-[#f7faff] px-5 pb-8 md:px-10"><div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[2.5rem] bg-[#4cc9ff] px-7 py-16 md:px-16 md:py-20"><div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[55px] border-[#092c59]/10" /><div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em]">{eyebrow}</p><h2 className="mt-4 max-w-3xl whitespace-pre-line text-4xl font-black leading-[.95] tracking-[-.05em] md:text-7xl">{heading}</h2></div><ButtonLink button={button} /></div></div></section>
}
