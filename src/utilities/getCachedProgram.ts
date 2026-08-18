import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Program } from '@/payload-types'

/**
 * Fetches a program by ID with depth 1 (populates phases → lessons →
 * independentPractice / drills) and caches the result using Next.js
 * `unstable_cache`.
 *
 * Program documents are identical for every student — only the student
 * profile (current week, preferred event) varies per user. Caching the
 * program means the roadmap and dashboard only need to fetch the lightweight
 * student profile per request; the heavy program document is served from
 * the Next.js data cache.
 *
 * The cache is tagged `program-{id}` so it can be invalidated on demand
 * when a coach updates the program (see the Programs afterChange hook).
 */
export async function getCachedProgram(programID: string): Promise<Program | null> {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const program = await payload.findByID({
        collection: 'programs',
        id: programID,
        depth: 1,
        overrideAccess: true,
      })
      return program as Program
    },
    [`program-${programID}`],
    {
      tags: [`program-${programID}`],
      // Safety net: revalidate at most every 5 minutes even if the
      // afterChange hook is missed (e.g. direct DB edit).
      revalidate: 300,
    },
  )()
}
