import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const programs = await payload.find({
  collection: 'programs',
  depth: 0,
  limit: 1000,
  overrideAccess: true,
})

let integratedLessons = 0

for (const program of programs.docs) {
  const updatedProgram = await payload.update({
    collection: 'programs',
    id: program.id,
    depth: 0,
    data: { phases: program.phases },
    overrideAccess: true,
  })

  integratedLessons += updatedProgram.phases
    .flatMap((phase) => phase.lessons || [])
    .filter((lesson) => lesson.homeDrills.length > 0 && lesson.independentPractice).length
}

const summary = `Integrated home drills into ${programs.totalDocs} programs and ${integratedLessons} lessons.`
payload.logger.info(summary)
console.log(summary)
process.exit(0)
