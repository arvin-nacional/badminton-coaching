import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  assertTestDatabase,
  configureTestEnvironment,
  isTestRuntime,
  testMarkerID,
} from '@/testing/environment'
import { verifyTestDatabaseMarker, testEmailAdapter } from '@/testing/adapters'
import type { Payload } from 'payload'

const runID = 'a'.repeat(24)
const token = 'b'.repeat(64)
const database = `badminton_test_${runID}`
const url = `mongodb://test_${runID}:${token}@127.0.0.1:49152/${database}?authSource=${database}&directConnection=true`
const valid = () => ({
  APP_TEST_MODE: 'database',
  NODE_ENV: 'test',
  TEST_DATABASE_DISPOSABLE: '1',
  TEST_RUN_ID: runID,
  TEST_DATABASE_TOKEN: token,
  TEST_DATABASE_URL: url,
  DATABASE_URL: url,
})
afterEach(() => vi.unstubAllEnvs())

describe('test database configuration boundary', () => {
  it('accepts only an explicit run-scoped loopback target', () => {
    expect(assertTestDatabase(valid())).toMatchObject({ database, runID, token, url })
  })
  it.each([
    { TEST_DATABASE_URL: undefined },
    { TEST_DATABASE_DISPOSABLE: undefined },
    { TEST_RUN_ID: '' },
    { TEST_DATABASE_TOKEN: '' },
    { DATABASE_URL: 'mongodb://production/main' },
    { APP_TEST_MODE: 'unit' },
    { NODE_ENV: 'production' },
    { VERCEL: '1' },
    { PAYLOAD_DROP_DATABASE: 'true' },
  ])('rejects incomplete or unsafe settings: %j', (change) => {
    expect(() => assertTestDatabase({ ...valid(), ...change })).toThrow('Unsafe test database')
  })
  it.each([
    url.replace('127.0.0.1', 'production.example.com'),
    url.replace('mongodb:', 'mongodb+srv:'),
    url.replace(':49152/', ':27017/'),
    url.replace(`/${database}?`, '/production?'),
    url.replace(`authSource=${database}`, 'authSource=admin'),
    `${url}&replicaSet=production`,
    `${url}&tls=false`,
    url.replace(`test_${runID}:`, 'root:'),
  ])('rejects unsafe URL variant %# without printing its credentials', (candidate) => {
    const check = () =>
      assertTestDatabase({ ...valid(), TEST_DATABASE_URL: candidate, DATABASE_URL: candidate })
    expect(check).toThrow('Unsafe test database')
    try {
      check()
    } catch (error) {
      expect(String(error)).not.toContain(token)
    }
  })
  it('does not fall back to the ordinary DATABASE_URL', () => {
    expect(() => assertTestDatabase({ DATABASE_URL: url })).toThrow()
  })
  it('clears database and integration credentials for mocked tests', () => {
    const env: Record<string, string | undefined> = {
      ...valid(),
      RESEND_API_KEY: 'real',
      S3_ACCESS_KEY_ID: 'real',
      GOOGLE_CLIENT_ID: 'real',
      PAYLOAD_SECRET: 'real',
      PAYLOAD_DROP_DATABASE: 'true',
    }
    configureTestEnvironment('unit', env)
    expect(env.DATABASE_URL).toBe('')
    expect(env.TEST_DATABASE_URL).toBe('')
    expect(env.RESEND_API_KEY).toBe('')
    expect(env.S3_ACCESS_KEY_ID).toBe('')
    expect(env.GOOGLE_CLIENT_ID).toBe('')
    expect(env.PAYLOAD_SECRET).not.toBe('real')
    expect(env.PAYLOAD_DROP_DATABASE).toBe('')
  })
  it('validates database mode before sanitizing inherited settings', () => {
    expect(() =>
      configureTestEnvironment('database', { ...valid(), DATABASE_URL: 'production' }),
    ).toThrow()
  })
  it('rejects uninitialized test runtimes, leaving ordinary app mode unchanged', () => {
    expect(() => isTestRuntime({ NODE_ENV: 'test' })).toThrow()
    expect(() => isTestRuntime({ VITEST: 'true' })).toThrow()
    expect(isTestRuntime({ NODE_ENV: 'production' })).toBe(false)
  })
})

describe('disposable database marker and side effects', () => {
  function setup(marker: unknown, databaseName = database) {
    for (const [key, value] of Object.entries(valid())) vi.stubEnv(key, value)
    const findOne = vi.fn().mockResolvedValue(marker)
    return { databaseName, collection: vi.fn(() => ({ findOne })) }
  }
  it('requires the marker for this specific run', async () => {
    const db = setup({ _id: testMarkerID, runID, token })
    await expect(verifyTestDatabaseMarker(db)).resolves.toBeUndefined()
    expect(db.collection).toHaveBeenCalledWith('_test-isolation')
  })
  it.each([null, {}, { runID, token: 'other' }, { runID: 'other', token }])(
    'rejects absent or foreign markers: %j',
    async (marker) => {
      await expect(verifyTestDatabaseMarker(setup(marker))).rejects.toThrow('not marked')
    },
  )
  it('rejects a mismatched database before querying it', async () => {
    const db = setup({ runID, token }, 'production')
    await expect(verifyTestDatabaseMarker(db)).rejects.toThrow('name mismatch')
    expect(db.collection).not.toHaveBeenCalled()
  })
  it('uses a no-delivery email adapter', async () => {
    const adapter = testEmailAdapter({ payload: {} as Payload })
    expect(adapter.name).toBe('test-no-delivery')
    await expect(adapter.sendEmail({ to: 'test@example.invalid', text: 'test' })).resolves.toEqual({
      messageId: 'test-no-delivery',
    })
  })
})
