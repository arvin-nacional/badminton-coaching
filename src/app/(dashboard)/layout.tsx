import config from '@payload-config'
import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'

import { LogoutButton } from '@/components/Dashboard/LogoutButton'
import { cn } from '@/utilities/ui'

import '../(frontend)/globals.css'

export const metadata: Metadata = { title: 'Dashboard | Next Shot' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} data-theme="light" lang="en">
      <body className="bg-[#f3f7fc] text-[#071f42]">
        <header className="border-b border-[#092c59]/10 bg-white px-5 md:px-8">
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3 font-black">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#092c59] text-[#4cc9ff]">
                N
              </span>
              <span className="hidden sm:inline">
                NEXT SHOT<span className="text-[#1677ff]">.</span>
              </span>
            </Link>
            <nav className="flex min-w-0 items-center gap-2 text-xs font-bold sm:gap-4 sm:text-sm">
              {user ? (
                <>
                  <LogoutButton />
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-[#092c59] px-5 py-2.5 text-white"
                  >
                    My dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/" className="whitespace-nowrap">
                    <span className="sm:hidden">Website</span>
                    <span className="hidden sm:inline">Back to website</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="whitespace-nowrap rounded-full border border-[#092c59]/20 bg-white px-5 py-2.5 text-[#092c59]"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login?redirect=/dashboard/student"
                    className="rounded-full bg-[#092c59] px-5 py-2.5 text-white"
                  >
                    Student sign in
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
