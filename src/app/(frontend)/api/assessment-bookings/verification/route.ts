import config from '@payload-config'
import { getPayload } from 'payload'
import { createAssessmentEmailCode } from '@/utilities/assessmentEmailVerification'
import {
  checkPublicForm,
  limitPublicEmail,
  limitPublicRequest,
  publicErrorResponse,
  PublicRequestError,
  requestIdentity,
} from '@/utilities/publicRequestProtection'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    await limitPublicRequest(payload, 'public-email-ip', requestIdentity(request), 10, 3600)
    const body = await request.json().catch(() => null)
    checkPublicForm(request, body)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new PublicRequestError('Enter a valid email address.', 400)
    await limitPublicEmail(payload, email)
    const { code, token } = createAssessmentEmailCode(email)
    await payload.sendEmail({
      to: email,
      subject: 'Confirm your assessment booking email',
      text: `Your Next Shot confirmation code is ${code}. It expires in 10 minutes. No time has been reserved yet. If you did not request this code, ignore this email.`,
    })
    return Response.json(
      {
        token,
        message:
          'Check your email for a six-digit code. Your time is not reserved until you confirm.',
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return publicErrorResponse(error)
  }
}
