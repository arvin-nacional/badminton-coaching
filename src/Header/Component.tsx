import Link from 'next/link'
import { ArrowUpRight, LogIn } from 'lucide-react'
import { MobileNavigation } from './MobileNavigation'

export async function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#092c59]/10 bg-[#f7faff]/90 px-5 backdrop-blur-xl md:px-10">
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-[#092c59]">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#092c59]">
            <span className="h-3 w-3 rounded-full bg-[#4cc9ff]" />
            <span className="absolute -right-1 top-0 h-4 w-1 rotate-[-25deg] rounded-full bg-[#4cc9ff]" />
          </span>
          <span className="text-lg font-black tracking-[-.03em]">
            NEXT SHOT<span className="text-[#1677ff]">.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-bold text-[#405d7d] md:flex">
          <Link href="/#programs">Programs</Link>
          <Link href="/#assessment">Assessment</Link>
          <Link href="/#contact">How it works</Link>
        </nav>
        <MobileNavigation />
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login?redirect=/dashboard/student"
            className="flex items-center gap-2 rounded-full border border-[#092c59]/20 bg-white px-4 py-3 text-sm font-bold text-[#092c59] transition hover:border-[#1677ff] hover:text-[#1677ff]"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Student login</span>
            <span className="sm:hidden">Login</span>
          </Link>
          <Link
            href="/#contact"
            className="hidden items-center gap-2 rounded-full bg-[#092c59] px-5 py-3 text-sm font-bold text-white sm:flex"
          >
            Get started <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
