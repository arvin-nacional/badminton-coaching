import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

import { seedCoachingLibrary } from '@/endpoints/seed/coaching'

const payload = await getPayload({ config })
const counts = await seedCoachingLibrary(payload)

payload.logger.info(`Done: ${counts.programs} programs, ${counts.skills} skills and ${counts.drills} drills.`)
process.exit(0)
