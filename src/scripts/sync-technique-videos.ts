import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

import { coachingDrills } from '@/endpoints/seed/coaching'

const payload = await getPayload({ config })
const assignments = coachingDrills.flatMap((drill) =>
  drill.videoURL ? [{ name: drill.name, videoURL: drill.videoURL }] : [],
)
const dryRun = process.argv.includes('--dry-run')

let updated = 0
let unchanged = 0
let pending = 0

const result = await payload.find({
  collection: 'drills',
  depth: 0,
  limit: assignments.length * 2,
  overrideAccess: true,
  pagination: false,
  where: { name: { in: assignments.map((assignment) => assignment.name) } },
})
const drillsByName = new Map<string, typeof result.docs>()
for (const drill of result.docs) {
  const matches = drillsByName.get(drill.name) || []
  matches.push(drill)
  drillsByName.set(drill.name, matches)
}

const invalidAssignments = assignments.filter(
  (assignment) => drillsByName.get(assignment.name)?.length !== 1,
)
if (invalidAssignments.length) {
  throw new Error(
    invalidAssignments
      .map(
        (assignment) =>
          `Expected exactly one drill named "${assignment.name}", found ${drillsByName.get(assignment.name)?.length || 0}.`,
      )
      .join('\n'),
  )
}

for (const assignment of assignments) {
  const drill = drillsByName.get(assignment.name)![0]
  if (drill.videoURL === assignment.videoURL) {
    unchanged += 1
    continue
  }
  if (dryRun) {
    pending += 1
    continue
  }

  await payload.update({
    collection: 'drills',
    id: drill.id,
    depth: 0,
    overrideAccess: true,
    data: { videoURL: assignment.videoURL },
  })
  updated += 1
}

const summary = dryRun
  ? `Technique video sync preview: ${pending} would update, ${unchanged} already current.`
  : `Technique videos ready: ${updated} updated, ${unchanged} already current.`
payload.logger.info(summary)
console.log(summary)
process.exit(0)
