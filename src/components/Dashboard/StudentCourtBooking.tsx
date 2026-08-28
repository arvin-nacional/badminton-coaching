'use client'

import {
  CalendarDays,
  CircleDollarSign,
  HandHelping,
  MapPin,
  Save,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  expectedCourtFeeRange,
  expectedTotalRange,
  formatPeso,
  formatPesoRange,
  sessionCoachingFee,
  type CoachingPricing,
} from '@/utilities/coachingPricing'

const localDateTimeValue = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

export function StudentCourtBooking({
  cancellationNoticeHours,
  courtHelpArea,
  courtHelpPreferredAt,
  courtHelpRequested,
  durationMinutes,
  location,
  pricing,
  scheduledAt,
  serviceArea,
  sessionID,
  termsURL,
  title,
  travelPolicy,
}: {
  cancellationNoticeHours?: number | null
  courtHelpArea?: string | null
  courtHelpPreferredAt?: string | null
  courtHelpRequested?: boolean | null
  durationMinutes: number
  location?: string | null
  pricing?: CoachingPricing | null
  scheduledAt?: string | null
  serviceArea?: string | null
  sessionID: string
  termsURL?: string | null
  title: string
  travelPolicy?: string | null
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'booked' | 'help'>(courtHelpRequested ? 'help' : 'booked')
  const [court, setCourt] = useState(location || '')
  const [preferredArea, setPreferredArea] = useState(courtHelpArea || '')
  const [dateTime, setDateTime] = useState(
    localDateTimeValue(courtHelpRequested ? courtHelpPreferredAt : scheduledAt),
  )
  const [message, setMessage] = useState('')
  const [succeeded, setSucceeded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const coachingFee = sessionCoachingFee(durationMinutes, pricing)
  const courtRange = expectedCourtFeeRange(durationMinutes, pricing)
  const totalRange = expectedTotalRange(coachingFee, durationMinutes, pricing)
  const detailsValid = mode === 'help' ? preferredArea.trim().length >= 3 : court.trim().length >= 3

  const saveBooking = () => {
    setMessage('')
    setSucceeded(false)
    startTransition(async () => {
      const response = await fetch(`/api/training-session-booking/${sessionID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'help'
            ? {
                mode,
                preferredArea,
                preferredAt: dateTime ? new Date(dateTime).toISOString() : null,
              }
            : {
                mode,
                location: court,
                scheduledAt: dateTime ? new Date(dateTime).toISOString() : null,
              },
        ),
      })
      const result = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        setMessage(result?.error || 'The court details could not be saved.')
        return
      }

      setSucceeded(true)
      setMessage(
        mode === 'help'
          ? 'Court help requested. Your coach can now coordinate venue options with you before you pay.'
          : 'Court booking saved. Your coach can now see when and where to meet you.',
      )
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
          Confirm a court you already reserved, or ask for help finding a suitable venue before you
          pay.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#092c59]/10 bg-white p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#718399]">
            <CircleDollarSign className="h-3.5 w-3.5 text-[#1677ff]" /> Coaching
          </p>
          <p className="mt-1 text-lg font-black text-[#092c59]">{formatPeso(coachingFee)}</p>
        </div>
        <div className="rounded-xl border border-[#092c59]/10 bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#718399]">
            Typical total
          </p>
          <p className="mt-1 text-lg font-black text-[#092c59]">{formatPesoRange(totalRange)}</p>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#718399]">
        Includes the coaching fee plus an estimated {formatPesoRange(courtRange)} court rental. The
        venue may charge entrance, parking, equipment, or shuttle fees separately.
      </p>

      <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#eaf3ff] p-1">
        <button
          type="button"
          aria-pressed={mode === 'booked'}
          onClick={() => setMode('booked')}
          className={`rounded-lg px-3 py-2.5 text-xs font-black transition ${
            mode === 'booked' ? 'bg-white text-[#092c59] shadow-sm' : 'text-[#607286]'
          }`}
        >
          I have a court
        </button>
        <button
          type="button"
          aria-pressed={mode === 'help'}
          onClick={() => setMode('help')}
          className={`rounded-lg px-3 py-2.5 text-xs font-black transition ${
            mode === 'help' ? 'bg-white text-[#092c59] shadow-sm' : 'text-[#607286]'
          }`}
        >
          I need help finding a court
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="block">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-[#607286]">
            <CalendarDays className="h-4 w-4 text-[#1677ff]" />{' '}
            {mode === 'help' ? 'Preferred date and time' : 'Reserved date and time'}
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
            {mode === 'help' ? (
              <HandHelping className="h-4 w-4 text-[#1677ff]" />
            ) : (
              <MapPin className="h-4 w-4 text-[#1677ff]" />
            )}{' '}
            {mode === 'help' ? 'Where would you like to train?' : 'Booked court'}
          </span>
          <input
            type="text"
            required
            maxLength={200}
            value={mode === 'help' ? preferredArea : court}
            onChange={(event) =>
              mode === 'help' ? setPreferredArea(event.target.value) : setCourt(event.target.value)
            }
            placeholder={
              mode === 'help'
                ? `City or neighborhood${serviceArea ? ` within ${serviceArea}` : ''}`
                : 'Court name, branch, address and court number'
            }
            className="mt-2 w-full rounded-xl border border-[#092c59]/15 bg-white px-4 py-3 text-sm font-bold text-[#092c59] outline-none transition placeholder:font-medium placeholder:text-[#91a0b1] focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/10"
          />
        </label>
        <div className="rounded-xl bg-[#eef8f2] px-4 py-3 text-xs font-semibold leading-5 text-[#24513b]">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {travelPolicy ||
                'Any travel or logistics charge is discussed and approved before the session is confirmed.'}
            </span>
          </p>
          <p className="mt-2">
            Free coaching-fee rescheduling with at least {cancellationNoticeHours || 24} hours’
            notice.{' '}
            <Link href={termsURL || '/terms'} className="font-black underline underline-offset-2">
              Read the policy
            </Link>
            .
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={isPending || !dateTime || !detailsValid}
        onClick={saveBooking}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1677ff] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {mode === 'help' ? <HandHelping className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {isPending
          ? 'Saving…'
          : mode === 'help'
            ? 'Request court help'
            : scheduledAt
              ? 'Update court booking'
              : 'Confirm this court'}
      </button>
      {message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm font-bold ${succeeded ? 'text-[#24734b]' : 'text-[#b42318]'}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
