import type { Payload } from 'payload'

import { homeStatic } from '@/endpoints/seed/home-static'

export async function syncFoundationsHomepage(payload: Payload) {
  const replacement = homeStatic.layout.find((block) => block.blockType === 'trainingCycle')
  if (!replacement) return

  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'home' } },
  })
  const home = pages.docs[0]
  if (!home) return

  let changed = false
  const layout = home.layout.map((block) => {
    if (
      block.blockType !== 'trainingCycle' ||
      block.eyebrow !== 'Badminton Foundations' ||
      (block.sessions?.length !== 8 && !block.heading?.toLowerCase().includes('first eight'))
    ) {
      return block
    }

    changed = true
    return { ...replacement, id: block.id }
  })

  if (!changed) return

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout },
    depth: 0,
    overrideAccess: true,
  })
  payload.logger.info('Updated the homepage Badminton Foundations cycle from 8 to 12 sessions')
}
