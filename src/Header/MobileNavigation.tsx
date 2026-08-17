'use client'

import { LogIn, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function MobileNavigation() {
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
            <Link
              href="/#programs"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 hover:bg-[#f3f7fc]"
            >
              Programs
            </Link>
            <Link
              href="/#assessment"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 hover:bg-[#f3f7fc]"
            >
              Assessment
            </Link>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 hover:bg-[#f3f7fc]"
            >
              How it works
            </Link>
            <div className="my-1 h-px bg-[#092c59]/10" />
            <Link
              href="/login?redirect=/dashboard/student"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 hover:bg-[#f3f7fc]"
            >
              <LogIn className="h-4 w-4" /> Student login
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-[#092c59] px-5 py-3 text-center text-white"
            >
              Get started
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  )
}
