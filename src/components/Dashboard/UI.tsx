import type { LucideIcon } from 'lucide-react'

export function DashboardShell({ children, eyebrow, title, description, actions }: { children: React.ReactNode; eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return <main className="px-5 py-10 md:px-8"><div className="mx-auto max-w-[1440px]"><div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#1677ff]">{eyebrow}</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em] md:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-[#607286]">{description}</p></div>{actions}</div>{children}</div></main>
}

export function Panel({ children, className = '', title, subtitle, icon: Icon, tone = 'light' }: { children: React.ReactNode; className?: string; title: string; subtitle?: string; icon?: LucideIcon; tone?: 'light' | 'dark' }) {
  const toneClasses = tone === 'dark' ? 'bg-[#092c59] text-white' : 'bg-white text-[#071f42]'
  return <section className={`rounded-[1.6rem] border border-[#092c59]/10 p-6 shadow-[0_12px_40px_-30px_rgba(9,44,89,.35)] ${toneClasses} ${className}`}><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-black">{title}</h2>{subtitle && <p className={`mt-1 text-sm ${tone === 'dark' ? 'text-white/65' : 'text-[#718399]'}`}>{subtitle}</p>}</div>{Icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#1677ff]"><Icon className="h-5 w-5" /></span>}</div>{children}</section>
}

export function Stat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <div className="rounded-2xl bg-[#f3f7fc] p-4 text-[#071f42]"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#718399]">{label}</p><p className="mt-2 text-2xl font-black">{value}</p>{detail && <p className="mt-1 text-xs text-[#718399]">{detail}</p>}</div>
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-[#9db1c8] p-5 text-sm text-[#718399]">{text}</p>
}

export function ProgressBar({ label, value, trailing }: { label: string; value: number; trailing?: string }) {
  return <div><div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="font-bold">{label}</span><span className="text-[#718399]">{trailing || `${value}%`}</span></div><div className="h-2.5 rounded-full bg-[#e5edf6]"><div className="h-full rounded-full bg-[#1677ff]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>
}

export const formatDate = (value?: string | null, includeTime = true) => value ? new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', ...(includeTime ? { timeStyle: 'short' as const } : {}) }).format(new Date(value)) : 'Not scheduled'

export const relationName = <T extends { name?: string; displayName?: string }>(value: string | T | null | undefined, fallback = 'Not assigned') => typeof value === 'object' && value ? value.name || value.displayName || fallback : fallback
