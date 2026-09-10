import 'dotenv/config'

import { getPayload } from 'payload'
import { AdminSetupError, bootstrapAdmin, validateAdminInput } from '@/utilities/bootstrapAdmin'

// Credentials come from the operator's environment, never command-line arguments
// or application startup. Validate them before loading the config or connecting.
const input = {
  email: process.env.BOOTSTRAP_ADMIN_EMAIL || '',
  name: process.env.BOOTSTRAP_ADMIN_NAME || '',
  password: process.env.BOOTSTRAP_ADMIN_PASSWORD || '',
}

try {
  validateAdminInput(input)
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config, disableOnInit: true })
  try {
    await bootstrapAdmin(payload, input)
    console.info('Administrator created. Sign in at /admin with the supplied credentials.')
  } finally {
    await payload.destroy()
  }
} catch (error) {
  // Database errors can contain submitted data; do not print credentials.
  console.error(
    error instanceof AdminSetupError
      ? error.message
      : 'Administrator setup failed. Check the setup requirements in docs/admin-setup.md.',
  )
  process.exitCode = 1
}
