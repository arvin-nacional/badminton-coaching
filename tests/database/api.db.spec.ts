import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { assertTestDatabase } from '../../src/testing/environment'
import { assertTestPayload } from '../../src/testing/adapters'

let payload: Payload | undefined

describe('isolated Payload API', () => {
  beforeAll(async () => {
    assertTestDatabase()
    const { getPayload } = await import('payload')
    const { default: config } = await import('../../src/payload.config')
    payload = await getPayload({ config })
    await assertTestPayload(payload)
  })
  afterAll(async () => {
    await payload?.db.destroy?.()
  })

  it('starts with no real users', async () => {
    const users = await payload!.find({ collection: 'users' })
    expect(users.docs).toEqual([])
  })
})
