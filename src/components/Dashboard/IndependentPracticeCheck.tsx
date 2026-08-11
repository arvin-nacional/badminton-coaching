'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function IndependentPracticeCheck({
  practiceID,
  initialCompleted,
}: {
  practiceID: string
  initialCompleted: boolean
}) {
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const updateCompletion = (checked: boolean) => {
    const previous = completed
    setCompleted(checked)
    setError('')

    startTransition(async () => {
      const response = await fetch(`/api/independent-practice/${practiceID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: checked }),
      }).catch(() => null)

      if (!response?.ok) {
        setCompleted(previous)
        setError('We could not save this change. Please try again.')
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="mt-5 border-t border-[#092c59]/10 pt-5">
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${completed ? 'border-[#2b9f6a]/30 bg-[#e9f8ef] text-[#24734b]' : 'border-[#1677ff]/20 bg-[#eaf3ff] text-[#092c59]'}`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={completed}
          disabled={isPending}
          onChange={(event) => updateCompletion(event.target.checked)}
        />
        {completed ? (
          <CheckCircle2 className="h-6 w-6 shrink-0" />
        ) : (
          <Circle className="h-6 w-6 shrink-0 text-[#1677ff]" />
        )}
        <span>
          <strong className="block">
            {completed ? 'Home practice completed' : 'Mark home practice as done'}
          </strong>
          <span className="mt-0.5 block text-xs opacity-70">
            {isPending
              ? 'Saving…'
              : completed
                ? 'Tap again if you need to reopen it.'
                : 'Your coach will see this on their dashboard.'}
          </span>
        </span>
      </label>
      {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
    </div>
  )
}
