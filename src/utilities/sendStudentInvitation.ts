import type { Payload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

const escapeHTML = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ||
      character,
  )

export async function sendStudentInvitation(
  payload: Payload,
  user: { email: string; name?: string | null },
) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured.')

  const token = await payload.forgotPassword({
    collection: 'users',
    data: { email: user.email },
    disableEmail: true,
    expiration: 48 * 60 * 60 * 1000,
  })

  if (!token) throw new Error('The invitation token could not be created.')

  const activationURL = `${getServerSideURL()}/activate-account?token=${encodeURIComponent(token)}`
  const safeName = escapeHTML(user.name || user.email)

  await payload.sendEmail({
    to: user.email,
    subject: 'Activate your Next Shot student account',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#092c59"><p style="font-size:12px;font-weight:700;letter-spacing:.14em;color:#1677ff">NEXT SHOT BADMINTON</p><h1 style="font-size:30px;line-height:1.15">Your training dashboard is ready</h1><p>Hi ${safeName},</p><p>Your coach has invited you to Next Shot. Use the secure button below to confirm your email address and create your password.</p><p style="margin:28px 0"><a href="${activationURL}" style="display:inline-block;border-radius:999px;background:#092c59;color:#fff;padding:14px 24px;text-decoration:none;font-weight:700">Activate account</a></p><p style="font-size:14px;color:#607286">This invitation expires in 48 hours and can only be used once. If you were not expecting it, you can ignore this email.</p></div>`,
  })
}
