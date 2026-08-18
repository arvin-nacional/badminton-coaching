'use client'

import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'

export type AssessmentSlot = {
  id: string
  startsAt: string
  durationMinutes: number
  coachName: string
}

export type ExistingAssessmentBooking = {
  durationMinutes: number
  location: string
  startsAt: string
}

const logisticsFeeNote =
  'Travel and logistics fees may apply for courts outside Metro Manila or venues requiring extended travel. Any additional charge will be discussed and confirmed before the session.'

const dateKey = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const weekday = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', weekday: 'short' })
const day = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', day: 'numeric' })
const month = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', month: 'short' })
const fullDate = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const time = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  hour: 'numeric',
  minute: '2-digit',
})

export function BookingForm({
  slots,
  isAuthenticated,
  displayName,
  existingBooking,
}: {
  slots: AssessmentSlot[]
  isAuthenticated: boolean
  displayName?: string
  existingBooking?: ExistingAssessmentBooking
}) {
  const dates = Array.from(new Set(slots.map((slot) => dateKey.format(new Date(slot.startsAt)))))
  const [selectedDate, setSelectedDate] = useState(dates[0] || '')
  const [selected, setSelected] = useState(slots[0]?.id || '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const visibleSlots = slots.filter(
    (slot) => dateKey.format(new Date(slot.startsAt)) === selectedDate,
  )
  const selectedSlot = slots.find((slot) => slot.id === selected)

  function chooseDate(value: string) {
    setSelectedDate(value)
    setSelected(slots.find((slot) => dateKey.format(new Date(slot.startsAt)) === value)?.id || '')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const response = await fetch('/api/assessment-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    })
    const result = await response.json().catch(() => ({}))
    setPending(false)
    if (!response.ok) return setError(result.error || 'We could not complete your booking.')
    setConfirmed(true)
  }

  if (confirmed)
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-[#1677ff]" />
        <h2 className="mt-5 text-3xl font-black">Your assessment is booked.</h2>
        <p className="mt-3 leading-7 text-[#586d84]">
          {isAuthenticated
            ? "We'll see you on court! Check your dashboard for the appointment details."
            : "We'll use the contact details you provided if anything changes. See you on court!"}
        </p>
        {isAuthenticated && (
          <Link
            href="/dashboard/student"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white"
          >
            Back to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    )

  if (existingBooking)
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-[#24734b]" />
        <h2 className="mt-5 text-3xl font-black">Your assessment is already booked.</h2>
        <div className="mt-6 grid gap-3 rounded-2xl bg-[#f3f7fc] p-5 text-sm font-bold text-[#607286] sm:grid-cols-3">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#1677ff]" />
            {fullDate.format(new Date(existingBooking.startsAt))}
          </span>
          <span className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#1677ff]" />
            {time.format(new Date(existingBooking.startsAt))} · {existingBooking.durationMinutes}{' '}
            minutes
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#1677ff]" />
            {existingBooking.location}
          </span>
        </div>
        <Link
          href="/dashboard/student"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white"
        >
          Back to dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )

  if (!slots.length)
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <CalendarDays className="h-10 w-10 text-[#1677ff]" />
        <h2 className="mt-5 text-2xl font-black">New times are coming soon.</h2>
        <p className="mt-3 leading-7 text-[#586d84]">
          The coach has no open assessment slots right now. Please check back shortly.
        </p>
      </div>
    )

  return (
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <section aria-labelledby="choose-time-heading" className="min-w-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">Step 1</p>
            <h2 id="choose-time-heading" className="mt-1 text-2xl font-black">
              Choose a time
            </h2>
          </div>
          <p className="text-sm text-[#607286]">Manila time</p>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-3" aria-label="Available dates">
          {dates.map((date) => {
            const value = new Date(
              slots.find((slot) => dateKey.format(new Date(slot.startsAt)) === date)!.startsAt,
            )
            const active = selectedDate === date
            return (
              <button
                key={date}
                type="button"
                onClick={() => chooseDate(date)}
                className={`min-w-[76px] rounded-2xl border-2 px-3 py-3 text-center transition ${
                  active
                    ? 'border-[#092c59] bg-[#092c59] text-white'
                    : 'border-white bg-white text-[#092c59] hover:border-[#1677ff]/40'
                }`}
              >
                <span className="block text-[11px] font-black uppercase tracking-wider opacity-70">
                  {weekday.format(value)}
                </span>
                <span className="mt-1 block text-2xl font-black leading-none">
                  {day.format(value)}
                </span>
                <span className="mt-1 block text-xs font-bold opacity-70">
                  {month.format(value)}
                </span>
              </button>
            )
          })}
        </div>
        <div className="mt-5 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[#1677ff]" />
            <h3 className="font-black">
              {visibleSlots[0]
                ? fullDate.format(new Date(visibleSlots[0].startsAt))
                : 'Select a date'}
            </h3>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visibleSlots.map((slot) => (
              <label
                key={slot.id}
                className={`cursor-pointer rounded-xl border-2 px-3 py-3 text-center text-sm font-black transition ${
                  selected === slot.id
                    ? 'border-[#1677ff] bg-[#eaf3ff] text-[#0b5fc7]'
                    : 'border-[#092c59]/10 hover:border-[#1677ff]/40'
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={selected === slot.id}
                  onChange={() => setSelected(slot.id)}
                />
                {time.format(new Date(slot.startsAt))}
              </label>
            ))}
          </div>
          {selectedSlot && (
            <div className="mt-6 grid gap-2 border-t border-[#092c59]/10 pt-5 text-sm text-[#607286] sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#1677ff]" />
                {selectedSlot.durationMinutes} minutes
              </span>
              <span className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#1677ff]" />
                {selectedSlot.coachName}
              </span>
            </div>
          )}
        </div>
      </section>

      {isAuthenticated ? (
        <section
          aria-labelledby="confirm-heading"
          className="rounded-[2rem] bg-white p-6 shadow-sm lg:sticky lg:top-28 md:p-8"
        >
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">Step 2</p>
          <h2 id="confirm-heading" className="mt-1 text-2xl font-black">
            Confirm your booking
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#718399]">
            {displayName
              ? `Booking as ${displayName}. We'll use the details from your profile.`
              : "We'll use the details from your profile."}
          </p>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Court you booked
              <input
                required
                name="location"
                maxLength={200}
                placeholder="Court name, branch, address and court number"
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
              <span className="text-xs font-normal leading-5 text-[#718399]">
                Coordinate and reserve the venue directly. Your coach will use this location to meet
                you.
              </span>
            </label>
            <p className="rounded-xl bg-[#fff6e8] px-4 py-3 text-xs font-semibold leading-5 text-[#8b6a31]">
              {logisticsFeeNote}
            </p>
            <label className="grid gap-2 text-sm font-bold">
              Notes for your coach (optional)
              <textarea
                name="notes"
                maxLength={1000}
                rows={4}
                placeholder="Anything your coach should know before the assessment?"
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
            </label>
            {error && (
              <p className="rounded-xl bg-[#fff0f0] p-3 text-sm font-semibold text-[#a53d3d]">
                {error}
              </p>
            )}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white disabled:opacity-60"
              disabled={pending || !selected}
              type="submit"
            >
              {pending ? 'Booking…' : 'Confirm assessment'}
            </button>
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="your-details-heading"
          className="rounded-[2rem] bg-white p-6 shadow-sm lg:sticky lg:top-28 md:p-8"
        >
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">Step 2</p>
          <h2 id="your-details-heading" className="mt-1 text-2xl font-black">
            Your details
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#718399]">
            Your answers help the coach prepare before you arrive.
          </p>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Court you booked
              <input
                required
                name="location"
                maxLength={200}
                placeholder="Court name, branch, address and court number"
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
              <span className="text-xs font-normal leading-5 text-[#718399]">
                Coordinate and reserve the venue directly. The coach will use this location to meet
                you.
              </span>
            </label>
            <p className="rounded-xl bg-[#fff6e8] px-4 py-3 text-xs font-semibold leading-5 text-[#8b6a31]">
              {logisticsFeeNote}
            </p>
            <label className="grid gap-2 text-sm font-bold">
              Name
              <input
                required
                name="playerName"
                maxLength={120}
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Email
              <input
                required
                name="email"
                type="email"
                maxLength={254}
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Phone (optional)
              <input
                name="phone"
                maxLength={40}
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">
                Playing experience
                <select
                  required
                  name="playingExperience"
                  defaultValue=""
                  className="rounded-xl border border-[#092c59]/20 bg-white px-4 py-3 font-normal"
                >
                  <option value="" disabled>
                    Select experience
                  </option>
                  <option value="new">New to badminton</option>
                  <option value="under-1-year">Less than 1 year</option>
                  <option value="1-3-years">1–3 years</option>
                  <option value="over-3-years">More than 3 years</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Preferred event
                <select
                  required
                  name="preferredEvent"
                  defaultValue=""
                  className="rounded-xl border border-[#092c59]/20 bg-white px-4 py-3 font-normal"
                >
                  <option value="" disabled>
                    Select event
                  </option>
                  <option value="singles">Singles</option>
                  <option value="doubles">Doubles</option>
                  <option value="both">Both</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-bold">
              Main goals
              <textarea
                required
                name="goals"
                maxLength={1000}
                rows={3}
                placeholder="What do you want to achieve?"
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Training availability
              <textarea
                required
                name="trainingAvailability"
                maxLength={500}
                rows={2}
                placeholder="When can you train each week?"
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Injury considerations (optional)
              <textarea
                name="injuryConsiderations"
                maxLength={1000}
                rows={2}
                placeholder="Any injuries or physical limitations?"
                className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
              />
            </label>
            {error && (
              <p className="rounded-xl bg-[#fff0f0] p-3 text-sm font-semibold text-[#a53d3d]">
                {error}
              </p>
            )}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white disabled:opacity-60"
              disabled={pending || !selected}
              type="submit"
            >
              {pending ? 'Booking…' : 'Book assessment'}
            </button>
            <p className="text-center text-sm text-[#607286]">
              Already have an account?{' '}
              <Link href="/login?redirect=/book-assessment" className="font-bold text-[#1677ff]">
                Sign in
              </Link>{' '}
              to skip the form.
            </p>
          </div>
        </section>
      )}
    </form>
  )
}
