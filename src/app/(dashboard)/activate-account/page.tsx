'use client'

import { ArrowRight, CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'

function ActivationForm() {
  const token = useSearchParams().get('token') || ''
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [pending, setPending] = useState(false)

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') || '')
    const confirmPassword = String(data.get('confirmPassword') || '')
    if (password !== confirmPassword) return setError('The passwords do not match.')

    setPending(true)
    const response = await fetch('/api/student-invitations/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, confirmPassword }),
    }).catch(() => null)
    const result = (await response?.json().catch(() => null)) as { error?: string } | null
    if (!response?.ok) {
      setError(result?.error || 'Your account could not be activated.')
      setPending(false)
      return
    }
    setComplete(true)
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#092c59]/10 bg-white p-7 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-9">
        {complete ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef9f3] text-[#157347]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-7 text-3xl font-black tracking-[-.04em]">Your account is active</h1>
            <p className="mt-3 text-sm leading-6 text-[#607286]">
              Your email has been confirmed and your password is ready. Sign in to view your
              training dashboard.
            </p>
            <Link
              href="/login?redirect=/dashboard/student"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white"
            >
              Sign in <ArrowRight className="h-5 w-5" />
            </Link>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#1677ff]">
              <KeyRound className="h-6 w-6" />
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#1677ff]">
              Student invitation
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Create your password</h1>
            <p className="mt-3 text-sm leading-6 text-[#607286]">
              This confirms your email and activates your Next Shot student dashboard.
            </p>
            {!token ? (
              <p className="mt-6 rounded-xl bg-[#fff0f0] p-3 text-sm font-semibold text-[#a53d3d]">
                This invitation link is invalid. Ask your coach to resend it.
              </p>
            ) : (
              <form onSubmit={activate} className="mt-7 space-y-5">
                <label className="block text-sm font-bold">
                  New password
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="mt-2 w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 outline-none focus:border-[#1677ff]"
                  />
                </label>
                <label className="block text-sm font-bold">
                  Confirm password
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="mt-2 w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 outline-none focus:border-[#1677ff]"
                  />
                </label>
                <p className="text-xs text-[#718399]">Use at least 8 characters.</p>
                {error && (
                  <p className="rounded-xl bg-[#fff0f0] p-3 text-sm font-semibold text-[#a53d3d]">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white disabled:opacity-60"
                >
                  {pending ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" /> Activating…
                    </>
                  ) : (
                    <>
                      Activate account <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function ActivateAccountPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#1677ff]" />
        </main>
      }
    >
      <ActivationForm />
    </Suspense>
  )
}
