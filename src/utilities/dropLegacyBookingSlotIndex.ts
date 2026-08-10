import type { Payload } from 'payload'

type MongoIndex = { key: Record<string, number>; name: string; unique?: boolean }
type MongoPayload = Payload & { db: Payload['db'] & { connection?: { db?: { collection: (name: string) => { dropIndex: (name: string) => Promise<unknown>; indexes: () => Promise<MongoIndex[]> } } } } }

export async function dropLegacyBookingSlotIndex(payload: Payload) {
  const collection = (payload as MongoPayload).db.connection?.db?.collection('assessment-bookings')
  if (!collection) return
  const legacyIndex = (await collection.indexes()).find((index) => index.name === 'slot_1' && index.unique && index.key.slot === 1)
  if (!legacyIndex) return
  await collection.dropIndex('slot_1')
  payload.logger.info('Removed legacy unique assessment-bookings.slot index')
}
