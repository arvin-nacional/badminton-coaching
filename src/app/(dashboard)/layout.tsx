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
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between">
            <Link href="/" className="flex items-center gap-3 font-black">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#092c59] text-[#4cc9ff]">
                N
              </span>
              NEXT SHOT<span className="text-[#1677ff]">.</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-bold">
              {user ? (
                <>
                  <Link href="/" className="hidden sm:inline">
                    Website
                  </Link>
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
                  <Link href="/">Back to website</Link>
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
