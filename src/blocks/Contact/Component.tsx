import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import {
  ArrowRight,
  Check,
  Clock3,
  Mail,
  MapPinned,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRoundPlus,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

import { StyledForm } from '@/blocks/Form/StyledForm'
import type { ContactSectionBlock } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'

const channelIcons: Record<string, LucideIcon> = {
  chat: MessageCircle,
  email: Mail,
  hours: Clock3,
  location: MapPinned,
  phone: Phone,
}

export async function ContactSectionBlock(props: ContactSectionBlock) {
  const {
    channels,
    description,
    expectations,
    eyebrow,
    form,
    formDescription,
    formEyebrow,
    formFootnote,
    formHeading,
    heading,
    showQuickLinks,
  } = props
  const settings = showQuickLinks ? await getCachedGlobal('coaching-settings')() : null
  const formDoc = form && typeof form === 'object' ? (form as unknown as FormType) : null

  return (
    <section className="coach-section bg-[#eaf3ff] text-[#071f42]">
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="coach-eyebrow">{eyebrow}</p>
          <h1 className="coach-title">{heading}</h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[#586d84]">{description}</p>

          {channels?.length ? (
            <ul className="mt-9 grid gap-3">
              {channels.map((channel) => {
                const Icon = channelIcons[channel.type] || Mail
                const body = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#092c59] text-[#4cc9ff]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[.14em] text-[#718399]">
                        {channel.label}
                      </span>
                      <span className="mt-1 block break-words font-bold text-[#092c59]">
                        {channel.value}
                      </span>
                    </span>
                  </>
                )
                const className =
                  'flex items-center gap-4 rounded-2xl border border-[#092c59]/10 bg-white p-4'
                return (
                  <li key={channel.id || `${channel.label}-${channel.value}`}>
                    {channel.url ? (
                      <a
                        href={channel.url}
                        className={`${className} transition hover:border-[#1677ff]/40`}
                        target={channel.url.startsWith('http') ? '_blank' : undefined}
                        rel={channel.url.startsWith('http') ? 'noreferrer' : undefined}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={className}>{body}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}

          {expectations?.length ? (
            <div className="mt-6 rounded-2xl bg-[#092c59] p-5 text-white">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#4cc9ff]">
                <ShieldCheck className="h-4 w-4" /> What to expect
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-white/80">
                {expectations.map((item) => (
                  <li key={item.id || item.text} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#4cc9ff]" /> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {settings ? (
            <div className="mt-6 grid gap-2 text-sm font-bold">
              <Link
                href="/signup"
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-[#092c59] transition hover:text-[#1677ff]"
              >
                <span className="flex items-center gap-2">
                  <UserRoundPlus className="h-4 w-4 text-[#1677ff]" /> Create a free player account
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={settings.privacy.termsURL}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-[#092c59] transition hover:text-[#1677ff]"
              >
                <span>Pricing, venues and cancellation policy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={settings.privacy.privacyURL}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-[#092c59] transition hover:text-[#1677ff]"
              >
                <span>How we use your information</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>

        <div>
          {formDoc ? (
            <StyledForm
              description={formDescription}
              eyebrow={formEyebrow}
              footnote={formFootnote}
              form={formDoc}
              heading={formHeading}
            />
          ) : (
            <div className="rounded-[2rem] border border-[#092c59]/10 bg-white p-8 text-sm text-[#718399]">
              Select a form in the Contact Section block to display it here.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
