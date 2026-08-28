import type { Metadata } from 'next'
import Link from 'next/link'

import { getCachedGlobal } from '@/utilities/getGlobals'

export const metadata: Metadata = {
  title: 'Privacy and data use | Next Shot',
  description: 'How Next Shot uses account, booking, training, and injury information.',
}

export default async function PrivacyPage() {
  const settings = await getCachedGlobal('coaching-settings')()

  return (
    <main className="bg-[#f7faff] px-5 py-20 text-[#071f42] md:px-10 md:py-28">
      <article className="mx-auto max-w-3xl">
        <p className="coach-eyebrow">Privacy and data use</p>
        <h1 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.05em] md:text-7xl">
          Your information supports safer, more personal coaching.
        </h1>
        <p className="mt-6 text-lg leading-8 text-[#586d84]">
          Policy version {settings.privacy.policyVersion}. This notice explains what Next Shot
          collects, why it is needed, and the choices you have.
        </p>

        <div className="mt-12 space-y-5">
          <section className="rounded-[1.75rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Information we collect</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-[#586d84]">
              <li>Account and contact details, including your name and email address.</li>
              <li>
                Playing experience, goals, availability, preferred event, and competition goals.
              </li>
              <li>Assessment bookings, court details, attendance, and coach communications.</li>
              <li>Training plans, practice activity, skill progress, and coach feedback.</li>
              <li>Optional injury or health notes that you choose to share.</li>
            </ul>
          </section>

          <section className="rounded-[1.75rem] bg-[#eaf3ff] p-7">
            <h2 className="text-2xl font-black">Injury and health notes</h2>
            <p className="mt-4 leading-7 text-[#334b65]">{settings.privacy.healthDataNotice}</p>
            <p className="mt-3 leading-7 text-[#334b65]">
              These notes are not a medical diagnosis and do not replace advice from a qualified
              healthcare professional. You may leave the injury field blank, update the information,
              or ask for it to be removed.
            </p>
          </section>

          <section className="rounded-[1.75rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">How information is used</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-[#586d84]">
              <li>To create and operate your account and student dashboard.</li>
              <li>To recommend a suitable program and prepare coaching sessions.</li>
              <li>To adapt drills and training load to information you share.</li>
              <li>To coordinate assessments, venues, reminders, and schedule changes.</li>
              <li>To maintain training records and show your progress over time.</li>
            </ul>
          </section>

          <section className="rounded-[1.75rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Access, storage, and service providers</h2>
            <p className="mt-4 leading-7 text-[#586d84]">
              Player and booking records are limited to the student and authorised coaching or
              administrative staff according to their role. Next Shot uses hosting, database, email,
              file-storage, and location-search providers to operate the service. These providers
              receive only the information needed to perform their service.
            </p>
            <p className="mt-3 leading-7 text-[#586d84]">
              Records are retained while needed to provide coaching, maintain legitimate business
              records, resolve disputes, and meet applicable obligations. Access is not sold to
              advertisers.
            </p>
          </section>

          <section className="rounded-[1.75rem] bg-[#092c59] p-7 text-white">
            <h2 className="text-2xl font-black">Your choices</h2>
            <p className="mt-4 leading-7 text-white/70">
              You may request access, correction, export, or deletion of your information, or
              withdraw consent for optional health-data use. Some records may need to be retained
              where required for security, payment, dispute, or legal purposes.
            </p>
            <Link
              href={settings.contact.url}
              className="mt-6 inline-flex rounded-full bg-[#4cc9ff] px-5 py-3 text-sm font-black text-[#092c59]"
            >
              {settings.contact.label}
            </Link>
          </section>
        </div>
      </article>
    </main>
  )
}
