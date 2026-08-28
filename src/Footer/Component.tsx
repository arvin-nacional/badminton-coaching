import Link from 'next/link'

import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  const settings = await getCachedGlobal('coaching-settings')()

  return (
    <footer className="bg-[#071f42] px-5 py-12 text-white md:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <Link href="/" className="text-lg font-black">
            NEXT SHOT<span className="text-[#4cc9ff]">.</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
            Structured badminton coaching with clear pricing, personal training plans, and
            measurable progress.
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-[#4cc9ff]">
            Service area · {settings.service.area}
          </p>
        </div>

        <nav aria-label="Coaching" className="text-sm">
          <p className="font-black text-white">Coaching</p>
          <div className="mt-4 grid gap-3 text-white/65">
            <Link href="/#programs" className="transition hover:text-white">
              Programs
            </Link>
            <Link href="/#pricing" className="transition hover:text-white">
              Pricing and venues
            </Link>
            <Link href="/signup" className="transition hover:text-white">
              Create a free account
            </Link>
            <Link href={settings.contact.url} className="transition hover:text-white">
              {settings.contact.label}
            </Link>
          </div>
        </nav>

        <nav aria-label="Legal and account" className="text-sm">
          <p className="font-black text-white">Information</p>
          <div className="mt-4 grid gap-3 text-white/65">
            <Link href={settings.privacy.privacyURL} className="transition hover:text-white">
              Privacy and data use
            </Link>
            <Link href={settings.privacy.termsURL} className="transition hover:text-white">
              Terms and cancellation
            </Link>
            <Link href="/admin" className="transition hover:text-white">
              Coach login
            </Link>
          </div>
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-[1320px] border-t border-white/10 pt-6 text-xs text-white/40">
        © {new Date().getFullYear()} Next Shot Badminton Coaching. Coaching fees and venue charges
        are confirmed before payment.
      </div>
    </footer>
  )
}
