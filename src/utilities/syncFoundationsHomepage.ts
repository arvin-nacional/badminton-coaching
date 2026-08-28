import type { Payload } from 'payload'

import { homeStatic } from '@/endpoints/seed/home-static'

const signupButton = { label: 'Create your free account', url: '/signup' }

const isAssessmentCTA = (button?: { label?: string | null; url?: string | null } | null) =>
  Boolean(
    button?.label?.toLowerCase().includes('assessment') ||
    button?.url === '/book-assessment' ||
    button?.url === '#contact' ||
    button?.url?.startsWith('mailto:'),
  )

export async function syncFoundationsHomepage(payload: Payload) {
  const replacement = homeStatic.layout.find((block) => block.blockType === 'trainingCycle')

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
      replacement &&
      block.blockType === 'trainingCycle' &&
      block.eyebrow === 'Badminton Foundations' &&
      (block.sessions?.length === 8 || block.heading?.toLowerCase().includes('first eight'))
    ) {
      changed = true
      return { ...replacement, id: block.id }
    }

    if (block.blockType === 'coachHero' && isAssessmentCTA(block.primaryButton)) {
      changed = true
      return { ...block, primaryButton: signupButton }
    }

    if (
      (block.blockType === 'assessmentSteps' || block.blockType === 'coachingCTA') &&
      isAssessmentCTA(block.button)
    ) {
      changed = true
      return { ...block, button: signupButton }
    }

    return block
  })

  if (!changed) return

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout },
    depth: 0,
    overrideAccess: true,
  })
  payload.logger.info('Updated the homepage program cycle and account-first calls to action')
}
