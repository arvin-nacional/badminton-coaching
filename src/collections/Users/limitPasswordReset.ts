import { APIError, type CollectionBeforeOperationHook } from 'payload'
import {
  checkPublicForm,
  limitPublicEmail,
  limitPublicRequest,
  PublicRequestError,
  requestIdentity,
} from '@/utilities/publicRequestProtection'

export const limitPasswordReset: CollectionBeforeOperationHook = async ({
  operation,
  args,
  req,
}) => {
  // Internal signup/invitation code already controls its own email requests.
  if (operation !== 'forgotPassword' || req.payloadAPI === 'local') return args
  try {
    const request = new Request(req.url || 'http://localhost', { headers: req.headers })
    checkPublicForm(request, req.data)
    await limitPublicRequest(req.payload, 'public-email-ip', requestIdentity(request), 10, 3600)
    const data = (args as { data?: { email?: unknown } }).data
    const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : ''
    if (email) await limitPublicEmail(req.payload, email)
    return args
  } catch (error) {
    if (error instanceof PublicRequestError) throw new APIError(error.message, error.status)
    throw new APIError('Password reset is temporarily unavailable. Please try again later.', 503)
  }
}
