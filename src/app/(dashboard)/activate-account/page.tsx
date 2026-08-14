import config from '@payload-config'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

import { ActivateAccountForm } from '@/components/Dashboard/ActivateAccountForm'

export const dynamic = 'force-dynamic'

export default async function ActivateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const token = (await searchParams).token?.trim() || ''
  let valid = false

  if (token) {
    const payload = await getPayload({ config })
    const users = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      showHiddenFields: true,
      where: {
        and: [
          { resetPasswordToken: { equals: token } },
          { resetPasswordExpiration: { greater_than: new Date().toISOString() } },
          { accountStatus: { equals: 'pending' } },
        ],
      },
    })
    valid = users.docs.length === 1
  }

  if (valid) return <ActivateAccountForm token={token} />

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#092c59]/10 bg-white p-7 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0f0] text-[#a53d3d]">
          <XCircle className="h-6 w-6" />
        </div>
        <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#a53d3d]">
          Activation link unavailable
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">This link can’t be used</h1>
        <p className="mt-3 text-sm leading-6 text-[#607286]">
          This activation link has expired, has already been used, or was replaced by a newer link.
          If you signed up yourself, you can request a new link from the sign up page. If your coach
          invited you, ask them to resend the invitation.
        </p>
        <Link
          href="/login"
          className="mt-7 flex w-full items-center justify-center rounded-full border border-[#092c59]/20 bg-white px-6 py-3.5 font-bold text-[#092c59]"
        >
          Return to sign in
        </Link>
      </div>
    </main>
  )
}
