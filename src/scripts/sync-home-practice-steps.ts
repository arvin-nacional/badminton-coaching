import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

import { buildHomePracticeSequence } from '@/data/homePracticeSteps'

const payload = await getPayload({ config })
const homeDrills = await payload.find({
  collection: 'drills',
  depth: 0,
  limit: 100,
  overrideAccess: true,
  where: { practiceSetting: { equals: 'home' } },
})

let updated = 0
for (const drill of homeDrills.docs) {
  const sequence = buildHomePracticeSequence(drill.name, drill.instructions)
  if (!sequence) continue

  await payload.update({
    collection: 'drills',
    id: drill.id,
    depth: 0,
    overrideAccess: true,
    data: {
      practiceSteps: sequence.steps,
      stepIllustrationColumns: sequence.columns,
      stepIllustrationRows: sequence.rows,
      stepIllustrationURL: sequence.sheetURL,
    },
  })
  updated += 1
}

payload.logger.info(`Synced illustrated exercise steps for ${updated} home drills.`)
console.log(`Synced illustrated exercise steps for ${updated} home drills.`)
process.exit(updated === 11 ? 0 : 1)
