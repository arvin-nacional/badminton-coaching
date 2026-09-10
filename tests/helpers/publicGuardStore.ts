import type { Payload } from 'payload'
import { vi } from 'vitest'

// Evaluate the limited aggregation operators used by the guard. No MongoDB
// connection is created. These tests verify application logic, not Mongo itself.
function evaluate(expression: unknown, record: Record<string, unknown>): unknown {
  if (typeof expression === 'string' && expression.startsWith('$'))
    return record[expression.slice(1)]
  if (!expression || typeof expression !== 'object' || expression instanceof Date) return expression
  const operation = expression as Record<string, unknown[]>
  if ('$cond' in operation) {
    const [condition, yes, no] = operation.$cond
    return evaluate(evaluate(condition, record) ? yes : no, record)
  }
  const [left, right] = Object.values(operation)[0].map((value) => evaluate(value, record))
  if ('$gt' in operation) return Number(left) > Number(right)
  if ('$add' in operation) return Number(left) + Number(right)
  if ('$ifNull' in operation) return left ?? right
  throw new Error('Unsupported test aggregation operator')
}

export function publicGuardStore() {
  const records = new Map<string, Record<string, unknown>>()
  const collection = {
    createIndex: vi.fn().mockResolvedValue('expiresAt_1'),
    findOneAndUpdate: vi.fn(
      async (
        filter: { _id: string },
        update: { $setOnInsert: Record<string, unknown> } | { $set: Record<string, unknown> }[],
      ) => {
        const previous = records.get(filter._id)
        const record = { _id: filter._id, ...previous }
        if (Array.isArray(update)) {
          Object.assign(
            record,
            Object.fromEntries(
              Object.entries(update[0].$set).map(([key, value]) => [key, evaluate(value, record)]),
            ),
          )
        } else if (!previous) Object.assign(record, update.$setOnInsert)
        records.set(filter._id, record)
        return { ...record }
      },
    ),
  }
  const db = { collection: vi.fn(() => collection) }
  return { records, collection, payload: { db: { connection: { db } } } as unknown as Payload }
}
