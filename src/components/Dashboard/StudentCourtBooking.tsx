'use client'

import { CalendarDays, MapPin, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

const localDateTimeValue = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

export function StudentCourtBooking({
  durationMinutes,
  location,
  scheduledAt,
  sessionID,
  title,
}: {
  durationMinutes: number
  location?: string | null
  scheduledAt?: string | null
  sessionID: string
  title: string
}) {
  const router = useRouter()
  const [court, setCourt] = useState(location || '')
  const [dateTime, setDateTime] = useState(localDateTimeValue(scheduledAt))
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const saveBooking = () => {
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/training-session-booking/${sessionID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: court,
          scheduledAt: dateTime ? new Date(dateTime).toISOString() : null,
        }),
      })
      const result = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        setMessage(result?.error || 'The court booking could not be saved.')
        return
      }

      setMessage('Court booking saved. Your coach can now see when and where to meet you.')
      router.refresh()
    })
  }

  return (
    <div>
      <div className="rounded-2xl bg-[#f3f7fc] p-4">
        <p className="text-xs font-black uppercase tracking-[.12em] text-[#1677ff]">
          {durationMinutes}-minute training session
        </p>
        <h3 className="mt-1 font-black text-[#092c59]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#607286]">
          Reserve and pay for the court directly with the venue first. Then confirm the exact court
          and time here so your coach knows where to go.
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="block">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-[#607286]">
            <CalendarDays className="h-4 w-4 text-[#1677ff]" /> Reserved date and time
          </span>
          <input
            type="datetime-local"
            required
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[#092c59]/15 bg-white px-4 py-3 text-sm font-bold text-[#092c59] outline-none transition focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/10"
          />
        </label>
        <label className="block">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-[#607286]">
            <MapPin className="h-4 w-4 text-[#1677ff]" /> Booked court
          </span>
          <input
            type="text"
            required
            maxLength={200}
            value={court}
            onChange={(event) => setCourt(event.target.value)}
            placeholder="Court name, branch, address and court number"
            className="mt-2 w-full rounded-xl border border-[#092c59]/15 bg-white px-4 py-3 text-sm font-bold text-[#092c59] outline-none transition placeholder:font-medium placeholder:text-[#91a0b1] focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/10"
          />
        </label>
        <p className="rounded-xl bg-[#fff6e8] px-4 py-3 text-xs font-semibold leading-5 text-[#8b6a31]">
          Travel and logistics fees may apply for courts outside Metro Manila or venues requiring
          extended travel. Any additional charge will be discussed and confirmed before the session.
        </p>
      </div>

      <button
        type="button"
        disabled={isPending || !dateTime || court.trim().length < 3}
        onClick={saveBooking}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1677ff] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Save className="h-4 w-4" />
        {isPending ? 'Saving…' : scheduledAt ? 'Update court booking' : 'I booked this court'}
      </button>
      {message ? (
        <p
          className={`mt-3 text-sm font-bold ${
            message.startsWith('Court booking saved') ? 'text-[#24734b]' : 'text-[#b42318]'
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
