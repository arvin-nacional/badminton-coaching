'use client'

import { MailPlus, RefreshCw, Send } from 'lucide-react'
import { FormEvent, useState } from 'react'

type FormMessage = { error: boolean; text: string }

async function sendRequest(method: 'POST' | 'PATCH', data: Record<string, string>) {
  const response = await fetch('/api/student-invitations', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = (await response.json().catch(() => null)) as {
    error?: string
    message?: string
  } | null
  if (!response.ok) throw new Error(result?.error || 'The invitation could not be sent.')
  return result?.message || 'Invitation sent.'
}

export function StudentInvitationForm() {
  const [invitePending, setInvitePending] = useState(false)
  const [resendPending, setResendPending] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<FormMessage | null>(null)
  const [resendMessage, setResendMessage] = useState<FormMessage | null>(null)

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInvitePending(true)
    setInviteMessage(null)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      const text = await sendRequest('POST', {
        name: String(data.get('name') || ''),
        email: String(data.get('email') || ''),
      })
      form.reset()
      setInviteMessage({ error: false, text })
    } catch (error) {
      setInviteMessage({
        error: true,
        text: error instanceof Error ? error.message : 'The invitation could not be sent.',
      })
    } finally {
      setInvitePending(false)
    }
  }

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResendPending(true)
    setResendMessage(null)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      const text = await sendRequest('PATCH', { email: String(data.get('email') || '') })
      form.reset()
      setResendMessage({ error: false, text })
    } catch (error) {
      setResendMessage({
        error: true,
        text: error instanceof Error ? error.message : 'The invitation could not be resent.',
      })
    } finally {
      setResendPending(false)
    }
  }

  const message = (value: FormMessage | null) =>
    value ? (
      <p
        role="status"
        className={`mt-4 rounded-xl p-3 text-sm font-bold ${value.error ? 'bg-[#fff0f0] text-[#a53d3d]' : 'bg-[#eef9f3] text-[#157347]'}`}
      >
        {value.text}
      </p>
    ) : null

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-[1.6rem] border border-[#092c59]/10 bg-white p-6 shadow-[0_12px_40px_-30px_rgba(9,44,89,.35)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#1677ff]">
          <MailPlus className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-xl font-black">Invite a student</h2>
        <p className="mt-2 text-sm leading-6 text-[#607286]">
          We’ll create a pending student profile and email a secure link that expires in 48 hours.
          The student chooses their own password.
        </p>
        <form onSubmit={invite} className="mt-6 space-y-4">
          <label className="block text-sm font-black">
            Student name
            <input
              name="name"
              required
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-[#9db1c8] px-4 py-3 font-normal outline-none focus:border-[#1677ff]"
            />
          </label>
          <label className="block text-sm font-black">
            Email address
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-[#9db1c8] px-4 py-3 font-normal outline-none focus:border-[#1677ff]"
            />
          </label>
          <button
            type="submit"
            disabled={invitePending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 text-sm font-black text-white disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {invitePending ? 'Sending invitation…' : 'Create account and invite'}
          </button>
        </form>
        {message(inviteMessage)}
      </section>

      <section className="rounded-[1.6rem] border border-[#092c59]/10 bg-white p-6 shadow-[0_12px_40px_-30px_rgba(9,44,89,.35)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#1677ff]">
          <RefreshCw className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-xl font-black">Resend an invitation</h2>
        <p className="mt-2 text-sm leading-6 text-[#607286]">
          Use this when a pending student’s link has expired. The previous link will stop working.
        </p>
        <form onSubmit={resend} className="mt-6 space-y-4">
          <label className="block text-sm font-black">
            Student email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-[#9db1c8] px-4 py-3 font-normal outline-none focus:border-[#1677ff]"
            />
          </label>
          <button
            type="submit"
            disabled={resendPending}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#092c59]/20 bg-white px-6 py-3.5 text-sm font-black text-[#092c59] disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            {resendPending ? 'Resending…' : 'Resend invitation'}
          </button>
        </form>
        {message(resendMessage)}
      </section>
    </div>
  )
}
