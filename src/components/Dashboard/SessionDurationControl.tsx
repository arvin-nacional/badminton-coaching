'use client'

import { Clock3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  normalizeSessionDuration,
  sessionDurationOptions,
  type SessionDurationMinutes,
} from '@/utilities/sessionTiming'

const durationLabels: Record<SessionDurationMinutes, string> = {
  60: '1 hour',
  90: '90 minutes',
  120: '2 hours',
}

export function SessionDurationControl({
  sessionID,
  durationMinutes,
  durationIsOverride,
  programDurationMinutes,
}: {
  sessionID: string
  durationMinutes?: number | null
  durationIsOverride?: boolean | null
  programDurationMinutes?: number | null
}) {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState(
    normalizeSessionDuration(durationMinutes),
  )
  const [programDuration, setProgramDuration] = useState(
    normalizeSessionDuration(programDurationMinutes),
  )
  const [hasWeeklyOverride, setHasWeeklyOverride] = useState(Boolean(durationIsOverride))
  const [scope, setScope] = useState<'week' | 'program'>('week')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const updateDuration = (
    duration: SessionDurationMinutes,
    updateScope: 'week' | 'program' | 'reset' = scope,
  ) => {
    if (isPending) return
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/training-session-duration/${sessionID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: duration, scope: updateScope }),
      }).catch(() => null)
      const result = (await response?.json().catch(() => null)) as {
        durationIsOverride?: boolean
        durationMinutes?: number
        error?: string
        programDurationMinutes?: number
      } | null
      if (!response?.ok) {
        setMessage(result?.error || 'The duration could not be updated.')
        return
      }
      const nextDuration = normalizeSessionDuration(result?.durationMinutes ?? duration)
      const nextProgramDuration = normalizeSessionDuration(
        result?.programDurationMinutes ?? programDuration,
      )
      setSelectedDuration(nextDuration)
      setProgramDuration(nextProgramDuration)
      setHasWeeklyOverride(Boolean(result?.durationIsOverride))
      setMessage(
        updateScope === 'program'
          ? `All remaining sessions now use ${durationLabels[nextProgramDuration]}.`
          : updateScope === 'reset'
            ? `This week now uses the ${durationLabels[nextProgramDuration]} program default.`
            : `Only this week was adjusted to ${durationLabels[nextDuration]}.`,
      )
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/65">
          <Clock3 className="h-4 w-4" /> Training duration
        </div>
        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-white/70">
          {hasWeeklyOverride ? 'This week override' : 'Program default'}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 rounded-xl bg-[#092c59]/35 p-1">
        <button
          type="button"
          onClick={() => setScope('week')}
          aria-pressed={scope === 'week'}
          className={`rounded-lg px-3 py-2 text-xs font-black transition ${
            scope === 'week' ? 'bg-white text-[#092c59]' : 'text-white/65 hover:text-white'
          }`}
        >
          This week
        </button>
        <button
          type="button"
          onClick={() => setScope('program')}
          aria-pressed={scope === 'program'}
          className={`rounded-lg px-3 py-2 text-xs font-black transition ${
            scope === 'program' ? 'bg-white text-[#092c59]' : 'text-white/65 hover:text-white'
          }`}
        >
          All remaining weeks
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-white/55">
        {scope === 'week'
          ? 'Changes only the lesson currently being viewed.'
          : 'Changes the program default and clears unfinished weekly overrides.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sessionDurationOptions.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => updateDuration(duration)}
            disabled={isPending}
            aria-pressed={selectedDuration === duration}
            className={`rounded-full px-3 py-2 text-xs font-black transition disabled:cursor-wait disabled:opacity-60 ${
              selectedDuration === duration
                ? 'bg-[#4cc9ff] text-[#092c59]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {durationLabels[duration]}
          </button>
        ))}
      </div>
      {hasWeeklyOverride ? (
        <button
          type="button"
          onClick={() => updateDuration(programDuration, 'reset')}
          disabled={isPending}
          className="mt-3 text-xs font-black text-[#4cc9ff] underline decoration-[#4cc9ff]/40 underline-offset-4 disabled:opacity-60"
        >
          Use program default ({durationLabels[programDuration]})
        </button>
      ) : null}
      {message ? <p className="mt-2 text-xs font-semibold text-white/70">{message}</p> : null}
    </div>
  )
}
