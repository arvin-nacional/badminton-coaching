'use client'

import { CheckCircle2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

export type AssessmentScores = Record<string, number | null | undefined>
type WorkspaceProps = {
  bookingID: string
  initial?: {
    scores?: AssessmentScores
    strengths?: string[]
    priorities?: string[]
    firstSessionFocus?: string
    independentPractice?: string
    coachSummary?: string
    completed?: boolean
  }
}

const sections = [
  {
    title: 'Movement baseline',
    duration: '10 min',
    description: 'Observe movement quality, preparation, balance, and recovery.',
    criteria: [
      ['readyPosition', 'Ready position and split step'],
      ['fourCornerMovement', 'Four-corner shadow movement'],
      ['frontCourtRecovery', 'Front-court lunge and recovery'],
      ['rearCourtRecovery', 'Rear-court movement and recovery'],
      ['balanceCoordination', 'Balance and coordination'],
    ],
  },
  {
    title: 'Technical assessment',
    duration: '25 min',
    description: 'Prioritize relevant tests. Beginners do not need every advanced variation.',
    criteria: [
      ['gripChanges', 'Grip changes · 10 alternating contacts'],
      ['lowServe', 'Low serve · 10 target attempts'],
      ['overheadClear', 'Overhead clear · 10 rear-court attempts'],
      ['dropShot', 'Drop shot · 6 attempts'],
      ['netShot', 'Net shot · 6 attempts per side'],
      ['lift', 'Lift · 6 attempts per side'],
      ['drive', 'Drive · short cooperative exchange'],
    ],
  },
  {
    title: 'Rally and tactical assessment',
    duration: '12 min',
    description: 'Use a cooperative rally followed by a conditioned game.',
    criteria: [
      ['shotConsistency', 'Shot consistency'],
      ['courtPositioning', 'Court positioning'],
      ['shotSelection', 'Shot selection'],
      ['recovery', 'Recovery'],
      ['spaceAwareness', 'Space awareness'],
      ['performanceUnderPressure', 'Performance under pressure'],
    ],
  },
] as const
const rubric = ['Not introduced', 'Learning', 'Controlled', 'Game-ready', 'Pressure-ready']

const strengthOptions = [
  'Ready position and split-step timing',
  'Balance and coordination',
  'Four-corner movement',
  'Front-court lunge and recovery',
  'Rear-court movement and recovery',
  'Efficient recovery to base',
  'Grip changes and racket readiness',
  'Low-serve accuracy',
  'Overhead clear length',
  'Drop-shot control',
  'Net-shot control',
  'Lift height and depth',
  'Drive consistency',
  'Rally consistency',
  'Court positioning',
  'Shot selection',
  'Space awareness',
  'Composure under pressure',
]

const priorityOptions = [
  'Improve ready position and split-step timing',
  'Improve balance and coordination',
  'Build four-corner movement efficiency',
  'Improve front-court lunge and recovery',
  'Improve rear-court movement and recovery',
  'Recover to base earlier',
  'Develop automatic grip changes',
  'Improve low-serve accuracy',
  'Build overhead clear length',
  'Improve drop-shot control',
  'Improve net-shot control',
  'Improve lift height and depth',
  'Build drive consistency',
  'Extend rally consistency',
  'Improve court positioning',
  'Make better shot selections',
  'Recognize and create space',
  'Maintain quality under pressure',
]

const firstSessionFocusOptions = [
  'Movement fundamentals and recovery to base',
  'Split-step timing and court preparation',
  'Front-court movement and lunge technique',
  'Rear-court movement and overhead preparation',
  'Grip changes and racket preparation',
  'Low-serve consistency and placement',
  'Overhead clear technique and length',
  'Drop-shot technique and control',
  'Net control and front-court confidence',
  'Lift technique, height, and depth',
  'Drive technique and flat exchanges',
  'Rally consistency and error reduction',
  'Court positioning and recovery',
  'Shot selection and tactical awareness',
  'Composure and decision-making under pressure',
]

const independentPracticeOptions = [
  'Ready-position and split-step shadow drill',
  'Four-corner shadow footwork',
  'Front-court lunge and recovery repetitions',
  'Rear-court movement and recovery repetitions',
  'Grip-change and racket-readiness drill',
  'Low-serve target practice',
  'Overhead clear technique repetitions',
  'Drop-shot target practice',
  'Net-shot control repetitions',
  'Lift height and depth target practice',
  'Drive consistency against a wall',
  'Footwork and recovery sequence without a shuttle',
  'Shot-selection visualization and match reflection',
  'Balance and coordination routine',
]

const threeValues = (values?: string[]) =>
  Array.from({ length: 3 }, (_, index) => values?.[index] || '')

export function AssessmentWorkspace({ bookingID, initial }: WorkspaceProps) {
  const [scores, setScores] = useState<AssessmentScores>(initial?.scores || {})
  const [strengths, setStrengths] = useState(() => threeValues(initial?.strengths))
  const [priorities, setPriorities] = useState(() => threeValues(initial?.priorities))
  const [firstSessionFocus, setFirstSessionFocus] = useState(initial?.firstSessionFocus || '')
  const [independentPractice, setIndependentPractice] = useState(initial?.independentPractice || '')
  const [coachSummary, setCoachSummary] = useState(initial?.coachSummary || '')
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const scored = useMemo(
    () => Object.values(scores).filter((score): score is number => typeof score === 'number'),
    [scores],
  )
  const average = scored.length ? scored.reduce((sum, score) => sum + score, 0) / scored.length : 0
  const recommendation =
    average < 2.5
      ? 'Badminton Foundations'
      : average < 3.5
        ? 'Player Development'
        : 'Competitive Performance'

  function updateList(
    setter: (items: string[]) => void,
    items: string[],
    index: number,
    value: string,
  ) {
    const next = [...items]
    next[index] = value
    setter(next)
  }
  function save() {
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/assessment-bookings/${bookingID}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          strengths,
          priorities,
          firstSessionFocus,
          independentPractice,
          coachSummary,
        }),
      }).catch(() => null)
      const result = (await response?.json().catch(() => null)) as { error?: string } | null
      if (!response?.ok) return setMessage(result?.error || 'The assessment could not be saved.')
      setMessage('Assessment completed and recommendation saved.')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[1.6rem] border border-[#092c59]/10 bg-white p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{section.title}</h2>
                <p className="mt-1 text-sm text-[#718399]">{section.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-black text-[#1677ff]">
                {section.duration}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {section.criteria.map(([key, label]) => (
                <div
                  key={key}
                  className="grid gap-3 rounded-2xl bg-[#f8fbff] p-4 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <p className="text-sm font-bold">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setScores({ ...scores, [key]: null })}
                      className={`rounded-lg px-2.5 py-2 text-xs font-bold ${scores[key] == null ? 'bg-[#607286] text-white' : 'bg-white text-[#718399]'}`}
                    >
                      N/A
                    </button>
                    {rubric.map((label, index) => {
                      const value = index + 1
                      return (
                        <button
                          key={value}
                          type="button"
                          title={label}
                          onClick={() => setScores({ ...scores, [key]: value })}
                          className={`h-9 w-9 rounded-lg text-xs font-black ${scores[key] === value ? 'bg-[#1677ff] text-white' : 'border border-[#092c59]/10 bg-white text-[#607286]'}`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <section className="rounded-[1.6rem] border border-[#092c59]/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black">Feedback and recommendation</h2>
              <p className="mt-1 text-sm text-[#718399]">
                Complete during the final 8 minutes or immediately after the session.
              </p>
            </div>
            <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-black text-[#1677ff]">
              8 min
            </span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-black">Three strengths</p>
              {strengths.map((value, index) => (
                <select
                  key={index}
                  value={value}
                  onChange={(event) =>
                    updateList(setStrengths, strengths, index, event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#092c59]/15 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Select strength {index + 1}</option>
                  {strengthOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option !== value && strengths.includes(option)}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <div>
              <p className="text-sm font-black">Three training priorities</p>
              {priorities.map((value, index) => (
                <select
                  key={index}
                  value={value}
                  onChange={(event) =>
                    updateList(setPriorities, priorities, index, event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#092c59]/15 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Select priority {index + 1}</option>
                  {priorityOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option !== value && priorities.includes(option)}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
          <label className="mt-5 block text-sm font-black">
            First-session focus
            <select
              value={firstSessionFocus}
              onChange={(event) => setFirstSessionFocus(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#092c59]/15 bg-white px-4 py-3 font-normal"
            >
              <option value="">Select a first-session focus</option>
              {firstSessionFocus && !firstSessionFocusOptions.includes(firstSessionFocus) ? (
                <option value={firstSessionFocus}>{firstSessionFocus} (saved)</option>
              ) : null}
              {firstSessionFocusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-black">
            Independent practice task
            <select
              value={independentPractice}
              onChange={(event) => setIndependentPractice(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#092c59]/15 bg-white px-4 py-3 font-normal"
            >
              <option value="">Select an independent practice task</option>
              {independentPractice && !independentPracticeOptions.includes(independentPractice) ? (
                <option value={independentPractice}>{independentPractice} (saved)</option>
              ) : null}
              {independentPracticeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-black">
            Coach summary
            <textarea
              value={coachSummary}
              onChange={(event) => setCoachSummary(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-[#092c59]/15 p-4 font-normal"
            />
          </label>
        </section>
      </div>
      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[1.6rem] bg-[#092c59] p-6 text-white">
          <p className="text-xs font-black uppercase tracking-wider text-[#4cc9ff]">Live result</p>
          <p className="mt-3 text-5xl font-black">
            {average ? average.toFixed(1) : '—'}
            <span className="text-xl text-white/50">/5</span>
          </p>
          <p className="mt-2 text-sm text-white/60">{scored.length} criteria assessed</p>
          <div className="my-5 h-px bg-white/15" />
          <p className="text-xs font-bold uppercase text-white/50">Recommended package</p>
          <p className="mt-2 text-xl font-black text-[#4cc9ff]">
            {average ? recommendation : 'Complete the assessment'}
          </p>
          <div className="mt-5 space-y-1 text-xs text-white/65">
            {rubric.map((label, index) => (
              <p key={label}>
                <strong className="text-white">{index + 1}</strong> · {label}
              </p>
            ))}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#4cc9ff] px-5 py-3 text-sm font-black text-[#092c59] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {pending ? 'Saving…' : initial?.completed ? 'Update assessment' : 'Complete assessment'}
          </button>
          {message && (
            <p
              className={`mt-3 text-xs font-bold ${message.startsWith('Assessment completed') ? 'text-[#8ff0b4]' : 'text-[#ffb4ae]'}`}
            >
              {message}
            </p>
          )}
          {initial?.completed && !message ? (
            <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#8ff0b4]">
              <CheckCircle2 className="h-4 w-4" /> Assessment saved
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
