'use client'

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  type LucideIcon,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { PracticeStepIllustration } from '@/components/Dashboard/PracticeStepIllustration'
import {
  buildHomePracticeSequence,
  getHomePracticeAdvanceAction,
  getHomePracticeRounds,
  type HomePracticeStep,
} from '@/data/homePracticeSteps'
import type { Drill, IndependentPractice } from '@/payload-types'

type TimerStatus = 'not-started' | 'running' | 'paused' | 'finished'
type TimerAction =
  'start' | 'pause' | 'resume' | 'next-step' | 'repeat' | 'next' | 'finish' | 'reset'
type ExerciseLog = NonNullable<IndependentPractice['exerciseLogs']>[number]

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
  rounds: number
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
    rounds: generated?.rounds || getHomePracticeRounds(drill.instructions),
    steps: generated?.useGeneratedSteps
      ? generated.steps
      : storedSteps.length
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
  initialCurrentRound,
  initialCurrentStepElapsedSeconds,
  initialExerciseLogs,
  initialCompleted = false,
  launchToken = 0,
  onStatusChange,
}: {
  practiceID: string
  drills: WorkoutDrill[]
  initialStatus?: TimerStatus | null
  initialStartedAt?: string | null
  initialElapsedSeconds?: number | null
  initialCurrentDrillIndex?: number | null
  initialCurrentDrillElapsedSeconds?: number | null
  initialCurrentStepIndex?: number | null
  initialCurrentRound?: number | null
  initialCurrentStepElapsedSeconds?: number | null
  initialExerciseLogs?: IndependentPractice['exerciseLogs']
  initialCompleted?: boolean
  launchToken?: number
  onStatusChange?: (status: TimerStatus) => void
}) {
  const router = useRouter()
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
  const [viewedDrillIndex, setViewedDrillIndex] = useState(initialDrillIndex)
  const [currentDrillElapsedSeconds, setCurrentDrillElapsedSeconds] = useState(
    Math.max(0, Math.floor(initialCurrentDrillElapsedSeconds || 0)),
  )
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex)
  const [currentRound, setCurrentRound] = useState(
    Math.min(
      Math.max(1, Math.floor(initialCurrentRound || 1)),
      sequences[initialDrillIndex]?.rounds || 1,
    ),
  )
  const [currentStepElapsedSeconds, setCurrentStepElapsedSeconds] = useState(
    Math.max(0, Math.floor(initialCurrentStepElapsedSeconds || 0)),
  )
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(initialExerciseLogs || [])
  const [practiceCompleted, setPracticeCompleted] = useState(initialCompleted)
  const [showSummary, setShowSummary] = useState(false)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [completionError, setCompletionError] = useState('')
  const [now, setNow] = useState(Date.now())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'exercises' | 'log'>('exercises')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const keepProgressButtonRef = useRef<HTMLButtonElement>(null)
  const summaryPrimaryButtonRef = useRef<HTMLButtonElement>(null)
  const workoutContentRef = useRef<HTMLElement>(null)
  const automaticAdvanceRef = useRef('')
  const actionInFlightRef = useRef(false)

  const runningSegmentSeconds =
    status === 'running' && startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  const displayedSeconds = elapsedSeconds + runningSegmentSeconds
  const displayedDrillSeconds = currentDrillElapsedSeconds + runningSegmentSeconds
  const displayedStepSeconds = currentStepElapsedSeconds + runningSegmentSeconds
  const currentDrill = drills[currentDrillIndex]
  const currentSequence = sequences[currentDrillIndex]
  const viewedDrill = drills[viewedDrillIndex]
  const viewedSequence = sequences[viewedDrillIndex]
  const isViewingCurrentDrill = viewedDrillIndex === currentDrillIndex
  const isLastDrill = currentDrillIndex >= drills.length - 1
  const isLastStep = currentStepIndex >= (currentSequence?.steps.length || 1) - 1
  const hasMoreRounds = currentRound < (currentSequence?.rounds || 1)
  const nextAction: TimerAction = getHomePracticeAdvanceAction({
    isLastStep,
    isLastDrill,
    currentRound,
    rounds: currentSequence?.rounds || 1,
  })

  const showDrill = useCallback(
    (index: number) => {
      if (index < 0 || index >= drills.length) return
      setViewedDrillIndex(index)
      setActiveTab('exercises')
      window.requestAnimationFrame(() => workoutContentRef.current?.scrollTo({ top: 0 }))
    },
    [drills.length],
  )

  useEffect(() => {
    if (status !== 'running') return

    setNow(Date.now())
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [status])

  useEffect(() => setPracticeCompleted(initialCompleted), [initialCompleted])

  useEffect(() => {
    if (showSummary) window.requestAnimationFrame(() => summaryPrimaryButtonRef.current?.focus())
  }, [showSummary])

  useEffect(() => {
    if (showResetConfirmation) {
      window.requestAnimationFrame(() => keepProgressButtonRef.current?.focus())
    }
  }, [showResetConfirmation])

  useEffect(() => {
    if (launchToken > 0) {
      setViewedDrillIndex(currentDrillIndex)
      setIsOpen(true)
    }
  }, [currentDrillIndex, launchToken])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!showResetConfirmation) closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showResetConfirmation) setShowResetConfirmation(false)
        else setIsOpen(false)
        return
      }

      if (showResetConfirmation) return

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const target = event.target as HTMLElement | null
        if (!target?.matches('input, textarea, select, [contenteditable="true"]')) {
          event.preventDefault()
          setViewedDrillIndex((index) =>
            Math.min(drills.length - 1, Math.max(0, index + (event.key === 'ArrowLeft' ? -1 : 1))),
          )
          setActiveTab('exercises')
          window.requestAnimationFrame(() => workoutContentRef.current?.scrollTo({ top: 0 }))
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [drills.length, isOpen, showResetConfirmation])

  const runAction = useCallback(
    async (action: TimerAction) => {
      if (isSaving || actionInFlightRef.current) return
      actionInFlightRef.current = true

      const snapshot = {
        status,
        startedAt,
        elapsedSeconds,
        currentDrillIndex,
        currentDrillElapsedSeconds,
        currentStepIndex,
        currentRound,
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
      } else if (action === 'repeat') {
        setCurrentRound((round) => Math.min(round + 1, currentSequence.rounds))
        setCurrentStepIndex(0)
        setCurrentStepElapsedSeconds(0)
        if (status === 'running') {
          setElapsedSeconds(displayedSeconds)
          setCurrentDrillElapsedSeconds(displayedDrillSeconds)
          setStartedAt(actionTime)
          setNow(actionTime)
        }
      } else if (action === 'next') {
        const nextDrillIndex = Math.min(currentDrillIndex + 1, drills.length - 1)
        setCurrentDrillIndex(nextDrillIndex)
        setViewedDrillIndex(nextDrillIndex)
        setCurrentDrillElapsedSeconds(0)
        setCurrentStepIndex(0)
        setCurrentRound(1)
        setCurrentStepElapsedSeconds(0)
        if (status === 'running') {
          setElapsedSeconds(displayedSeconds)
          setStartedAt(actionTime)
          setNow(actionTime)
        }
      } else {
        setCurrentDrillIndex(0)
        setViewedDrillIndex(0)
        setCurrentDrillElapsedSeconds(0)
        setCurrentStepIndex(0)
        setCurrentRound(1)
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
        setCurrentRound(snapshot.currentRound)
        setCurrentStepElapsedSeconds(snapshot.currentStepElapsedSeconds)
        setNow(Date.now())
        setError('We could not save your practice progress. Please try again.')
        automaticAdvanceRef.current = ''
        actionInFlightRef.current = false
        setIsSaving(false)
        return
      }

      const data = (await response.json()) as {
        completedAt?: string | null
        currentDrillElapsedSeconds?: number
        currentDrillIndex?: number
        currentStepElapsedSeconds?: number
        currentStepIndex?: number
        currentRound?: number
        elapsedSeconds?: number
        exerciseLogs?: ExerciseLog[] | null
        timerStartedAt?: string | null
        timerStatus?: TimerStatus
        status?: 'assigned' | 'completed'
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
      setCurrentRound(
        Math.min(
          Math.max(1, Math.floor(data.currentRound || 1)),
          sequences[savedDrillIndex]?.rounds || 1,
        ),
      )
      setCurrentStepElapsedSeconds(Math.max(0, Math.floor(data.currentStepElapsedSeconds || 0)))
      setElapsedSeconds(Math.max(0, Math.floor(data.elapsedSeconds || 0)))
      setExerciseLogs(data.exerciseLogs || [])
      if (data.status === 'assigned') setPracticeCompleted(false)
      setStartedAt(savedStartedAt)
      const savedStatus = data.timerStatus || 'not-started'
      setStatus(savedStatus)
      onStatusChange?.(savedStatus)
      if (action === 'finish' || action === 'reset') router.refresh()
      setNow(Date.now())
      actionInFlightRef.current = false
      setIsSaving(false)
    },
    [
      currentDrillElapsedSeconds,
      currentDrillIndex,
      currentRound,
      currentSequence,
      currentStepElapsedSeconds,
      currentStepIndex,
      displayedDrillSeconds,
      displayedSeconds,
      displayedStepSeconds,
      drills.length,
      elapsedSeconds,
      isSaving,
      onStatusChange,
      practiceID,
      router,
      sequences,
      startedAt,
      status,
    ],
  )

  useEffect(() => {
    const durationSeconds = currentSequence?.steps[currentStepIndex]?.durationSeconds || 0
    if (
      status !== 'running' ||
      isSaving ||
      !durationSeconds ||
      displayedStepSeconds < durationSeconds
    ) {
      return
    }

    const automaticAdvanceKey = `${currentDrillIndex}:${currentRound}:${currentStepIndex}:${startedAt}`
    if (automaticAdvanceRef.current === automaticAdvanceKey) return
    automaticAdvanceRef.current = automaticAdvanceKey
    void runAction(nextAction)
  }, [
    currentDrillIndex,
    currentRound,
    currentSequence,
    currentStepIndex,
    displayedStepSeconds,
    isSaving,
    nextAction,
    runAction,
    startedAt,
    status,
  ])

  const resetPractice = () => {
    if (displayedSeconds > 0) {
      setShowResetConfirmation(true)
      return
    }
    void runAction('reset')
  }

  const confirmResetPractice = () => {
    setShowResetConfirmation(false)
    setShowSummary(false)
    void runAction('reset')
  }

  const toggleActiveStep = () => {
    if (status === 'not-started') void runAction('start')
    else if (status === 'running') void runAction('pause')
    else void runAction('resume')
  }

  const markPracticeComplete = async () => {
    if (isMarkingComplete || practiceCompleted) return

    setCompletionError('')
    setIsMarkingComplete(true)
    const response = await fetch(`/api/independent-practice/${practiceID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    }).catch(() => null)
    const result = (await response?.json().catch(() => null)) as { error?: string } | null

    if (!response?.ok) {
      setCompletionError(
        result?.error || 'We could not mark this home practice as done. Please try again.',
      )
      setIsMarkingComplete(false)
      return
    }

    setPracticeCompleted(true)
    setIsMarkingComplete(false)
    router.refresh()
  }

  if (!drills.length || !currentDrill || !currentSequence || !viewedDrill || !viewedSequence)
    return null

  const viewedDrillIsComplete = status === 'finished' || viewedDrillIndex < currentDrillIndex

  const currentStepIsTimed = Boolean(currentSequence.steps[currentStepIndex]?.durationSeconds)
  const nextLabel = !isLastStep
    ? currentStepIsTimed
      ? 'Skip to next exercise'
      : 'Reps done — next exercise'
    : hasMoreRounds
      ? currentStepIsTimed
        ? `Skip rest — start round ${currentRound + 1}`
        : `Start round ${currentRound + 1} of ${currentSequence.rounds}`
      : isLastDrill
        ? 'Finish practice'
        : 'Next part'

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setViewedDrillIndex(currentDrillIndex)
          setIsOpen(true)
        }}
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
                aria-hidden={showResetConfirmation || undefined}
                aria-labelledby={
                  showSummary ? 'home-practice-summary-title' : 'home-practice-workout-title'
                }
                className="mx-auto flex h-dvh w-full max-w-4xl flex-col bg-[#edf3f8] shadow-2xl"
              >
                {showSummary ? (
                  <WorkoutSummary
                    drills={drills}
                    sequences={sequences}
                    exerciseLogs={exerciseLogs}
                    elapsedSeconds={displayedSeconds}
                    practiceCompleted={practiceCompleted}
                    isMarkingComplete={isMarkingComplete}
                    completionError={completionError}
                    primaryButtonRef={summaryPrimaryButtonRef}
                    onMarkComplete={markPracticeComplete}
                    onReview={() => setShowSummary(false)}
                    onClose={() => {
                      setShowSummary(false)
                      setIsOpen(false)
                    }}
                  />
                ) : (
                  <>
                    <WorkoutHeader
                      closeButtonRef={closeButtonRef}
                      displayedSeconds={displayedSeconds}
                      drills={drills}
                      currentDrillIndex={currentDrillIndex}
                      viewedDrillIndex={viewedDrillIndex}
                      status={status}
                      isSaving={isSaving}
                      onClose={() => setIsOpen(false)}
                      onReset={resetPractice}
                      onSelectDrill={showDrill}
                    />

                    <main
                      ref={workoutContentRef}
                      className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-7"
                    >
                      <section className="rounded-[1.75rem] border-t-[6px] border-[#ff8a00] bg-white px-4 pb-6 pt-4 shadow-[0_20px_45px_-38px_rgba(9,44,89,.55)] sm:px-7 sm:pb-8">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[.14em] text-[#ff8a00]">
                              Part {viewedDrillIndex + 1} of {drills.length}
                            </p>
                            <h1
                              id="home-practice-workout-title"
                              className="mt-1 text-xl font-black leading-tight text-[#092c59] sm:text-2xl"
                            >
                              {viewedDrill.name}
                            </h1>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <span className="rounded-full bg-[#ff8a00] px-3 py-2 text-xs font-black text-white sm:text-sm">
                              {viewedSequence.steps.filter((step) => step.kind !== 'rest').length}{' '}
                              EXERCISES
                            </span>
                            {viewedDrillIsComplete ? (
                              <span className="rounded-full bg-[#eaf3ff] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#1677ff] sm:text-xs">
                                Complete
                              </span>
                            ) : viewedDrillIndex > currentDrillIndex ? (
                              <span className="rounded-full bg-[#f3f7fc] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#718399] sm:text-xs">
                                Up next
                              </span>
                            ) : viewedSequence.rounds > 1 ? (
                              <span className="rounded-full bg-[#eaf3ff] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#1677ff] sm:text-xs">
                                Round {currentRound} of {viewedSequence.rounds}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#092c59]/10 py-2">
                          <button
                            type="button"
                            onClick={() => showDrill(viewedDrillIndex - 1)}
                            disabled={viewedDrillIndex === 0}
                            className="flex min-h-11 min-w-0 items-center gap-1.5 rounded-xl px-2 text-left text-xs font-black text-[#092c59] transition hover:bg-[#eaf3ff] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff] sm:text-sm"
                          >
                            <ChevronLeft className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                              {viewedDrillIndex > 0
                                ? drills[viewedDrillIndex - 1]?.name
                                : 'Previous part'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showDrill(viewedDrillIndex + 1)}
                            disabled={viewedDrillIndex === drills.length - 1}
                            className="flex min-h-11 min-w-0 items-center justify-end gap-1.5 rounded-xl px-2 text-right text-xs font-black text-[#092c59] transition hover:bg-[#eaf3ff] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff] sm:text-sm"
                          >
                            <span className="truncate">
                              {viewedDrillIndex < drills.length - 1
                                ? drills[viewedDrillIndex + 1]?.name
                                : 'Next part'}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          </button>
                        </div>

                        <div className="mt-4 rounded-2xl bg-[#f3f7fc] p-4">
                          <p className="text-xs font-black uppercase tracking-wider text-[#718399]">
                            Setup
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#334b65] sm:text-base">
                            {viewedSequence.setup}
                          </p>
                        </div>

                        <PracticeTabs activeTab={activeTab} onChange={setActiveTab} />

                        {activeTab === 'exercises' ? (
                          <div className="mt-6 space-y-4" role="tabpanel">
                            {viewedSequence.steps.map((step, index) => (
                              <StepCard
                                key={`${viewedDrill.id}-${index}`}
                                step={step}
                                index={index}
                                sheetURL={viewedSequence.sheetURL}
                                columns={viewedSequence.columns}
                                rows={viewedSequence.rows}
                                completed={
                                  viewedDrillIsComplete ||
                                  (isViewingCurrentDrill && index < currentStepIndex)
                                }
                                active={
                                  status !== 'finished' &&
                                  isViewingCurrentDrill &&
                                  index === currentStepIndex
                                }
                                timerStatus={isViewingCurrentDrill ? status : 'paused'}
                                elapsedSeconds={
                                  isViewingCurrentDrill && index === currentStepIndex
                                    ? displayedStepSeconds
                                    : 0
                                }
                                isSaving={isSaving}
                                autoAdvances={Boolean(step.durationSeconds)}
                                onToggleTimer={toggleActiveStep}
                              />
                            ))}

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl bg-[#eaf3ff] p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-[#1677ff]">
                                  Work and rest
                                </p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-[#334b65]">
                                  {viewedSequence.workRest}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-[#fff7e6] p-4">
                                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#9a5b00]">
                                  <ShieldCheck className="h-4 w-4" /> Safety
                                </p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-[#5d4a24]">
                                  {viewedSequence.safety}
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
                            currentRound={currentRound}
                            displayedSeconds={displayedSeconds}
                            displayedStepSeconds={displayedStepSeconds}
                            exerciseLogs={exerciseLogs}
                          />
                        )}
                      </section>
                    </main>

                    <footer className="shrink-0 border-t border-[#092c59]/10 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
                      {!isViewingCurrentDrill && status !== 'finished' ? (
                        <WorkoutButton
                          icon={ArrowLeft}
                          label={`Back to active part ${currentDrillIndex + 1}`}
                          primary
                          disabled={isSaving}
                          onClick={() => showDrill(currentDrillIndex)}
                        />
                      ) : status === 'not-started' ? (
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
                            onClick={() => setShowSummary(true)}
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
                          {currentStepIsTimed ? (
                            <p className="text-center text-xs font-black uppercase tracking-wide text-[#607286]">
                              Hands-free mode · advances automatically at 0:00
                            </p>
                          ) : null}
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
                        <p className="mt-2 text-center text-sm font-semibold text-[#b42318]">
                          {error}
                        </p>
                      ) : null}
                    </footer>
                  </>
                )}
              </div>
              {showResetConfirmation ? (
                <ResetPracticeDialog
                  elapsedSeconds={displayedSeconds}
                  isSaving={isSaving}
                  keepProgressButtonRef={keepProgressButtonRef}
                  practiceCompleted={practiceCompleted}
                  onCancel={() => setShowResetConfirmation(false)}
                  onConfirm={confirmResetPractice}
                />
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function ResetPracticeDialog({
  elapsedSeconds,
  isSaving,
  keepProgressButtonRef,
  practiceCompleted,
  onCancel,
  onConfirm,
}: {
  elapsedSeconds: number
  isSaving: boolean
  keepProgressButtonRef: RefObject<HTMLButtonElement | null>
  practiceCompleted: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-[#071f42]/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-practice-title"
        aria-describedby="reset-practice-description"
        className="w-full max-w-lg rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0ee] text-[#b42318]">
          <RotateCcw className="h-7 w-7" />
        </span>
        <p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-[#b42318]">
          Reset workout
        </p>
        <h2 id="reset-practice-title" className="mt-2 text-2xl font-black text-[#092c59]">
          Start this workout again?
        </h2>
        <p
          id="reset-practice-description"
          className="mt-3 text-sm font-semibold leading-6 text-[#4f647b] sm:text-base"
        >
          This will permanently erase {formatTime(elapsedSeconds)} of saved workout time, completed
          exercise logs, and round progress. You will return to Part 1, Exercise 1.
        </p>
        <div className="mt-4 rounded-2xl bg-[#fff7e6] p-4 text-sm font-bold leading-6 text-[#5d4a24]">
          {practiceCompleted
            ? 'This will also mark the home practice as not done. This cannot be undone.'
            : 'This cannot be undone.'}
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            ref={keepProgressButtonRef}
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="min-h-14 rounded-full bg-[#15191f] px-5 py-3.5 font-black text-white transition hover:bg-[#092c59] disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
          >
            Keep my progress
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            className="min-h-14 rounded-full border-2 border-[#b42318] bg-white px-5 py-3.5 font-black text-[#b42318] transition hover:bg-[#fff0ee] disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b42318]"
          >
            Reset and start again
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkoutSummary({
  drills,
  sequences,
  exerciseLogs,
  elapsedSeconds,
  practiceCompleted,
  isMarkingComplete,
  completionError,
  primaryButtonRef,
  onMarkComplete,
  onReview,
  onClose,
}: {
  drills: WorkoutDrill[]
  sequences: PracticeSequence[]
  exerciseLogs: ExerciseLog[]
  elapsedSeconds: number
  practiceCompleted: boolean
  isMarkingComplete: boolean
  completionError: string
  primaryButtonRef: RefObject<HTMLButtonElement | null>
  onMarkComplete: () => void
  onReview: () => void
  onClose: () => void
}) {
  const totalExercises = sequences.reduce(
    (total, sequence) =>
      total + sequence.steps.filter((step) => step.kind !== 'rest').length * sequence.rounds,
    0,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#edf3f8]">
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-[max(1.5rem,env(safe-area-inset-top))] sm:px-7 sm:py-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1677ff] text-white shadow-[0_18px_35px_-20px_rgba(22,119,255,.9)]">
              <CheckCircle2 className="h-11 w-11" />
            </span>
            <p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-[#1677ff]">
              Workout complete
            </p>
            <h1
              id="home-practice-summary-title"
              className="mt-2 text-3xl font-black text-[#092c59] sm:text-4xl"
            >
              Nice work!
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[#607286] sm:text-base">
              You finished every part of this home workout. Here is your practice summary.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-4">
            <SummaryStat label="Time" value={formatTime(elapsedSeconds)} icon={Clock3} />
            <SummaryStat label="Drills" value={`${drills.length}`} icon={CheckCircle2} />
            <SummaryStat label="Exercises" value={`${totalExercises}`} icon={Target} />
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-[0_18px_40px_-34px_rgba(9,44,89,.55)]">
            <div className="border-b border-[#092c59]/10 px-5 py-4">
              <h2 className="font-black text-[#092c59]">Drills completed</h2>
              <p className="mt-1 text-xs font-semibold text-[#718399]">
                {totalExercises} exercises completed across {drills.length}{' '}
                {drills.length === 1 ? 'drill' : 'drills'}
              </p>
            </div>
            <ol className="divide-y divide-[#092c59]/8 px-5">
              {drills.map((drill, drillIndex) => {
                const sequence = sequences[drillIndex]
                const drillExerciseCount =
                  sequence.steps.filter((step) => step.kind !== 'rest').length * sequence.rounds
                const loggedSeconds = exerciseLogs
                  .filter(
                    (log) =>
                      log.drillIndex === drillIndex &&
                      sequence.steps[log.stepIndex]?.kind !== 'rest',
                  )
                  .reduce((total, log) => total + log.elapsedSeconds, 0)

                return (
                  <li key={drill.id} className="flex items-center gap-3 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-sm font-black text-[#1677ff]">
                      {drillIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-[#092c59]">{drill.name}</p>
                      <p className="mt-0.5 text-xs font-semibold text-[#718399]">
                        {drillExerciseCount} exercises · {sequence.rounds}{' '}
                        {sequence.rounds === 1 ? 'round' : 'rounds'}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-black tabular-nums text-[#607286]">
                      {loggedSeconds > 0 ? formatTime(loggedSeconds) : 'Done'}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          <div
            className={`mt-5 rounded-3xl border p-5 ${
              practiceCompleted
                ? 'border-[#2b9f6a]/25 bg-[#e9f8ef]'
                : 'border-[#1677ff]/20 bg-[#eaf3ff]'
            }`}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                className={`mt-0.5 h-6 w-6 shrink-0 ${practiceCompleted ? 'text-[#24734b]' : 'text-[#1677ff]'}`}
              />
              <div>
                <h2 className="font-black text-[#092c59]">
                  {practiceCompleted
                    ? 'Home practice marked as done'
                    : 'Mark this home practice as done?'}
                </h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#4f647b]">
                  {practiceCompleted
                    ? 'Your completion and workout results are now visible to your coach.'
                    : 'This is the final step. Your coach will see that you completed the assigned home practice.'}
                </p>
              </div>
            </div>
          </div>

          {completionError ? (
            <p className="mt-3 text-center text-sm font-semibold text-[#b42318]">
              {completionError}
            </p>
          ) : null}
        </div>
      </main>

      <footer className="shrink-0 border-t border-[#092c59]/10 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
        <div className="mx-auto grid max-w-2xl gap-2 sm:grid-cols-[1.35fr_1fr]">
          <button
            ref={primaryButtonRef}
            type="button"
            disabled={isMarkingComplete}
            onClick={practiceCompleted ? onClose : onMarkComplete}
            className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#15191f] px-5 py-3.5 font-black text-white transition hover:bg-[#1677ff] disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
          >
            <CheckCircle2 className="h-5 w-5" />
            {isMarkingComplete
              ? 'Saving…'
              : practiceCompleted
                ? 'Done — back to dashboard'
                : 'Mark home practice as done'}
          </button>
          <button
            type="button"
            disabled={isMarkingComplete}
            onClick={onReview}
            className="min-h-14 rounded-full border-2 border-[#092c59] bg-white px-5 py-3.5 font-black text-[#092c59] transition hover:bg-[#f3f7fc] disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
          >
            Review workout
          </button>
        </div>
      </footer>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center sm:p-4">
      <Icon className="mx-auto h-5 w-5 text-[#1677ff]" />
      <p className="mt-2 font-mono text-lg font-black tabular-nums text-[#092c59] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#718399] sm:text-xs">
        {label}
      </p>
    </div>
  )
}

function WorkoutHeader({
  closeButtonRef,
  displayedSeconds,
  drills,
  currentDrillIndex,
  viewedDrillIndex,
  status,
  isSaving,
  onClose,
  onReset,
  onSelectDrill,
}: {
  closeButtonRef: RefObject<HTMLButtonElement | null>
  displayedSeconds: number
  drills: WorkoutDrill[]
  currentDrillIndex: number
  viewedDrillIndex: number
  status: TimerStatus
  isSaving: boolean
  onClose: () => void
  onReset: () => void
  onSelectDrill: (index: number) => void
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
          <button
            type="button"
            key={drill.id}
            onClick={() => onSelectDrill(index)}
            className={`h-2 flex-1 rounded-full transition-colors hover:bg-[#78afff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff] ${
              status === 'finished' || index < currentDrillIndex
                ? 'bg-[#1677ff]'
                : index === currentDrillIndex
                  ? 'bg-[#ff8a00]'
                  : 'bg-[#0c4d78]'
            } ${index === viewedDrillIndex ? 'ring-2 ring-[#15191f] ring-offset-2 ring-offset-[#edf3f8]' : ''}`}
            aria-label={`View part ${index + 1}: ${drill.name}`}
            aria-current={index === viewedDrillIndex ? 'step' : undefined}
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
  autoAdvances,
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
  autoAdvances: boolean
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
        <PracticeStepIllustration
          sheetURL={sheetURL}
          index={index}
          columns={columns}
          rows={rows}
          alt={`${step.title} illustration`}
        />

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#718399] sm:text-xs">
                {step.kind === 'rest' ? 'Round break' : `Exercise ${index + 1}`}
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
          {active && autoAdvances ? (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#718399] sm:text-xs">
              Continues automatically when the timer ends
            </p>
          ) : null}
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
  currentRound,
  displayedSeconds,
  displayedStepSeconds,
  exerciseLogs,
}: {
  drills: WorkoutDrill[]
  sequences: PracticeSequence[]
  status: TimerStatus
  currentDrillIndex: number
  currentStepIndex: number
  currentRound: number
  displayedSeconds: number
  displayedStepSeconds: number
  exerciseLogs: ExerciseLog[]
}) {
  const completedExercises = sequences.reduce((total, sequence, drillIndex) => {
    const exerciseCount = sequence.steps.filter((step) => step.kind !== 'rest').length
    if (status === 'finished' || drillIndex < currentDrillIndex)
      return total + exerciseCount * sequence.rounds
    if (drillIndex === currentDrillIndex)
      return (
        total +
        (currentRound - 1) * exerciseCount +
        sequence.steps.slice(0, currentStepIndex).filter((step) => step.kind !== 'rest').length
      )
    return total
  }, 0)
  const totalExercises = sequences.reduce(
    (total, sequence) =>
      total + sequence.steps.filter((step) => step.kind !== 'rest').length * sequence.rounds,
    0,
  )

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
        {drills.map((drill, drillIndex) => {
          const sequence = sequences[drillIndex]
          const completed = status === 'finished' || drillIndex < currentDrillIndex
          const active = status !== 'finished' && drillIndex === currentDrillIndex
          const activeStepIsRest = sequence.steps[currentStepIndex]?.kind === 'rest'
          const drillLogs = exerciseLogs.filter((log) => log.drillIndex === drillIndex)
          const drillLoggedSeconds = drillLogs.reduce((total, log) => total + log.elapsedSeconds, 0)
          const displayedDrillLogSeconds = drillLoggedSeconds + (active ? displayedStepSeconds : 0)

          return (
            <div
              key={drill.id}
              className={`border-b border-[#092c59]/8 last:border-b-0 ${active ? 'bg-[#fff8ee]' : 'bg-white'}`}
            >
              <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 p-4">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                    completed
                      ? 'bg-[#1677ff] text-white'
                      : active
                        ? 'bg-[#ff8a00] text-white'
                        : 'bg-[#edf3f8] text-[#718399]'
                  }`}
                >
                  {completed ? <Check className="h-4 w-4" /> : drillIndex + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-black leading-5 text-[#092c59]">{drill.name}</p>
                  <p className="mt-1 text-xs font-semibold text-[#718399]">
                    {sequence.steps.filter((step) => step.kind !== 'rest').length} exercises
                    {sequence.rounds > 1 ? ` · ${sequence.rounds} rounds` : ''}
                    {drillLogs.length || active
                      ? ` · ${formatTime(displayedDrillLogSeconds)} logged`
                      : ''}
                  </p>
                </div>
                <span className="text-right text-[10px] font-black uppercase text-[#718399] sm:text-xs">
                  {completed
                    ? 'Done'
                    : active
                      ? activeStepIsRest
                        ? 'Round break'
                        : sequence.rounds > 1
                          ? `Round ${currentRound} · Exercise ${currentStepIndex + 1}`
                          : `Exercise ${currentStepIndex + 1}`
                      : 'Next'}
                </span>
              </div>

              <ol className="border-t border-[#092c59]/8 bg-[#f8fbff] px-4 py-2 sm:px-5">
                {sequence.steps.map((step, stepIndex) => {
                  const stepLogs = drillLogs.filter((log) => log.stepIndex === stepIndex)
                  const loggedSeconds = stepLogs.reduce(
                    (total, log) => total + log.elapsedSeconds,
                    0,
                  )
                  const isCurrentStep = active && stepIndex === currentStepIndex
                  const displayedLoggedSeconds =
                    loggedSeconds + (isCurrentStep ? displayedStepSeconds : 0)
                  const plannedTime = step.durationSeconds
                    ? formatTime(step.durationSeconds)
                    : step.amount
                  const timeLabel =
                    stepLogs.length || isCurrentStep
                      ? formatTime(displayedLoggedSeconds)
                      : plannedTime
                  const roundLabel = isCurrentStep
                    ? stepLogs.length
                      ? `${stepLogs.length} completed · round ${currentRound} active`
                      : `Round ${currentRound} active`
                    : stepLogs.length
                      ? `${stepLogs.length} of ${sequence.rounds} ${sequence.rounds === 1 ? 'round' : 'rounds'} logged`
                      : 'Planned'
                  const stepCompleted = completed || stepLogs.length >= sequence.rounds

                  return (
                    <li
                      key={`${drill.id}-log-${stepIndex}`}
                      className="grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#092c59]/8 py-3 last:border-b-0"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${
                          stepCompleted
                            ? 'bg-[#1677ff] text-white'
                            : isCurrentStep
                              ? 'bg-[#ff8a00] text-white'
                              : 'bg-[#e6edf5] text-[#718399]'
                        }`}
                      >
                        {stepCompleted ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : step.kind === 'rest' ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          stepIndex + 1
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-black leading-5 text-[#092c59]">{step.title}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-[#718399]">
                          Target {plannedTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-black tabular-nums text-[#15191f]">
                          {timeLabel}
                        </p>
                        <p className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-[#718399]">
                          {roundLabel}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
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
