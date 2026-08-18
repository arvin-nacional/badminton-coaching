'use client'

import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import { CMSLink } from '@/components/Link'
import type { Header } from '@/payload-types'

import { HeaderActions } from './Actions'
import { getHeaderNavItems } from './defaultNavItems'

export function MobileNavigation({ data }: { data: Header }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#092c59]/15 bg-white text-[#092c59]"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-4 top-[68px] rounded-3xl border border-[#092c59]/10 bg-white p-3 shadow-[0_24px_70px_-35px_rgba(9,44,89,.65)]">
          <nav className="grid gap-1 text-sm font-bold text-[#405d7d]">
            {getHeaderNavItems(data).map(({ id, link }, index) => (
              <CMSLink
                {...link}
                className="rounded-2xl px-4 py-3 hover:bg-[#f3f7fc]"
                key={id || `${link.label}-${index}`}
              />
            ))}
            <div className="my-1 h-px bg-[#092c59]/10" />
            <div className="grid gap-2" onClick={() => setOpen(false)}>
              <HeaderActions data={data} mobile />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  )
}
