'use client'

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  type LucideIcon,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { buildHomePracticeSequence, type HomePracticeStep } from '@/data/homePracticeSteps'
import type { Drill } from '@/payload-types'

type TimerStatus = 'not-started' | 'running' | 'paused' | 'finished'
type TimerAction = 'start' | 'pause' | 'resume' | 'next-step' | 'next' | 'finish' | 'reset'

type WorkoutDrill = Pick<
  Drill,
  | 'id'
  | 'name'
  | 'illustrationURL'
  | 'stepIllustrationURL'
  | 'stepIllustrationColumns'
  | 'stepIllustrationRows'
  | 'practiceSteps'
  | 'durationMinutes'
  | 'difficulty'
  | 'equipment'
  | 'instructions'
  | 'coachingPoints'
  | 'successTarget'
>

type PracticeSequence = {
  setup: string
  workRest: string
  safety: string
  sheetURL?: string | null
  columns: number
  rows: number
  steps: HomePracticeStep[]
}

const formatTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return hours
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const sequenceFor = (drill: WorkoutDrill): PracticeSequence => {
  const generated = buildHomePracticeSequence(drill.name, drill.instructions)
  const storedSteps =
    drill.practiceSteps?.map((step) => ({
      title: step.title,
      instruction: step.instruction,
      amount: step.amount,
      durationSeconds: step.durationSeconds || undefined,
    })) || []

  return {
    setup: generated?.setup || 'Prepare the equipment and clear a safe practice space.',
    workRest: generated?.workRest || `Allow approximately ${drill.durationMinutes} minutes.`,
    safety:
      generated?.safety || 'Stop if the movement cannot be completed safely and under control.',
    sheetURL: drill.stepIllustrationURL || generated?.sheetURL || drill.illustrationURL,
    columns: Math.max(1, drill.stepIllustrationColumns || generated?.columns || 1),
    rows: Math.max(1, drill.stepIllustrationRows || generated?.rows || 1),
    steps: storedSteps.length
      ? storedSteps
      : generated?.steps.length
        ? generated.steps
        : [
            {
              title: drill.name,
              instruction: drill.instructions,
              amount: `${drill.durationMinutes} min`,
            },
          ],
  }
}

export function HomePracticeTimer({
  practiceID,
  drills,
  initialStatus,
  initialStartedAt,
  initialElapsedSeconds,
  initialCurrentDrillIndex,
  initialCurrentDrillElapsedSeconds,
  initialCurrentStepIndex,
  initialCurrentStepElapsedSeconds,
}: {
  practiceID: string
  drills: WorkoutDrill[]
  initialStatus?: TimerStatus | null
  initialStartedAt?: string | null
  initialElapsedSeconds?: number | null
  initialCurrentDrillIndex?: number | null
  initialCurrentDrillElapsedSeconds?: number | null
  initialCurrentStepIndex?: number | null
  initialCurrentStepElapsedSeconds?: number | null
}) {
  const sequences = useMemo(() => drills.map(sequenceFor), [drills])
  const hasRunningStart = initialStatus === 'running' && Boolean(initialStartedAt)
  const initialDrillIndex = Math.min(
    Math.max(0, Math.floor(initialCurrentDrillIndex || 0)),
    Math.max(0, drills.length - 1),
  )
  const initialStepIndex = Math.min(
    Math.max(0, Math.floor(initialCurrentStepIndex || 0)),
    Math.max(0, (sequences[initialDrillIndex]?.steps.length || 1) - 1),
  )

  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<TimerStatus>(
    initialStatus === 'running' && !hasRunningStart ? 'paused' : initialStatus || 'not-started',
  )
  const [startedAt, setStartedAt] = useState<number | null>(
    hasRunningStart ? new Date(initialStartedAt!).getTime() : null,
  )
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.max(0, Math.floor(initialElapsedSeconds || 0)),
  )
  const [currentDrillIndex, setCurrentDrillIndex] = useState(initialDrillIndex)
  const [currentDrillElapsedSeconds, setCurrentDrillElapsedSeconds] = useState(
    Math.max(0, Math.floor(initialCurrentDrillElapsedSeconds || 0)),
  )
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex)
  const [currentStepElapsedSeconds, setCurrentStepElapsedSeconds] = useState(
    Math.max(0, Math.floor(initialCurrentStepElapsedSeconds || 0)),
  )
  const [now, setNow] = useState(Date.now())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'exercises' | 'log'>('exercises')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const runningSegmentSeconds =
    status === 'running' && startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  const displayedSeconds = elapsedSeconds + runningSegmentSeconds
  const displayedDrillSeconds = currentDrillElapsedSeconds + runningSegmentSeconds
  const displayedStepSeconds = currentStepElapsedSeconds + runningSegmentSeconds
  const currentDrill = drills[currentDrillIndex]
  const currentSequence = sequences[currentDrillIndex]
  const isLastDrill = currentDrillIndex >= drills.length - 1
  const isLastStep = currentStepIndex >= (currentSequence?.steps.length || 1) - 1

  useEffect(() => {
    if (status !== 'running') return

    setNow(Date.now())
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [status])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const runAction = async (action: TimerAction) => {
    if (isSaving) return

    const snapshot = {
      status,
      startedAt,
      elapsedSeconds,
      currentDrillIndex,
      currentDrillElapsedSeconds,
      currentStepIndex,
      currentStepElapsedSeconds,
    }
    const actionTime = Date.now()

    setError('')
    setIsSaving(true)

    if (action === 'start' || action === 'resume') {
      setElapsedSeconds(displayedSeconds)
      setCurrentDrillElapsedSeconds(action === 'start' ? 0 : displayedDrillSeconds)
      setCurrentStepElapsedSeconds(action === 'start' ? 0 : displayedStepSeconds)
      setStartedAt(actionTime)
      setNow(actionTime)
      setStatus('running')
    } else if (action === 'pause' || action === 'finish') {
      setElapsedSeconds(displayedSeconds)
      setCurrentDrillElapsedSeconds(displayedDrillSeconds)
      setCurrentStepElapsedSeconds(displayedStepSeconds)
      setStartedAt(null)
      setStatus(action === 'pause' ? 'paused' : 'finished')
    } else if (action === 'next-step') {
      setCurrentStepIndex((index) =>
        Math.min(index + 1, Math.max(0, currentSequence.steps.length - 1)),
      )
      setCurrentStepElapsedSeconds(0)
      if (status === 'running') {
        setElapsedSeconds(displayedSeconds)
        setCurrentDrillElapsedSeconds(displayedDrillSeconds)
        setStartedAt(actionTime)
        setNow(actionTime)
      }
    } else if (action === 'next') {
      setCurrentDrillIndex((index) => Math.min(index + 1, drills.length - 1))
      setCurrentDrillElapsedSeconds(0)
      setCurrentStepIndex(0)
      setCurrentStepElapsedSeconds(0)
      if (status === 'running') {
        setElapsedSeconds(displayedSeconds)
        setStartedAt(actionTime)
        setNow(actionTime)
      }
    } else {
      setCurrentDrillIndex(0)
      setCurrentDrillElapsedSeconds(0)
      setCurrentStepIndex(0)
      setCurrentStepElapsedSeconds(0)
      setElapsedSeconds(0)
      setStartedAt(null)
      setStatus('not-started')
    }

    const response = await fetch(`/api/independent-practice/${practiceID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timerAction: action }),
    }).catch(() => null)

    if (!response?.ok) {
      setStatus(snapshot.status)
      setStartedAt(snapshot.startedAt)
      setElapsedSeconds(snapshot.elapsedSeconds)
      setCurrentDrillIndex(snapshot.currentDrillIndex)
      setCurrentDrillElapsedSeconds(snapshot.currentDrillElapsedSeconds)
      setCurrentStepIndex(snapshot.currentStepIndex)
      setCurrentStepElapsedSeconds(snapshot.currentStepElapsedSeconds)
      setNow(Date.now())
      setError('We could not save your practice progress. Please try again.')
      setIsSaving(false)
      return
    }

    const data = (await response.json()) as {
      currentDrillElapsedSeconds?: number
      currentDrillIndex?: number
      currentStepElapsedSeconds?: number
      currentStepIndex?: number
      elapsedSeconds?: number
      timerStartedAt?: string | null
      timerStatus?: TimerStatus
    }
    const savedStartedAt = data.timerStartedAt ? new Date(data.timerStartedAt).getTime() : null
    const savedDrillIndex = Math.min(
      Math.max(0, data.currentDrillIndex || 0),
      Math.max(0, drills.length - 1),
    )

    setCurrentDrillIndex(savedDrillIndex)
    setCurrentDrillElapsedSeconds(Math.max(0, Math.floor(data.currentDrillElapsedSeconds || 0)))
    setCurrentStepIndex(
      Math.min(
        Math.max(0, data.currentStepIndex || 0),
        Math.max(0, (sequences[savedDrillIndex]?.steps.length || 1) - 1),
      ),
    )
    setCurrentStepElapsedSeconds(Math.max(0, Math.floor(data.currentStepElapsedSeconds || 0)))
    setElapsedSeconds(Math.max(0, Math.floor(data.elapsedSeconds || 0)))
    setStartedAt(savedStartedAt)
    setStatus(data.timerStatus || 'not-started')
    setNow(Date.now())
    setIsSaving(false)
  }

  const resetPractice = () => {
    if (displayedSeconds > 0 && !window.confirm('Reset this practice timer and drill progress?')) {
      return
    }
    void runAction('reset')
  }

  const toggleActiveStep = () => {
    if (status === 'not-started') void runAction('start')
    else if (status === 'running') void runAction('pause')
    else void runAction('resume')
  }

  if (!drills.length || !currentDrill || !currentSequence) return null

  const nextAction: TimerAction = !isLastStep ? 'next-step' : isLastDrill ? 'finish' : 'next'
  const nextLabel = !isLastStep ? 'Next exercise' : isLastDrill ? 'Finish practice' : 'Next part'

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="sticky bottom-3 z-30 mt-4 flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-[#15191f] px-6 py-4 text-lg font-black text-white shadow-[0_18px_45px_-18px_rgba(9,18,32,.8)] transition hover:bg-[#092c59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
      >
        <Play className="h-6 w-6 fill-current" />
        {status === 'not-started'
          ? 'Start practice'
          : status === 'finished'
            ? 'Review practice'
            : 'Continue practice'}
      </button>

      {isOpen
        ? createPortal(
            <div className="fixed inset-0 z-[120] bg-[#edf3f8]">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="home-practice-workout-title"
                className="mx-auto flex h-dvh w-full max-w-4xl flex-col bg-[#edf3f8] shadow-2xl"
              >
                <WorkoutHeader
                  closeButtonRef={closeButtonRef}
                  displayedSeconds={displayedSeconds}
                  drills={drills}
                  currentDrillIndex={currentDrillIndex}
                  status={status}
                  isSaving={isSaving}
                  onClose={() => setIsOpen(false)}
                  onReset={resetPractice}
                />

                <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-7">
                  <section className="rounded-[1.75rem] border-t-[6px] border-[#ff8a00] bg-white px-4 pb-6 pt-4 shadow-[0_20px_45px_-38px_rgba(9,44,89,.55)] sm:px-7 sm:pb-8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[.14em] text-[#ff8a00]">
                          Part {currentDrillIndex + 1} of {drills.length}
                        </p>
                        <h1
                          id="home-practice-workout-title"
                          className="mt-1 text-xl font-black leading-tight text-[#092c59] sm:text-2xl"
                        >
                          {currentDrill.name}
                        </h1>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#ff8a00] px-3 py-2 text-xs font-black text-white sm:text-sm">
                        {currentSequence.steps.length} EXERCISES
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#f3f7fc] p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-[#718399]">
                        Setup
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#334b65] sm:text-base">
                        {currentSequence.setup}
                      </p>
                    </div>

                    <PracticeTabs activeTab={activeTab} onChange={setActiveTab} />

                    {activeTab === 'exercises' ? (
                      <div className="mt-6 space-y-4" role="tabpanel">
                        {currentSequence.steps.map((step, index) => (
                          <StepCard
                            key={`${currentDrill.id}-${index}`}
                            step={step}
                            index={index}
                            sheetURL={currentSequence.sheetURL}
                            columns={currentSequence.columns}
                            rows={currentSequence.rows}
                            completed={status === 'finished' || index < currentStepIndex}
                            active={status !== 'finished' && index === currentStepIndex}
                            timerStatus={status}
                            elapsedSeconds={index === currentStepIndex ? displayedStepSeconds : 0}
                            isSaving={isSaving}
                            onToggleTimer={toggleActiveStep}
                          />
                        ))}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-[#eaf3ff] p-4">
                            <p className="text-xs font-black uppercase tracking-wider text-[#1677ff]">
                              Work and rest
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-[#334b65]">
                              {currentSequence.workRest}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-[#fff7e6] p-4">
                            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#9a5b00]">
                              <ShieldCheck className="h-4 w-4" /> Safety
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-[#5d4a24]">
                              {currentSequence.safety}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <PracticeLog
                        drills={drills}
                        sequences={sequences}
                        status={status}
                        currentDrillIndex={currentDrillIndex}
                        currentStepIndex={currentStepIndex}
                        displayedSeconds={displayedSeconds}
                      />
                    )}
                  </section>
                </main>

                <footer className="shrink-0 border-t border-[#092c59]/10 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
                  {status === 'not-started' ? (
                    <WorkoutButton
                      icon={Play}
                      label="Start"
                      primary
                      disabled={isSaving}
                      onClick={() => runAction('start')}
                    />
                  ) : status === 'finished' ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <WorkoutButton
                        icon={CheckCircle2}
                        label="Done"
                        primary
                        disabled={isSaving}
                        onClick={() => setIsOpen(false)}
                      />
                      <WorkoutButton
                        icon={RotateCcw}
                        label="Start again"
                        disabled={isSaving}
                        onClick={resetPractice}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <WorkoutButton
                        icon={status === 'running' ? Pause : Play}
                        label={status === 'running' ? 'Pause / Stop' : 'Resume'}
                        primary
                        disabled={isSaving}
                        onClick={() => runAction(status === 'running' ? 'pause' : 'resume')}
                      />
                      <WorkoutButton
                        icon={nextAction === 'finish' ? CheckCircle2 : Play}
                        label={nextLabel}
                        disabled={isSaving}
                        onClick={() => runAction(nextAction)}
                      />
                    </div>
                  )}
                  {error ? (
                    <p className="mt-2 text-center text-sm font-semibold text-[#b42318]">{error}</p>
                  ) : null}
                </footer>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function WorkoutHeader({
  closeButtonRef,
  displayedSeconds,
  drills,
  currentDrillIndex,
  status,
  isSaving,
  onClose,
  onReset,
}: {
  closeButtonRef: RefObject<HTMLButtonElement | null>
  displayedSeconds: number
  drills: WorkoutDrill[]
  currentDrillIndex: number
  status: TimerStatus
  isSaving: boolean
  onClose: () => void
  onReset: () => void
}) {
  return (
    <header className="shrink-0 bg-[#edf3f8] px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-7">
      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-3">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-[#15191f] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#1677ff]"
          aria-label="Close guided practice"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <time
          className="text-center font-mono text-4xl font-black tabular-nums tracking-tight text-[#15191f] sm:text-5xl"
          aria-label={`${displayedSeconds} seconds elapsed`}
        >
          {formatTime(displayedSeconds)}
        </time>
        <button
          type="button"
          onClick={onReset}
          disabled={isSaving}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3b4657] text-white transition hover:bg-[#092c59] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
          aria-label="Reset practice"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 flex gap-2" aria-label="Drill progress">
        {drills.map((drill, index) => (
          <span
            key={drill.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              status === 'finished' || index < currentDrillIndex
                ? 'bg-[#1677ff]'
                : index === currentDrillIndex
                  ? 'bg-[#ff8a00]'
                  : 'bg-[#0c4d78]'
            }`}
          />
        ))}
      </div>
    </header>
  )
}

function PracticeTabs({
  activeTab,
  onChange,
}: {
  activeTab: 'exercises' | 'log'
  onChange: (tab: 'exercises' | 'log') => void
}) {
  return (
    <div
      className="mt-5 grid grid-cols-2 rounded-full bg-[#e4ebf4] p-0.5"
      role="tablist"
      aria-label="Practice view"
    >
      {(['exercises', 'log'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onChange(tab)}
          className={`min-h-12 rounded-full px-4 text-sm font-black uppercase tracking-wide transition sm:text-base ${
            activeTab === tab ? 'bg-[#15191f] text-white' : 'text-[#15191f] hover:bg-white/60'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function StepIllustration({
  sheetURL,
  index,
  columns,
  rows,
}: {
  sheetURL?: string | null
  index: number
  columns: number
  rows: number
}) {
  if (!sheetURL) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#e7eef4] text-[#1677ff]">
        <Target className="h-12 w-12" />
      </div>
    )
  }

  const column = index % columns
  const row = Math.floor(index / columns)
  const x = columns === 1 ? 0 : (column / (columns - 1)) * 100
  const y = rows === 1 ? 0 : (row / (rows - 1)) * 100

  return (
    <div
      role="img"
      aria-label={`Exercise ${index + 1} illustration`}
      className="aspect-square rounded-2xl bg-[#e7eef4] bg-no-repeat"
      style={{
        backgroundImage: `url(${sheetURL})`,
        backgroundPosition: `${x}% ${y}%`,
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
      }}
    />
  )
}

function StepCard({
  step,
  index,
  sheetURL,
  columns,
  rows,
  completed,
  active,
  timerStatus,
  elapsedSeconds,
  isSaving,
  onToggleTimer,
}: {
  step: HomePracticeStep
  index: number
  sheetURL?: string | null
  columns: number
  rows: number
  completed: boolean
  active: boolean
  timerStatus: TimerStatus
  elapsedSeconds: number
  isSaving: boolean
  onToggleTimer: () => void
}) {
  const durationSeconds = step.durationSeconds || 0
  const remainingSeconds = durationSeconds ? Math.max(0, durationSeconds - elapsedSeconds) : 0
  const progress = completed
    ? 100
    : active && durationSeconds
      ? Math.min(100, (elapsedSeconds / durationSeconds) * 100)
      : 0

  return (
    <article
      className={`overflow-hidden rounded-[1.5rem] border-2 bg-[#f8fbff] transition ${
        active
          ? 'border-[#ff8a00] shadow-[0_16px_35px_-30px_rgba(255,138,0,.9)]'
          : completed
            ? 'border-[#1677ff]/35'
            : 'border-[#ff8a00]/50'
      }`}
    >
      <div className="grid grid-cols-[40%_minmax(0,1fr)] items-center gap-3 p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:p-6">
        <StepIllustration sheetURL={sheetURL} index={index} columns={columns} rows={rows} />

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#718399] sm:text-xs">
                Exercise {index + 1}
              </p>
              <h2 className="mt-1 text-base font-black leading-tight text-[#15191f] sm:text-xl">
                {step.title}
              </h2>
            </div>
            {active ? (
              <span className="shrink-0 rounded-full bg-[#ff765f] px-2.5 py-1 text-[10px] font-black text-white sm:text-xs">
                Active
              </span>
            ) : completed ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1677ff] text-white">
                <Check className="h-4 w-4" />
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-xs font-semibold leading-5 text-[#4f647b] sm:text-sm sm:leading-6">
            {step.instruction}
          </p>

          <button
            type="button"
            disabled={!active || isSaving}
            onClick={onToggleTimer}
            className={`relative mt-4 flex min-h-12 w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 text-left text-sm font-black transition sm:text-base ${
              active
                ? 'border-[#15191f]/15 bg-[#edf3f8] text-[#15191f] hover:border-[#15191f]/35'
                : completed
                  ? 'border-[#1677ff]/20 bg-[#eaf3ff] text-[#1677ff]'
                  : 'border-[#092c59]/10 bg-[#edf3f8] text-[#607286]'
            } disabled:cursor-default`}
            aria-label={
              active
                ? `${timerStatus === 'running' ? 'Pause' : 'Start'} ${step.title}`
                : `${step.title} ${completed ? 'completed' : 'upcoming'}`
            }
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                active
                  ? 'bg-[#15191f] text-white'
                  : completed
                    ? 'bg-[#1677ff] text-white'
                    : 'text-[#15191f]'
              }`}
            >
              {completed ? (
                <Check className="h-5 w-5" />
              ) : active && timerStatus === 'running' ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </span>
            <span className={durationSeconds ? 'font-mono tabular-nums' : ''}>
              {completed
                ? 'Complete'
                : durationSeconds && active
                  ? formatTime(remainingSeconds)
                  : step.amount}
            </span>
            <span className="absolute inset-x-0 bottom-0 h-1 bg-[#dbe4ee]">
              <span
                className={`block h-full transition-[width] duration-500 ${
                  completed ? 'bg-[#1677ff]' : 'bg-[#15191f]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}

function PracticeLog({
  drills,
  sequences,
  status,
  currentDrillIndex,
  currentStepIndex,
  displayedSeconds,
}: {
  drills: WorkoutDrill[]
  sequences: PracticeSequence[]
  status: TimerStatus
  currentDrillIndex: number
  currentStepIndex: number
  displayedSeconds: number
}) {
  const completedExercises = sequences.reduce((total, sequence, drillIndex) => {
    if (status === 'finished' || drillIndex < currentDrillIndex)
      return total + sequence.steps.length
    if (drillIndex === currentDrillIndex) return total + currentStepIndex
    return total
  }, 0)
  const totalExercises = sequences.reduce((total, sequence) => total + sequence.steps.length, 0)

  return (
    <div className="mt-6" role="tabpanel">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#edf3f8] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-[#718399]">Session time</p>
          <p className="mt-2 font-mono text-2xl font-black tabular-nums text-[#15191f]">
            {formatTime(displayedSeconds)}
          </p>
        </div>
        <div className="rounded-2xl bg-[#edf3f8] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-[#718399]">Exercises</p>
          <p className="mt-2 text-2xl font-black text-[#15191f]">
            {status === 'finished' ? totalExercises : completedExercises}/{totalExercises}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#092c59]/10">
        {drills.map((drill, index) => {
          const completed = status === 'finished' || index < currentDrillIndex
          const active = status !== 'finished' && index === currentDrillIndex

          return (
            <div
              key={drill.id}
              className={`grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#092c59]/8 p-4 last:border-b-0 ${
                active ? 'bg-[#fff8ee]' : 'bg-white'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                  completed
                    ? 'bg-[#1677ff] text-white'
                    : active
                      ? 'bg-[#ff8a00] text-white'
                      : 'bg-[#edf3f8] text-[#718399]'
                }`}
              >
                {completed ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-black leading-5 text-[#092c59]">{drill.name}</p>
                <p className="mt-1 text-xs font-semibold text-[#718399]">
                  {sequences[index].steps.length} exercises
                </p>
              </div>
              <span className="text-xs font-black uppercase text-[#718399]">
                {completed ? 'Done' : active ? `Exercise ${currentStepIndex + 1}` : 'Next'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WorkoutButton({
  icon: Icon,
  label,
  primary = false,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  primary?: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-6 py-3.5 text-lg font-black transition ${
        primary
          ? 'bg-[#15191f] text-white hover:bg-[#092c59]'
          : 'border-2 border-[#15191f] bg-white text-[#15191f] hover:bg-[#f3f7fc]'
      } disabled:cursor-wait disabled:opacity-55`}
    >
      <Icon className={`h-6 w-6 ${Icon === Play ? 'fill-current' : ''}`} /> {label}
    </button>
  )
}
