'use client'

import { CheckCircle2, CircleMinus, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export type SkillScoreRow = {
  id: string
  skillName: string
  category: string
  status: 'pending' | 'scored' | 'not-assessed'
  score?: number | null
  evidence?: string | null
  nextFocus?: string | null
}

const rubric = [
  { score: 0, label: 'Not introduced' },
  { score: 1, label: 'Introduced' },
  { score: 2, label: 'Developing' },
  { score: 3, label: 'Controlled' },
  { score: 4, label: 'Game-ready' },
  { score: 5, label: 'Pressure-ready' },
]

function AssessmentStatus({ row }: { row: SkillScoreRow }) {
  if (row.status !== 'scored') {
    return <span className="rounded-full bg-[#fff6e8] px-2.5 py-1 text-[10px] font-black uppercase text-[#8b6a31]">Pending</span>
  }
  if (row.score === 0) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-black uppercase text-[#1677ff]"><CircleMinus className="h-3.5 w-3.5" /> Not introduced</span>
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f8ef] px-2.5 py-1 text-[10px] font-black uppercase text-[#24734b]"><CheckCircle2 className="h-3.5 w-3.5" /> Assessed</span>
}

function ScoreCard({ row }: { row: SkillScoreRow }) {
  const router = useRouter()
  const [score, setScore] = useState<number | null>(row.score ?? null)
  const [evidence, setEvidence] = useState(row.evidence || '')
  const [nextFocus, setNextFocus] = useState(row.nextFocus || '')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const save = () => {
    if (score === null) {
      setMessage('Choose a development level before saving.')
      return
    }
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/session-skill-score/${row.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, evidence, nextFocus }),
      }).catch(() => null)
      if (!response?.ok) {
        const result = await response?.json().catch(() => null) as { error?: string } | null
        setMessage(result?.error || 'The assessment could not be saved.')
        return
      }
      setMessage('Assessment saved and student progress updated.')
      router.refresh()
    })
  }

  return (
    <article className="rounded-3xl border border-[#092c59]/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-lg font-black text-[#092c59]">{row.skillName}</h3><p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#718399]">{row.category.replaceAll('-', ' ')}</p></div>
        <AssessmentStatus row={row} />
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-black uppercase tracking-wider text-[#607286]">Development level</legend>
        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">{rubric.map((level) => <button key={level.score} type="button" title={level.label} aria-label={`${level.score}: ${level.label}`} onClick={() => setScore(level.score)} className={`rounded-xl border px-2 py-2.5 text-center transition ${score === level.score ? 'border-[#1677ff] bg-[#1677ff] text-white' : 'border-[#092c59]/10 bg-[#f8fbff] text-[#607286] hover:border-[#1677ff]/35'}`}><span className="block text-sm font-black">{level.score}</span><span className="mt-0.5 hidden text-[8px] font-bold uppercase xl:block">{level.label}</span></button>)}</div>
        {score !== null ? <p className="mt-2 text-xs font-bold text-[#1677ff]">{rubric.find((level) => level.score === score)?.label} · {score * 20}%</p> : null}
      </fieldset>

      <label className="mt-5 block"><span className="text-xs font-black uppercase tracking-wider text-[#607286]">Evidence observed</span><textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} rows={3} placeholder="What did the player demonstrate?" className="mt-2 w-full resize-y rounded-xl border border-[#092c59]/10 bg-[#f8fbff] p-3 text-sm leading-6 outline-none transition focus:border-[#1677ff]" /></label>
      <label className="mt-4 block"><span className="text-xs font-black uppercase tracking-wider text-[#607286]">Next focus</span><textarea value={nextFocus} onChange={(event) => setNextFocus(event.target.value)} rows={2} placeholder="What should be trained next?" className="mt-2 w-full resize-y rounded-xl border border-[#092c59]/10 bg-[#f8fbff] p-3 text-sm leading-6 outline-none transition focus:border-[#1677ff]" /></label>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" disabled={isPending} onClick={save} className="inline-flex items-center gap-2 rounded-full bg-[#092c59] px-4 py-2.5 text-xs font-black text-white disabled:opacity-60"><Save className="h-4 w-4" /> {isPending ? 'Saving…' : row.status === 'scored' ? 'Update assessment' : 'Save assessment'}</button>{message ? <p className={`text-xs font-semibold ${message.startsWith('Assessment saved') ? 'text-[#24734b]' : 'text-[#b42318]'}`}>{message}</p> : null}</div>
    </article>
  )
}

export function SessionSkillScoring({ rows }: { rows: SkillScoreRow[] }) {
  return <div><div className="mb-5 rounded-2xl bg-[#f3f7fc] p-4"><p className="text-sm font-black text-[#092c59]">Assessment rubric</p><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#607286]">{rubric.map((level) => <span key={level.score}><strong>{level.score}</strong> {level.label}</span>)}</div><p className="mt-2 text-xs leading-5 text-[#718399]">Record what the player demonstrated today. Evidence and the next focus are shown in their development profile.</p></div><div className="grid gap-4 xl:grid-cols-2">{rows.map((row) => <ScoreCard key={row.id} row={row} />)}</div></div>
}
