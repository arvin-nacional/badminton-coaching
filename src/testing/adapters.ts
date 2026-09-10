import { mongooseAdapter, type MongooseAdapter } from '@payloadcms/db-mongodb'
import type { EmailAdapter, Payload } from 'payload'
import { assertTestDatabase, testMarkerID } from './environment'

type Marker = { _id: string; runID: string; token: string }
type MarkerDatabase = {
  databaseName: string
  collection: (name: string) => { findOne: (query: { _id: string }) => Promise<unknown> }
}

export async function verifyTestDatabaseMarker(db: MarkerDatabase) {
  const expected = assertTestDatabase()
  if (db.databaseName !== expected.database) throw new Error('Test database name mismatch.')
  const marker = (await db
    .collection('_test-isolation')
    .findOne({ _id: testMarkerID })) as Marker | null
  if (!marker || marker.runID !== expected.runID || marker.token !== expected.token) {
    throw new Error(
      'Database is not marked as this disposable test run. Aborting before Payload connects.',
    )
  }
}

export async function assertTestPayload(payload: Payload) {
  const expected = assertTestDatabase()
  if (payload.db.url !== expected.url || !payload.db.connection.db)
    throw new Error('Test Payload connection mismatch.')
  await verifyTestDatabaseMarker(payload.db.connection.db as unknown as MarkerDatabase)
}

export function isolatedTestDatabase() {
  const unit = process.env.APP_TEST_MODE === 'unit'
  const adapter = mongooseAdapter({
    url: unit ? false : assertTestDatabase().url,
    // Disposable standalone Mongo. Transaction behavior needs a separate replica-set suite.
    transactionOptions: false,
  })
  const originalInit = adapter.init
  adapter.init = (args) => {
    const db = originalInit(args) as MongooseAdapter
    const originalConnect = db.connect
    if (!originalConnect) throw new Error('Test database adapter has no connection method.')
    db.connect = async (options) => {
      if (unit) throw new Error('Database connections are forbidden in mocked/unit tests.')
      const expected = assertTestDatabase()
      if (db.url !== expected.url) throw new Error('Test adapter URL mismatch.')
      // Probe with an independent native client BEFORE Payload opens its model
      // connection (which may create indexes). No database writes in this probe.
      const probe = new db.connection.base.mongo.MongoClient(expected.url, {
        serverSelectionTimeoutMS: 5000,
      })
      try {
        await probe.connect()
        await verifyTestDatabaseMarker(probe.db(expected.database) as unknown as MarkerDatabase)
      } finally {
        await probe.close()
      }
      return originalConnect.call(db, options)
    }
    return db
  }
  return adapter
}

// Never initializes Resend, SMTP, or a provider client, and never logs recipients.
export const testEmailAdapter: EmailAdapter = () => ({
  name: 'test-no-delivery',
  defaultFromAddress: 'test@example.invalid',
  defaultFromName: 'Test',
  sendEmail: async () => ({ messageId: 'test-no-delivery' }),
})
