import './environment'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { assertTestDatabase } from '../../src/testing/environment'
import { assertTestPayload } from '../../src/testing/adapters'
import { trustedAdminProvisioning } from '../../src/utilities/bootstrapAdmin'
import { testUser } from '../helpers/testUser'

// Run under tsx in its own process, never under Playwright's ESM loader.
assertTestDatabase()
const action = process.argv[2]
const id = process.argv[3]
if (action !== 'seed' && action !== 'cleanup') throw new Error('Invalid fixture action.')
if (action === 'cleanup' && !/^[a-f0-9]{24}$/.test(id || ''))
  throw new Error('Invalid fixture user ID.')

// Static imports avoid an intermittent unsettled dynamic config import under
// Node/tsx on Windows. The first dependency validates the environment first.
let phase = 'connecting to disposable MongoDB'
let completed = false
process.once('exit', () => {
  if (!completed) process.stderr.write(`Fixture ${action} exited while ${phase}.\n`)
})
const payload = await getPayload({ config })
try {
  phase = 'verifying the disposable database marker'
  await assertTestPayload(payload)
  phase = `${action === 'seed' ? 'creating' : 'deleting'} the fixture user`
  if (action === 'seed') {
    const user = await payload.create({
      collection: 'users',
      context: { [trustedAdminProvisioning]: true },
      data: testUser,
    })
    process.stdout.write(`E2E_FIXTURE_USER_ID=${user.id}\n`)
  } else {
    const user = await payload.findByID({ collection: 'users', id, depth: 0 })
    if (user.email !== testUser.email)
      throw new Error('Fixture user belongs to a different test run.')
    await payload.delete({ collection: 'users', id })
  }
} finally {
  phase = 'closing the disposable database connection'
  await payload.db.destroy?.()
}
completed = true
