'use client'

import { ArrowRight, CheckCircle2, LoaderCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { GoogleAuthButton } from './GoogleAuthButton'

export function SignupForm({ googleClientID }: { googleClientID: string }) {
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [pending, setPending] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  async function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') || '')
    const email = String(data.get('email') || '')

    setPending(true)
    const response = await fetch('/api/student-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    }).catch(() => null)
    const result = (await response?.json().catch(() => null)) as {
      error?: string
      message?: string
    } | null

    if (!response?.ok) {
      setError(result?.error || 'We could not create your account.')
      setPending(false)
      return
    }

    setSubmittedEmail(email)
    setComplete(true)
    setPending(false)
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#092c59]/10 bg-white p-7 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-9">
        {complete ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef9f3] text-[#157347]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-7 text-3xl font-black tracking-[-.04em]">Check your email</h1>
            <p className="mt-3 text-sm leading-6 text-[#607286]">
              We sent a verification link to{' '}
              <strong className="text-[#092c59]">{submittedEmail}</strong>. Open it to confirm your
              email and set your password. The link expires in 48 hours.
            </p>
            <Link
              href="/login"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-[#092c59]/20 bg-white px-6 py-3.5 font-bold text-[#092c59]"
            >
              Return to sign in <ArrowRight className="h-5 w-5" />
            </Link>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#1677ff]">
              <UserPlus className="h-6 w-6" />
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#1677ff]">
              Student sign up
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">
              Create your student account
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#607286]">
              Use Google for instant access, or sign up with email and verify it before setting your
              password.
            </p>
            {googleClientID && (
              <>
                <div className="mt-7">
                  <GoogleAuthButton
                    clientID={googleClientID}
                    intent="signup"
                    onAuthenticated={() => window.location.assign('/dashboard/student')}
                  />
                </div>
                <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.14em] text-[#8a9aad]">
                  <span className="h-px flex-1 bg-[#d9e1ea]" /> or use email{' '}
                  <span className="h-px flex-1 bg-[#d9e1ea]" />
                </div>
              </>
            )}
            <form onSubmit={signup} className={googleClientID ? 'space-y-5' : 'mt-7 space-y-5'}>
              <label className="block text-sm font-bold">
                Full name
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  required
                  className="mt-2 w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 outline-none focus:border-[#1677ff]"
                />
              </label>
              <label className="block text-sm font-bold">
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 outline-none focus:border-[#1677ff]"
                />
              </label>
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
                    <LoaderCircle className="h-5 w-5 animate-spin" /> Creating account…
                  </>
                ) : (
                  <>
                    Create student account <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-[#607286]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#1677ff]">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
