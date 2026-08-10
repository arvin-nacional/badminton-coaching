'use client'

import { ClipboardCheck, LoaderCircle } from 'lucide-react'
import { useState } from 'react'

export function StartAssessmentButton({ studentID }: { studentID: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function startAssessment() {
    setPending(true)
    setError('')
    const response = await fetch(`/api/student-profiles/${studentID}/assessment`, {
      method: 'POST',
    }).catch(() => null)
    const result = (await response?.json().catch(() => null)) as {
      assessmentID?: string
      error?: string
    } | null
    if (!response?.ok || !result?.assessmentID) {
      setError(result?.error || 'The assessment could not be started.')
      setPending(false)
      return
    }
    window.location.assign(`/dashboard/coach/assessments/${result.assessmentID}`)
  }

  return (
    <div>
      <button
        type="button"
        onClick={startAssessment}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-[#1677ff] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <ClipboardCheck className="h-4 w-4" />
        )}
        {pending ? 'Starting…' : 'Start assessment'}
      </button>
      {error ? <p className="mt-2 max-w-xs text-xs font-bold text-[#b42318]">{error}</p> : null}
    </div>
  )
}
