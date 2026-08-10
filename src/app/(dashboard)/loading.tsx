import { LoaderCircle } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <main
      className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white shadow-[0_24px_70px_-35px_rgba(9,44,89,.6)]">
          <span className="absolute inset-0 rounded-[1.5rem] border border-[#092c59]/10" />
          <LoaderCircle className="h-9 w-9 animate-spin text-[#1677ff]" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-[#1677ff]">
          Next Shot
        </p>
        <p className="mt-2 text-sm font-bold text-[#607286]">Preparing your dashboard…</p>
      </div>
    </main>
  )
}
