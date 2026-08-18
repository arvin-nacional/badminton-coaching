'use client'

import { ArrowUpRight, LayoutDashboard, LogIn } from 'lucide-react'
import Link from 'next/link'

import { CMSLink } from '@/components/Link'
import type { Header } from '@/payload-types'
import { useAuthState } from '@/providers/AuthState'

import { getHeaderActions } from './defaultNavItems'

export function HeaderActions({ data, mobile = false }: { data: Header; mobile?: boolean }) {
  const { isResolved, user } = useAuthState()
  const { primaryAction, secondaryAction } = getHeaderActions(data)

  if (!isResolved)
    return (
      <span
        aria-label="Checking account"
        className={`${mobile ? 'h-11 w-full' : 'h-11 w-36'} animate-pulse rounded-full bg-[#092c59]/10`}
        role="status"
      />
    )

  if (user)
    return (
      <Link
        href="/dashboard"
        className={`${
          mobile ? 'w-full justify-center' : ''
        } flex items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1677ff]`}
      >
        <LayoutDashboard className="h-4 w-4" /> My dashboard
      </Link>
    )

  return (
    <>
      <CMSLink
        {...secondaryAction}
        label={undefined}
        className={`${
          mobile
            ? 'w-full justify-center'
            : 'border border-[#092c59]/20 bg-white hover:border-[#1677ff] hover:text-[#1677ff]'
        } flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[#092c59] transition`}
      >
        <LogIn className="h-4 w-4" /> {secondaryAction.label}
      </CMSLink>
      <CMSLink
        {...primaryAction}
        label={undefined}
        className={`${
          mobile ? 'flex w-full justify-center' : 'hidden lg:flex'
        } items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1677ff]`}
      >
        {primaryAction.label} <ArrowUpRight className="h-4 w-4" />
      </CMSLink>
    </>
  )
}
