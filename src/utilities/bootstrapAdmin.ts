import type { Payload } from 'payload'

// A Symbol cannot be supplied in JSON, query parameters, or a request header.
// Only trusted server code can opt into administrator provisioning.
export const trustedAdminProvisioning = Symbol('trustedAdminProvisioning')

type AdminInput = { email: string; name: string; password: string }

export class AdminSetupError extends Error {}

export function validateAdminInput(input: AdminInput): AdminInput {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AdminSetupError('Set BOOTSTRAP_ADMIN_EMAIL to a valid email address.')
  }
  if (!name || name.length > 120) {
    throw new AdminSetupError('Set BOOTSTRAP_ADMIN_NAME to a name of 1–120 characters.')
  }
  if (input.password.length < 16 || input.password.length > 128) {
    throw new AdminSetupError(
      'Set BOOTSTRAP_ADMIN_PASSWORD to a unique password of 16–128 characters.',
    )
  }
  return { email, name, password: input.password }
}

export async function bootstrapAdmin(payload: Payload, input: AdminInput) {
  const data = validateAdminInput(input)
  const admins = await payload.count({
    collection: 'users',
    overrideAccess: true,
    where: { roles: { contains: 'admin' } },
  })
  if (admins.totalDocs) {
    throw new AdminSetupError(
      'An administrator already exists. Manage accounts through that administrator.',
    )
  }

  const existing = await payload.count({
    collection: 'users',
    overrideAccess: true,
    where: { email: { equals: data.email } },
  })
  if (existing.totalDocs) {
    throw new AdminSetupError(
      'That email already belongs to an account. Use a separate administrator email.',
    )
  }

  return payload.create({
    collection: 'users',
    context: { [trustedAdminProvisioning]: true },
    data: { ...data, accountStatus: 'active', roles: ['admin'] },
    overrideAccess: true,
  })
}
