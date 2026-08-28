import type { Metadata } from 'next'
import Link from 'next/link'

import { assessmentCoachingFee, formatPeso, formatPesoRange } from '@/utilities/coachingPricing'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const metadata: Metadata = {
  title: 'Terms, pricing, and cancellation | Next Shot',
  description: 'Next Shot coaching fees, venue costs, service area, and reschedule policy.',
}

export default async function TermsPage() {
  const settings = await getCachedGlobal('coaching-settings')()
  const courtRange: [number, number] = [
    settings.pricing.courtFeeMinPerHourPHP,
    settings.pricing.courtFeeMaxPerHourPHP,
  ]

  return (
    <main className="bg-[#f7faff] px-5 py-20 text-[#071f42] md:px-10 md:py-28">
      <article className="mx-auto max-w-4xl">
        <p className="coach-eyebrow">Terms and booking policy</p>
        <h1 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.05em] md:text-7xl">
          Clear costs and fair schedule changes.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#586d84]">
          Review the coaching fee, likely venue cost, service area, and cancellation rules before
          confirming your session.
        </p>

        <div className="mt-12 grid gap-5">
          <section className="rounded-[1.75rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Coaching prices</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Price label="Assessment · 60 min" value={assessmentCoachingFee(settings.pricing)} />
              <Price label="Private · 60 min" value={settings.pricing.session60PHP} />
              <Price label="Private · 90 min" value={settings.pricing.session90PHP} />
              <Price label="Private · 120 min" value={settings.pricing.session120PHP} />
            </div>
            <p className="mt-5 text-sm leading-6 text-[#607286]">{settings.pricing.billingNote}</p>
            <p className="mt-3 text-sm leading-6 text-[#607286]">{settings.pricing.courtFeeNote}</p>
          </section>

          <section className="rounded-[1.75rem] bg-[#eaf3ff] p-7">
            <h2 className="text-2xl font-black">Court and total cost</h2>
            <p className="mt-4 leading-7 text-[#334b65]">
              A typical court in the current published range is{' '}
              <strong>{formatPesoRange(courtRange)} per hour</strong>. The booking page combines the
              coaching fee and estimated court cost for the selected duration. Entrance fees,
              parking, racket hire, and shuttlecocks may be additional.
            </p>
            <p className="mt-3 leading-7 text-[#334b65]">
              The final coaching fee is confirmed by Next Shot. The venue confirms and collects its
              own charges directly unless you are explicitly told otherwise in writing.
            </p>
          </section>

          <section className="rounded-[1.75rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Venue and service area</h2>
            <p className="mt-4 leading-7 text-[#586d84]">{settings.service.details}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-[#586d84]">
              {(settings.service.venueOptions || []).map((item) => (
                <li key={item.id || item.option}>{item.option}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-[#eef8f2] p-4 text-sm leading-6 text-[#24513b]">
              {settings.service.travelPolicy}
            </p>
          </section>

          <section className="rounded-[1.75rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Cancellation and rescheduling</h2>
            <div className="mt-4 space-y-3 leading-7 text-[#586d84]">
              <p>{settings.cancellation.reschedulePolicy}</p>
              <p>{settings.cancellation.latePolicy}</p>
              <p>{settings.cancellation.coachCancellationPolicy}</p>
              <p>{settings.cancellation.venuePolicy}</p>
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Safety and player responsibility</h2>
            <p className="mt-4 leading-7 text-[#586d84]">
              Share relevant limitations before training, stop if you feel pain or become unwell,
              and seek medical guidance when appropriate. Coaching is not medical treatment. Players
              are responsible for following venue rules and using suitable footwear and equipment.
            </p>
          </section>

          <section className="rounded-[1.75rem] bg-[#092c59] p-7 text-white">
            <h2 className="text-2xl font-black">Questions before booking?</h2>
            <p className="mt-3 leading-7 text-white/70">
              Ask about a fee, venue, schedule, or policy before confirming. If you need a court,
              use “I need help finding a court” during booking.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={settings.contact.url}
                className="rounded-full bg-[#4cc9ff] px-5 py-3 text-sm font-black text-[#092c59]"
              >
                {settings.contact.label}
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-white/25 px-5 py-3 text-sm font-black text-white"
              >
                Create a free account
              </Link>
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}

function Price({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#f3f7fc] p-4">
      <p className="text-xs font-bold text-[#718399]">{label}</p>
      <p className="mt-2 text-2xl font-black">{formatPeso(value)}</p>
      <p className="mt-1 text-xs text-[#718399]">Coaching fee</p>
    </div>
  )
}
