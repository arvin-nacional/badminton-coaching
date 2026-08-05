import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import Link from 'next/link'

import { cn } from '@/utilities/ui'

import '../(frontend)/globals.css'

export const metadata: Metadata = { title: 'Dashboard | Next Shot' }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} data-theme="light" lang="en">
      <body className="bg-[#f3f7fc] text-[#071f42]">
        <header className="border-b border-[#092c59]/10 bg-white px-5 md:px-8">
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 font-black">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#092c59] text-[#4cc9ff]">N</span>
              NEXT SHOT<span className="text-[#1677ff]">.</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-bold">
              <Link href="/">Website</Link>
              <Link href="/dashboard" className="rounded-full bg-[#092c59] px-5 py-2.5 text-white">My dashboard</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
