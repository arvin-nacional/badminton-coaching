import { afterEach, describe, it } from 'vitest'
import { cleanupTestUser, seedTestUser } from '../helpers/seedUser'

describe('isolated admin fixture subprocess', () => {
  afterEach(async () => {
    await cleanupTestUser()
  }, 75000)

  // Every seed and cleanup starts a fresh Node/tsx process. Repetition covers
  // the intermittent startup failure that a single successful E2E run missed.
  it.each([1, 2, 3])(
    'creates and cleans up a test-only admin (run %i)',
    async () => {
      await seedTestUser()
      await cleanupTestUser()
    },
    150000,
  )
})
