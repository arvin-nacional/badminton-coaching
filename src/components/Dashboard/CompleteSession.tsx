'use client'

import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function CompleteSession({
  sessionID,
  assessedSkills,
  totalSkills,
  sessionsRemaining,
}: {
  sessionID: string
  assessedSkills: number
  totalSkills: number
  sessionsRemaining: number
}) {
  const router = useRouter()
  const [attendance, setAttendance] = useState<'present' | 'late'>('present')
  const [coachNotes, setCoachNotes] = useState('')
  const [studentSummary, setStudentSummary] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const remainingAssessments = Math.max(0, totalSkills - assessedSkills)

  const complete = () => {
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/complete-session/${sessionID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance, coachNotes, studentSummary }),
      }).catch(() => null)
      const result = await response?.json().catch(() => null) as { error?: string } | null
      if (!response?.ok) {
        setMessage(result?.error || 'The session could not be completed.')
        return
      }
      setMessage('Session completed. Opening the next lesson…')
      router.refresh()
    })
  }

  return (
    <div className="rounded-3xl border border-[#2b9f6a]/20 bg-[#eef9f3] p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex items-center gap-2 text-[#24734b]"><CheckCircle2 className="h-5 w-5" /><h3 className="font-black">Finish this session</h3></div><p className="mt-2 max-w-2xl text-sm leading-6 text-[#456b58]">Completing once advances the current program lesson and reduces the package from {sessionsRemaining} to {Math.max(0, sessionsRemaining - 1)} sessions.</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${remainingAssessments ? 'bg-[#fff6e8] text-[#8b6a31]' : 'bg-white text-[#24734b]'}`}>{assessedSkills}/{totalSkills} skills assessed</span></div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label><span className="text-xs font-black uppercase tracking-wider text-[#456b58]">Attendance</span><select value={attendance} onChange={(event) => setAttendance(event.target.value as 'present' | 'late')} className="mt-2 w-full rounded-xl border border-[#2b9f6a]/20 bg-white p-3 text-sm font-semibold outline-none"><option value="present">Present</option><option value="late">Late</option></select></label>
        <label><span className="text-xs font-black uppercase tracking-wider text-[#456b58]">Student summary</span><textarea value={studentSummary} onChange={(event) => setStudentSummary(event.target.value)} rows={3} placeholder="What should the student remember from today?" className="mt-2 w-full rounded-xl border border-[#2b9f6a]/20 bg-white p-3 text-sm leading-6 outline-none" /></label>
        <label className="lg:col-span-2"><span className="text-xs font-black uppercase tracking-wider text-[#456b58]">Private coach notes</span><textarea value={coachNotes} onChange={(event) => setCoachNotes(event.target.value)} rows={3} placeholder="Record adaptations, concerns or plans for the next session." className="mt-2 w-full rounded-xl border border-[#2b9f6a]/20 bg-white p-3 text-sm leading-6 outline-none" /></label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div>{remainingAssessments ? <p className="text-sm font-semibold text-[#8b6a31]">Assess the remaining {remainingAssessments} {remainingAssessments === 1 ? 'skill' : 'skills'} above before completing.</p> : <p className="text-sm font-semibold text-[#24734b]">All lesson skills are assessed. This session is ready to complete.</p>}{message ? <p className="mt-1 text-sm font-semibold text-[#b42318]">{message}</p> : null}</div><button type="button" onClick={complete} disabled={isPending || remainingAssessments > 0} className="inline-flex items-center gap-2 rounded-full bg-[#24734b] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"><CheckCircle2 className="h-4 w-4" /> {isPending ? 'Completing…' : 'Complete session and continue'}</button></div>
    </div>
  )
}
