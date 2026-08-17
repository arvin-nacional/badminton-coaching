'use client'

import { ArrowRight, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const data = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/users/login', {
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result?.errors?.[0]?.message || 'The email or password is incorrect.')
      // Route directly by role to avoid the extra /dashboard redirect hop.
      const roles: string[] = result?.user?.roles || []
      const roleHome =
        !roles.length || roles.includes('admin') || roles.includes('coach')
          ? '/dashboard/coach'
          : '/dashboard/student'
      const redirectParam = searchParams.get('redirect')
      const target = redirectParam && redirectParam !== '/dashboard' ? redirectParam : roleHome
      window.location.assign(target)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#092c59]/10 bg-white p-7 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#1677ff]">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#1677ff]">
          Next Shot portal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Sign in to your dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-[#607286]">
          Students see their training plan and progress. Coaches are routed to the roster dashboard.
        </p>
        <form className="mt-7 space-y-5" onSubmit={login}>
          <label className="block text-sm font-bold">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 outline-none focus:border-[#1677ff]"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block text-sm font-bold">
            Password
            <input
              className="mt-2 w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 outline-none focus:border-[#1677ff]"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="rounded-xl bg-[#fff0f0] p-3 text-sm font-semibold text-[#a53d3d]">
              {error}
            </p>
          )}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign in <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#607286]">
          New student?{' '}
          <a href="/signup" className="font-bold text-[#1677ff]">
            Create an account
          </a>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#1677ff]" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
