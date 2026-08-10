'use client'

import { CalendarDays, CheckCircle2, Clock3, MapPin, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'

export type AssessmentSlot = { id: string; startsAt: string; durationMinutes: number; location: string; coachName: string }

const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' })
const weekday = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', weekday: 'short' })
const day = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', day: 'numeric' })
const month = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', month: 'short' })
const fullDate = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric' })
const time = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' })

export function BookingForm({ slots }: { slots: AssessmentSlot[] }) {
  const dates = Array.from(new Set(slots.map((slot) => dateKey.format(new Date(slot.startsAt)))))
  const [selectedDate, setSelectedDate] = useState(dates[0] || '')
  const [selected, setSelected] = useState(slots[0]?.id || '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const visibleSlots = slots.filter((slot) => dateKey.format(new Date(slot.startsAt)) === selectedDate)
  const selectedSlot = slots.find((slot) => slot.id === selected)

  function chooseDate(value: string) {
    setSelectedDate(value)
    setSelected(slots.find((slot) => dateKey.format(new Date(slot.startsAt)) === value)?.id || '')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('')
    const response = await fetch('/api/assessment-bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) })
    const result = await response.json().catch(() => ({})); setPending(false)
    if (!response.ok) return setError(result.error || 'We could not complete your booking.')
    setConfirmed(true)
  }

  if (confirmed) return <div className="rounded-[2rem] bg-white p-8 shadow-sm"><CheckCircle2 className="h-12 w-12 text-[#1677ff]" /><h2 className="mt-5 text-3xl font-black">Your assessment is booked.</h2><p className="mt-3 leading-7 text-[#586d84]">We’ll use the contact details you provided if anything changes. See you on court!</p></div>
  if (!slots.length) return <div className="rounded-[2rem] bg-white p-8 shadow-sm"><CalendarDays className="h-10 w-10 text-[#1677ff]" /><h2 className="mt-5 text-2xl font-black">New times are coming soon.</h2><p className="mt-3 leading-7 text-[#586d84]">The coach has no open assessment slots right now. Please check back shortly.</p></div>

  return <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr]">
    <section aria-labelledby="choose-time-heading" className="min-w-0">
      <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">Step 1</p><h2 id="choose-time-heading" className="mt-1 text-2xl font-black">Choose a time</h2></div><p className="text-sm text-[#607286]">Manila time</p></div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-3" aria-label="Available dates">{dates.map((date) => {
        const value = new Date(slots.find((slot) => dateKey.format(new Date(slot.startsAt)) === date)!.startsAt)
        const active = selectedDate === date
        return <button key={date} type="button" onClick={() => chooseDate(date)} className={`min-w-[76px] rounded-2xl border-2 px-3 py-3 text-center transition ${active ? 'border-[#092c59] bg-[#092c59] text-white' : 'border-white bg-white text-[#092c59] hover:border-[#1677ff]/40'}`}><span className="block text-[11px] font-black uppercase tracking-wider opacity-70">{weekday.format(value)}</span><span className="mt-1 block text-2xl font-black leading-none">{day.format(value)}</span><span className="mt-1 block text-xs font-bold opacity-70">{month.format(value)}</span></button>
      })}</div>
      <div className="mt-5 rounded-[2rem] bg-white p-6 shadow-sm md:p-8"><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-[#1677ff]" /><h3 className="font-black">{visibleSlots[0] ? fullDate.format(new Date(visibleSlots[0].startsAt)) : 'Select a date'}</h3></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{visibleSlots.map((slot) => <label key={slot.id} className={`cursor-pointer rounded-xl border-2 px-3 py-3 text-center text-sm font-black transition ${selected === slot.id ? 'border-[#1677ff] bg-[#eaf3ff] text-[#0b5fc7]' : 'border-[#092c59]/10 hover:border-[#1677ff]/40'}`}><input className="sr-only" type="radio" name="slot" value={slot.id} checked={selected === slot.id} onChange={() => setSelected(slot.id)} />{time.format(new Date(slot.startsAt))}</label>)}</div>
        {selectedSlot && <div className="mt-6 grid gap-2 border-t border-[#092c59]/10 pt-5 text-sm text-[#607286] sm:grid-cols-3"><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1677ff]" />{selectedSlot.durationMinutes} minutes</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#1677ff]" />{selectedSlot.location}</span><span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#1677ff]" />{selectedSlot.coachName}</span></div>}
      </div>
    </section>
    <section aria-labelledby="your-details-heading" className="rounded-[2rem] bg-white p-6 shadow-sm lg:sticky lg:top-28 md:p-8"><p className="text-xs font-black uppercase tracking-[.16em] text-[#1677ff]">Step 2</p><h2 id="your-details-heading" className="mt-1 text-2xl font-black">Your details</h2><div className="mt-6 grid gap-5"><label className="grid gap-2 text-sm font-bold">Name<input required name="playerName" maxLength={120} className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal" /></label><label className="grid gap-2 text-sm font-bold">Email<input required name="email" type="email" maxLength={254} className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal" /></label><label className="grid gap-2 text-sm font-bold">Phone (optional)<input name="phone" maxLength={40} className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal" /></label><label className="grid gap-2 text-sm font-bold">What would you like help with? (optional)<textarea name="notes" maxLength={1000} rows={4} className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal" /></label>{error && <p role="alert" className="text-sm font-bold text-[#b42318]">{error}</p>}<button disabled={pending || !selected} className="coach-button-primary disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Booking…' : 'Confirm assessment'}</button></div></section>
  </form>
}
