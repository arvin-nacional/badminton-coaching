'use client'

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Play,
  PlayCircle,
  Target,
  Users,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { HomePracticeTimer } from '@/components/Dashboard/HomePracticeTimer'
import { PracticeStepIllustration } from '@/components/Dashboard/PracticeStepIllustration'
import { buildHomePracticeSequence } from '@/data/homePracticeSteps'
import type { Drill, IndependentPractice } from '@/payload-types'
import { drillIllustrationFor } from '@/utilities/drillIllustration'
import { safeTrainingVideoURL } from '@/utilities/trainingVideos'

type PracticeDrill = Pick<
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
  | 'eventType'
  | 'numberOfPlayers'
  | 'instructions'
  | 'coachingPoints'
  | 'commonMistakes'
  | 'equipment'
  | 'successTarget'
  | 'easierVariation'
  | 'harderProgression'
  | 'completionRequirement'
  | 'videoURL'
>

export function IndependentPracticeDrills({
  drills,
  practiceID,
  initialTimerStatus,
  initialTimerStartedAt,
  initialElapsedSeconds,
  initialCurrentDrillIndex,
  initialCurrentDrillElapsedSeconds,
  initialCurrentStepIndex,
  initialCurrentRound,
  initialCurrentStepElapsedSeconds,
  initialExerciseLogs,
  initialCompleted,
}: {
  drills: PracticeDrill[]
  practiceID?: string
  initialTimerStatus?: 'not-started' | 'running' | 'paused' | 'finished' | null
  initialTimerStartedAt?: string | null
  initialElapsedSeconds?: number | null
  initialCurrentDrillIndex?: number | null
  initialCurrentDrillElapsedSeconds?: number | null
  initialCurrentStepIndex?: number | null
  initialCurrentRound?: number | null
  initialCurrentStepElapsedSeconds?: number | null
  initialExerciseLogs?: IndependentPractice['exerciseLogs']
  initialCompleted?: boolean
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [workoutLaunchToken, setWorkoutLaunchToken] = useState(0)
  const [workoutStatus, setWorkoutStatus] = useState<
    'not-started' | 'running' | 'paused' | 'finished'
  >(
    initialTimerStatus === 'running' && !initialTimerStartedAt
      ? 'paused'
      : initialTimerStatus || 'not-started',
  )
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const isModalOpen = selectedIndex !== null
  const selectedDrill = selectedIndex === null ? null : drills[selectedIndex]
  const selectedVideoURL = selectedDrill
    ? safeTrainingVideoURL(selectedDrill.videoURL)?.toString()
    : null
  const selectedGeneratedSequence = selectedDrill
    ? buildHomePracticeSequence(selectedDrill.name, selectedDrill.instructions)
    : null
  const selectedSteps = selectedGeneratedSequence?.useGeneratedSteps
    ? selectedGeneratedSequence.steps
    : selectedDrill?.practiceSteps?.length
      ? selectedDrill.practiceSteps
      : selectedGeneratedSequence?.steps || []
  const useGeneratedSequence = Boolean(selectedGeneratedSequence?.useGeneratedSteps)
  const selectedSheetURL = useGeneratedSequence
    ? selectedGeneratedSequence?.sheetURL ||
      selectedDrill?.stepIllustrationURL ||
      (selectedDrill ? drillIllustrationFor(selectedDrill) : null)
    : selectedDrill?.stepIllustrationURL ||
      selectedGeneratedSequence?.sheetURL ||
      (selectedDrill ? drillIllustrationFor(selectedDrill) : null)
  const selectedSheetColumns = Math.max(
    1,
    useGeneratedSequence
      ? selectedGeneratedSequence?.columns || selectedDrill?.stepIllustrationColumns || 1
      : selectedDrill?.stepIllustrationColumns || selectedGeneratedSequence?.columns || 1,
  )
  const selectedSheetRows = Math.max(
    1,
    useGeneratedSequence
      ? selectedGeneratedSequence?.rows || selectedDrill?.stepIllustrationRows || 1
      : selectedDrill?.stepIllustrationRows || selectedGeneratedSequence?.rows || 1,
  )

  const closeModal = useCallback(() => {
    setSelectedIndex(null)
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }, [])

  const openModal = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger
    setSelectedIndex(index)
  }

  const showDrill = useCallback(
    (index: number) => {
      if (index < 0 || index >= drills.length) return
      setSelectedIndex(index)
      window.requestAnimationFrame(() => modalContentRef.current?.scrollTo({ top: 0 }))
    },
    [drills.length],
  )

  const moveBetweenDrills = useCallback(
    (direction: -1 | 1) => {
      setSelectedIndex((currentIndex) => {
        if (currentIndex === null) return currentIndex
        const nextIndex = currentIndex + direction
        if (nextIndex < 0 || nextIndex >= drills.length) return currentIndex
        window.requestAnimationFrame(() => modalContentRef.current?.scrollTo({ top: 0 }))
        return nextIndex
      })
    },
    [drills.length],
  )

  const launchWorkout = () => {
    setSelectedIndex(null)
    setWorkoutLaunchToken((token) => token + 1)
  }

  const workoutLabel =
    workoutStatus === 'not-started'
      ? 'Start workout'
      : workoutStatus === 'finished'
        ? 'Review workout'
        : 'Continue workout'

  useEffect(() => {
    if (!isModalOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const target = event.target as HTMLElement | null
        if (!target?.matches('input, textarea, select, [contenteditable="true"]')) {
          event.preventDefault()
          moveBetweenDrills(event.key === 'ArrowLeft' ? -1 : 1)
        }
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeModal, isModalOpen, moveBetweenDrills])

  if (!drills.length) return null

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-[#092c59]/10 bg-white shadow-[0_18px_40px_-34px_rgba(9,44,89,.55)]">
        {drills.map((drill, index) => (
          <button
            key={drill.id}
            type="button"
            className="group grid w-full grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#092c59]/8 p-4 text-left transition last:border-b-0 hover:bg-[#f8fbff] focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1677ff] sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-5 sm:p-5"
            onClick={(event) => openModal(index, event.currentTarget)}
            aria-label={`View details for ${drill.name}`}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eef3f8]">
              {drillIllustrationFor(drill) ? (
                <Image
                  src={drillIllustrationFor(drill)!}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-black text-[#1677ff]">
                  {index + 1}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[.14em] text-[#1677ff]">
                Drill {index + 1}
              </p>
              <h4 className="mt-1 text-base font-black leading-5 text-[#092c59] sm:text-lg">
                {drill.name}
              </h4>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold text-[#718399]">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-[#1677ff]" /> {drill.durationMinutes} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#1677ff]" />
                  {drill.numberOfPlayers === 1 ? 'Solo' : `${drill.numberOfPlayers} players`}
                </span>
                <span className="capitalize">{drill.difficulty}</span>
              </div>
            </div>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf3ff] text-[#1677ff] transition group-hover:translate-x-0.5 group-hover:bg-[#1677ff] group-hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </span>
          </button>
        ))}
      </div>

      {practiceID ? (
        <HomePracticeTimer
          practiceID={practiceID}
          drills={drills.map((drill) => ({
            ...drill,
            illustrationURL: drillIllustrationFor(drill),
          }))}
          initialStatus={initialTimerStatus}
          initialStartedAt={initialTimerStartedAt}
          initialElapsedSeconds={initialElapsedSeconds}
          initialCurrentDrillIndex={initialCurrentDrillIndex}
          initialCurrentDrillElapsedSeconds={initialCurrentDrillElapsedSeconds}
          initialCurrentStepIndex={initialCurrentStepIndex}
          initialCurrentRound={initialCurrentRound}
          initialCurrentStepElapsedSeconds={initialCurrentStepElapsedSeconds}
          initialExerciseLogs={initialExerciseLogs}
          initialCompleted={initialCompleted}
          launchToken={workoutLaunchToken}
          onStatusChange={setWorkoutStatus}
        />
      ) : null}

      {selectedDrill && selectedIndex !== null
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-end justify-center bg-[#071f42]/65 p-0 backdrop-blur-sm sm:items-center sm:p-6"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) closeModal()
              }}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`drill-modal-${selectedDrill.id}`}
                className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-[2rem]"
              >
                <div className="border-b border-[#092c59]/10 bg-[#f8fbff] px-5 pb-4 pt-5 sm:px-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">
                      Drill {selectedIndex + 1} of {drills.length}
                    </p>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={closeModal}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#092c59] shadow-sm transition hover:bg-[#092c59] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
                      aria-label="Close drill details"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4 flex gap-2" aria-label="Choose a drill">
                    {drills.map((item, index) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => showDrill(index)}
                        className={`h-2 flex-1 rounded-full transition hover:bg-[#78afff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff] ${index === selectedIndex ? 'bg-[#1677ff]' : 'bg-[#dbe6f2]'}`}
                        aria-label={`View drill ${index + 1}: ${item.name}`}
                        aria-current={index === selectedIndex ? 'step' : undefined}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => moveBetweenDrills(-1)}
                      disabled={selectedIndex === 0}
                      className="flex min-h-10 min-w-0 items-center gap-1.5 rounded-xl px-2 text-left text-xs font-black text-[#092c59] transition hover:bg-[#eaf3ff] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
                    >
                      <ChevronLeft className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {selectedIndex > 0 ? drills[selectedIndex - 1]?.name : 'Previous drill'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBetweenDrills(1)}
                      disabled={selectedIndex === drills.length - 1}
                      className="flex min-h-10 min-w-0 items-center justify-end gap-1.5 rounded-xl px-2 text-right text-xs font-black text-[#092c59] transition hover:bg-[#eaf3ff] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
                    >
                      <span className="truncate">
                        {selectedIndex < drills.length - 1
                          ? drills[selectedIndex + 1]?.name
                          : 'Next drill'}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </button>
                  </div>
                </div>

                <div ref={modalContentRef} className="overflow-y-auto">
                  <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="relative aspect-[4/3] bg-[#eef3f8] md:aspect-auto md:min-h-[330px]">
                      {drillIllustrationFor(selectedDrill) ? (
                        <Image
                          src={drillIllustrationFor(selectedDrill)!}
                          alt={`${selectedDrill.name} exercise illustration`}
                          fill
                          sizes="(max-width: 768px) 100vw, 260px"
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-[#1677ff]">
                          <Target className="h-12 w-12" />
                          <p className="max-w-[180px] text-sm font-black text-[#607286]">
                            Home practice drill
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-7">
                      <div className="flex flex-wrap gap-2 text-xs font-bold text-[#607286]">
                        <span className="rounded-full bg-[#eaf3ff] px-3 py-1.5 text-[#1677ff]">
                          {selectedDrill.durationMinutes} min
                        </span>
                        <span className="rounded-full bg-[#f3f7fc] px-3 py-1.5 capitalize">
                          {selectedDrill.difficulty}
                        </span>
                        <span className="rounded-full bg-[#f3f7fc] px-3 py-1.5 capitalize">
                          {selectedDrill.eventType}
                        </span>
                      </div>
                      <h3
                        id={`drill-modal-${selectedDrill.id}`}
                        className="mt-4 text-2xl font-black leading-tight text-[#092c59]"
                      >
                        {selectedDrill.name}
                      </h3>
                      {selectedVideoURL ? (
                        <a
                          href={selectedVideoURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 flex items-center gap-3 rounded-2xl border border-[#1677ff]/15 bg-[#eaf3ff] p-4 text-[#092c59] transition hover:border-[#1677ff]/35 hover:bg-[#dcecff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1677ff]">
                            <PlayCircle className="h-6 w-6" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#1677ff]">
                              Watch first
                            </span>
                            <strong className="mt-0.5 block text-sm">Technique tutorial</strong>
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-[#718399]" />
                        </a>
                      ) : null}
                      {selectedGeneratedSequence?.setup ? (
                        <div className="mt-4 rounded-2xl bg-[#f3f7fc] p-4">
                          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#1677ff]">
                            Setup
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#334b65]">
                            {selectedGeneratedSequence.setup}
                          </p>
                        </div>
                      ) : null}

                      {selectedSteps.length ? (
                        <div className="mt-4 space-y-3">
                          {selectedSteps.map((step, index) => (
                            <article
                              key={`${selectedDrill.id}-${index}-${step.title}`}
                              className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-[#092c59]/10 bg-[#f8fbff] p-3"
                            >
                              <PracticeStepIllustration
                                sheetURL={selectedSheetURL}
                                index={index}
                                columns={selectedSheetColumns}
                                rows={selectedSheetRows}
                                alt={`${step.title} illustration`}
                              />
                              <div className="min-w-0 py-0.5">
                                <div className="flex flex-wrap items-start justify-between gap-1.5">
                                  <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#1677ff]">
                                    {'kind' in step && step.kind === 'rest'
                                      ? 'Round break'
                                      : `Exercise ${index + 1}`}
                                  </p>
                                  <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-black text-[#1677ff]">
                                    {step.amount}
                                  </span>
                                </div>
                                <h4 className="mt-1 font-black leading-5 text-[#092c59]">
                                  {step.title}
                                </h4>
                                <p className="mt-1.5 text-sm leading-5 text-[#4f647b]">
                                  {step.instruction}
                                </p>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 whitespace-pre-line leading-7 text-[#334b65]">
                          {selectedDrill.instructions}
                        </p>
                      )}

                      {selectedGeneratedSequence?.workRest || selectedGeneratedSequence?.safety ? (
                        <div className="mt-4 grid gap-3">
                          {selectedGeneratedSequence.workRest ? (
                            <Detail
                              label="Work and rest"
                              value={selectedGeneratedSequence.workRest}
                              tone="blue"
                            />
                          ) : null}
                          {selectedGeneratedSequence.safety ? (
                            <Detail
                              label="Safety"
                              value={selectedGeneratedSequence.safety}
                              tone="amber"
                            />
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-5 rounded-2xl bg-[#eef9f3] p-4">
                        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#157347]">
                          <Target className="h-4 w-4" /> Success target
                        </p>
                        <p className="mt-2 font-semibold leading-6 text-[#24513b]">
                          {selectedGeneratedSequence?.successTarget || selectedDrill.successTarget}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-[#092c59]/10 p-5 sm:grid-cols-2 sm:p-7">
                    <Detail
                      label="Key coaching cue"
                      value={selectedDrill.coachingPoints}
                      tone="blue"
                    />
                    <Detail
                      label="Equipment"
                      value={selectedGeneratedSequence?.equipment || selectedDrill.equipment}
                    />
                    <Detail label="Avoid" value={selectedDrill.commonMistakes} tone="amber" />
                    <Detail
                      label="Make it easier"
                      value={
                        selectedGeneratedSequence?.easierVariation || selectedDrill.easierVariation
                      }
                    />
                    <Detail label="Next progression" value={selectedDrill.harderProgression} />
                    <Detail
                      label="Ready to complete when"
                      value={selectedDrill.completionRequirement}
                      tone="green"
                    />
                  </div>
                </div>

                <div className="border-t border-[#092c59]/10 bg-white p-4 sm:px-7">
                  {practiceID ? (
                    <div className="grid gap-2 sm:grid-cols-[1.35fr_1fr]">
                      <button
                        type="button"
                        onClick={launchWorkout}
                        className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-[#15191f] px-5 py-3.5 font-black text-white transition hover:bg-[#1677ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
                      >
                        <Play className="h-5 w-5 fill-current" />
                        {workoutLabel}
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="min-h-14 w-full rounded-full border-2 border-[#092c59] bg-white px-5 py-3.5 font-black text-[#092c59] transition hover:bg-[#f3f7fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
                      >
                        Back to practice
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full rounded-full bg-[#092c59] px-5 py-3.5 font-black text-white transition hover:bg-[#1677ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
                    >
                      Back to practice
                    </button>
                  )}
                  {practiceID ? (
                    <p className="mt-2 text-center text-xs font-semibold text-[#718399]">
                      Opens at your saved exercise and keeps drills in order.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function Detail({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value?: string | null
  tone?: 'neutral' | 'blue' | 'amber' | 'green'
}) {
  if (!value) return null

  const tones = {
    neutral: 'bg-[#f6f9fd] text-[#334b65]',
    blue: 'bg-[#eaf3ff] text-[#334b65]',
    amber: 'bg-[#fff7e6] text-[#5d4a24]',
    green: 'bg-[#eef9f3] text-[#24513b]',
  }

  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <p className="text-xs font-black uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-2 text-sm leading-6">{value}</p>
    </div>
  )
}
