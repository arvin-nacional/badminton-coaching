import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { assertTestDatabase } from '../../src/testing/environment'
export { testUser } from './testUser'

const execute = promisify(execFile)
const fixtureScript = fileURLToPath(new URL('../fixtures/adminUser.ts', import.meta.url))
let createdUserID: string | undefined

async function runFixture(action: 'seed' | 'cleanup', id?: string) {
  assertTestDatabase()
  try {
    return await execute(
      process.execPath,
      ['--import=tsx', fixtureScript, action, ...(id ? [id] : [])],
      {
        env: { ...process.env, NODE_OPTIONS: '' },
        windowsHide: true,
        timeout: 60000,
      },
    )
  } catch (error) {
    const failure = error as { code?: string | number; signal?: string; killed?: boolean }
    throw new Error(
      `Fixture ${action} failed (code=${failure.code ?? 'unknown'}, signal=${failure.signal ?? 'none'}, killed=${failure.killed ?? false}).`,
      { cause: error },
    )
  }
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const { stdout } = await runFixture('seed')
  const match = stdout.match(/^E2E_FIXTURE_USER_ID=([a-f0-9]{24})\r?$/m)
  if (!match) throw new Error('Fixture setup did not return a valid user ID.')
  createdUserID = match[1]
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  if (!createdUserID) return
  await runFixture('cleanup', createdUserID)
  createdUserID = undefined
}
