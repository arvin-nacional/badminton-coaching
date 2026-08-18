'use client'

import { CalendarDays, Search, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export type CoachRosterRow = {
  studentID: string
  name: string
  program: string
  phase: string
  currentWeek: number
  lessonTitle: string
  sessionStatus: 'planned' | 'scheduled' | 'missing'
  scheduledAt?: string | null
  attendance: number
  sessionsRemaining: number
  assessmentRequired: boolean
}

const groupCopy = {
  scheduled: {
    label: 'Scheduled next',
    description: 'Calendar confirmed',
    tone: 'bg-[#e9f8ef] text-[#24734b]',
  },
  planned: {
    label: 'Awaiting court booking',
    description: 'Student has the program plan and books the venue',
    tone: 'bg-[#eaf3ff] text-[#1677ff]',
  },
  missing: {
    label: 'Needs setup',
    description: 'Assign a coach and program',
    tone: 'bg-[#fff6e8] text-[#8b6a31]',
  },
}

export function CoachRoster({ rows }: { rows: CoachRosterRow[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | CoachRosterRow['sessionStatus']>('all')
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        `${row.name} ${row.program} ${row.phase} ${row.lessonTitle}`
          .toLowerCase()
          .includes(normalizedQuery)
      return matchesQuery && (filter === 'all' || row.sessionStatus === filter)
    })
  }, [filter, query, rows])
  const groups = (['scheduled', 'planned', 'missing'] as const)
    .map((status) => ({ status, rows: filteredRows.filter((row) => row.sessionStatus === status) }))
    .filter((group) => group.rows.length)

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-[#092c59]/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#092c59]/10 bg-[#f8fbff] px-4 py-3 xl:max-w-md">
          <Search className="h-4 w-4 shrink-0 text-[#718399]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student, program or lesson"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#91a0b1]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'scheduled', 'planned', 'missing'] as const).map((value) => {
            const count =
              value === 'all'
                ? rows.length
                : rows.filter((row) => row.sessionStatus === value).length
            const labels = {
              all: 'All students',
              scheduled: 'Scheduled',
              planned: 'Awaiting booking',
              missing: 'Needs setup',
            }
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${filter === value ? 'bg-[#092c59] text-white' : 'bg-[#f3f7fc] text-[#607286] hover:bg-[#eaf3ff]'}`}
              >
                {labels[value]} · {count}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {groups.map((group) => {
          const copy = groupCopy[group.status]
          return (
            <section key={group.status}>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h3 className="font-black text-[#092c59]">{copy.label}</h3>
                  <p className="mt-0.5 text-xs text-[#718399]">{copy.description}</p>
                </div>
                <span className="text-xs font-bold text-[#718399]">
                  {group.rows.length} {group.rows.length === 1 ? 'student' : 'students'}
                </span>
              </div>
              <div className="space-y-2">
                {group.rows.map((row) => (
                  <Link
                    key={row.studentID}
                    href={`/dashboard/coach/students/${row.studentID}`}
                    className="grid gap-4 rounded-2xl border border-[#092c59]/10 bg-white p-4 transition hover:border-[#1677ff]/35 hover:bg-[#f8fbff] md:grid-cols-[minmax(180px,1fr)_minmax(260px,1.5fr)_minmax(150px,.7fr)_auto] md:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-[#1677ff]">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-[#092c59]">{row.name}</p>
                          {row.assessmentRequired ? (
                            <span className="rounded-full bg-[#fff6e8] px-2 py-0.5 text-[9px] font-black uppercase text-[#8b6a31]">
                              Assessment
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-[#718399]">
                          {row.program} · {row.phase}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#718399]">
                        Current lesson · Week {row.currentWeek}
                      </p>
                      <p className="mt-1 font-bold text-[#213b58]">{row.lessonTitle}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${copy.tone}`}
                      >
                        {group.status}
                      </span>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-[#718399]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {row.scheduledAt
                          ? new Intl.DateTimeFormat('en-PH', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(row.scheduledAt))
                          : group.status === 'planned'
                            ? 'Waiting for student'
                            : 'No session plan'}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold text-[#607286]">
                        {row.attendance}% attendance
                      </p>
                      <p className="mt-1 text-xs text-[#718399]">
                        {row.sessionsRemaining} package sessions
                      </p>
                      <span className="mt-2 inline-flex text-xs font-black text-[#1677ff]">
                        Open workspace →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
        {!groups.length ? (
          <p className="rounded-2xl border border-dashed border-[#9db1c8] p-5 text-sm text-[#718399]">
            No students match this search or filter.
          </p>
        ) : null}
      </div>
    </div>
  )
}
