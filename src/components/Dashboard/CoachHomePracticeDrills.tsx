'use client'

import { ShieldCheck, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { PracticeStepIllustration } from '@/components/Dashboard/PracticeStepIllustration'
import { buildHomePracticeSequence } from '@/data/homePracticeSteps'
import type { Drill } from '@/payload-types'
import { drillIllustrationFor } from '@/utilities/drillIllustration'

type CoachPracticeDrill = Pick<
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
  | 'instructions'
  | 'equipment'
  | 'successTarget'
>

export function CoachHomePracticeDrills({
  drills,
  detailed = false,
}: {
  drills: CoachPracticeDrill[]
  detailed?: boolean
}) {
  const [selectedDrill, setSelectedDrill] = useState<CoachPracticeDrill | null>(null)

  useEffect(() => {
    if (!selectedDrill) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDrill(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedDrill])

  const sequence = selectedDrill
    ? buildHomePracticeSequence(selectedDrill.name, selectedDrill.instructions)
    : null
  const steps = selectedDrill
    ? sequence?.steps?.length
      ? sequence.steps
      : selectedDrill.practiceSteps || []
    : []
  const sheetURL = selectedDrill
    ? selectedDrill.stepIllustrationURL || sequence?.sheetURL || drillIllustrationFor(selectedDrill)
    : null
  const columns = Math.max(1, selectedDrill?.stepIllustrationColumns || sequence?.columns || 1)
  const rows = Math.max(1, selectedDrill?.stepIllustrationRows || sequence?.rows || 1)
  const exerciseCount = steps.filter((step) => !('kind' in step) || step.kind !== 'rest').length

  return (
    <>
      <div className="space-y-3">
        {drills.map((drill, index) => {
          const illustrationURL = drillIllustrationFor(drill)
          return (
            <button
              key={drill.id}
              type="button"
              onClick={() => setSelectedDrill(drill)}
              className="flex w-full gap-4 rounded-2xl border border-[#092c59]/10 bg-white p-3 text-left transition hover:border-[#1677ff]/40 hover:bg-[#f8fbff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff]"
            >
              <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-[#eef3f9]">
                {illustrationURL ? (
                  <Image
                    src={illustrationURL}
                    alt={`${drill.name} illustration`}
                    fill
                    sizes="112px"
                    className="object-contain"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-bold text-[#718399]">
                    No image
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 py-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#1677ff]">
                      Drill {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-black text-[#092c59]">{drill.name}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-black text-[#1677ff]">
                    {drill.durationMinutes} min
                  </span>
                </div>
                {detailed ? (
                  <>
                    <p className="mt-2 text-xs leading-5 text-[#607286]">
                      <strong>Equipment:</strong> {drill.equipment}
                    </p>
                    <p className="mt-1 text-xs font-bold leading-5 text-[#092c59]">
                      Target: {drill.successTarget}
                    </p>
                  </>
                ) : null}
                <p className="mt-2 text-xs font-black text-[#1677ff]">View exercises →</p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedDrill && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#092c59]/70 p-3 sm:p-6"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setSelectedDrill(null)
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={`coach-drill-${selectedDrill.id}`}
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                <header className="flex items-start justify-between gap-4 border-b border-[#092c59]/10 px-5 py-4 sm:px-7">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#1677ff]">
                      {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'} ·{' '}
                      {sequence?.rounds || 1} {sequence?.rounds === 1 ? 'round' : 'rounds'}
                    </p>
                    <h2
                      id={`coach-drill-${selectedDrill.id}`}
                      className="mt-1 text-xl font-black text-[#092c59] sm:text-2xl"
                    >
                      {selectedDrill.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDrill(null)}
                    aria-label="Close exercise details"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f7fc] text-[#092c59] transition hover:bg-[#eaf3ff]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

                <div className="overflow-y-auto p-5 sm:p-7">
                  {sequence?.setup ? (
                    <div className="rounded-2xl bg-[#f3f7fc] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#1677ff]">
                        Setup
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#334b65]">{sequence.setup}</p>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    {steps.length ? (
                      steps.map((step, index) => (
                        <article
                          key={`${selectedDrill.id}-${index}-${step.title}`}
                          className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-2xl border border-[#092c59]/10 bg-[#f8fbff] p-3 sm:grid-cols-[112px_minmax(0,1fr)]"
                        >
                          <PracticeStepIllustration
                            sheetURL={sheetURL}
                            index={index}
                            columns={columns}
                            rows={rows}
                            alt={`${step.title} illustration`}
                          />
                          <div className="min-w-0 py-0.5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#1677ff]">
                                {'kind' in step && step.kind === 'rest'
                                  ? 'Round break'
                                  : `Exercise ${index + 1}`}
                              </p>
                              <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-black text-[#1677ff]">
                                {step.amount}
                              </span>
                            </div>
                            <h3 className="mt-1 font-black text-[#092c59]">{step.title}</h3>
                            <p className="mt-1.5 text-sm leading-5 text-[#4f647b]">
                              {step.instruction}
                            </p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <p className="whitespace-pre-line text-sm leading-6 text-[#334b65]">
                        {selectedDrill.instructions}
                      </p>
                    )}
                  </div>

                  {sequence?.workRest ? (
                    <div className="mt-4 rounded-2xl bg-[#eaf3ff] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#1677ff]">
                        Work and rest
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#334b65]">{sequence.workRest}</p>
                    </div>
                  ) : null}
                  {sequence?.safety ? (
                    <div className="mt-3 rounded-2xl bg-[#fff6e8] p-4">
                      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#9a5b00]">
                        <ShieldCheck className="h-4 w-4" /> Safety
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#624718]">{sequence.safety}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
