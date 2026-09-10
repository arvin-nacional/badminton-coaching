import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  probeConnect: vi.fn(),
  close: vi.fn(),
  findOne: vi.fn(),
  probe: vi.fn(),
}))
vi.mock('@payloadcms/db-mongodb', () => ({
  mongooseAdapter: ({ url }: { url: string | false }) => ({
    init: () => ({
      url,
      connect: mocks.connect,
      connection: {
        base: {
          mongo: {
            MongoClient: class {
              constructor(...args: unknown[]) {
                mocks.probe(...args)
              }
              connect = mocks.probeConnect
              close = mocks.close
              db = (databaseName: string) => ({
                databaseName,
                collection: () => ({ findOne: mocks.findOne }),
              })
            },
          },
        },
      },
    }),
  }),
}))

import { isolatedTestDatabase } from '@/testing/adapters'

const runID = 'a'.repeat(24)
const token = 'b'.repeat(64)
const database = `badminton_test_${runID}`
const url = `mongodb://test_${runID}:${token}@127.0.0.1:49152/${database}?authSource=${database}&directConnection=true`
beforeEach(() => {
  vi.resetAllMocks()
  for (const [key, value] of Object.entries({
    APP_TEST_MODE: 'database',
    NODE_ENV: 'test',
    TEST_RUN_ID: runID,
    TEST_DATABASE_TOKEN: token,
    TEST_DATABASE_DISPOSABLE: '1',
    TEST_DATABASE_URL: url,
    DATABASE_URL: url,
  }))
    vi.stubEnv(key, value)
})
afterEach(() => vi.unstubAllEnvs())

describe('connection gate before Payload model initialization', () => {
  const adapter = () => isolatedTestDatabase().init({ payload: {} as Payload })

  it('never connects or probes during unit tests', async () => {
    vi.stubEnv('APP_TEST_MODE', 'unit')
    await expect(adapter().connect!()).rejects.toThrow('forbidden')
    expect(mocks.probe).not.toHaveBeenCalled()
    expect(mocks.connect).not.toHaveBeenCalled()
  })
  it('never connects to Payload when the marker is absent', async () => {
    mocks.findOne.mockResolvedValue(null)
    await expect(adapter().connect!()).rejects.toThrow('not marked')
    expect(mocks.close).toHaveBeenCalledOnce()
    expect(mocks.connect).not.toHaveBeenCalled()
  })
  it('never connects to Payload when the probe fails', async () => {
    mocks.probeConnect.mockRejectedValue(new Error('unavailable'))
    await expect(adapter().connect!()).rejects.toThrow('unavailable')
    expect(mocks.close).toHaveBeenCalledOnce()
    expect(mocks.connect).not.toHaveBeenCalled()
  })
  it('connects only after validating and closing the read-only probe', async () => {
    mocks.findOne.mockResolvedValue({ runID, token })
    await adapter().connect!()
    expect(mocks.connect).toHaveBeenCalledOnce()
    expect(mocks.findOne.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.connect.mock.invocationCallOrder[0],
    )
    expect(mocks.close.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.connect.mock.invocationCallOrder[0],
    )
  })
  it('revalidates the environment immediately before connecting', async () => {
    const db = adapter()
    vi.stubEnv('DATABASE_URL', 'mongodb://production/main')
    await expect(db.connect!()).rejects.toThrow('Unsafe test database')
    expect(mocks.probe).not.toHaveBeenCalled()
    expect(mocks.connect).not.toHaveBeenCalled()
  })
})
