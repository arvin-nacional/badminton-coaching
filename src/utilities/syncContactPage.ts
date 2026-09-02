import type { Payload } from 'payload'

import { contactSectionDefaults } from '@/endpoints/seed/contact-page'

/**
 * Upgrades a contact page that still uses the template's bare `formBlock`
 * to the designed `contactSection` block, reusing the existing form so no
 * submissions or email settings are lost. Runs from onInit, so revalidation
 * is disabled (revalidatePath is not allowed during render).
 */
export async function syncContactPage(payload: Payload) {
  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'contact' } },
  })
  const page = pages.docs[0]
  if (!page) return

  const hasContactSection = page.layout.some((block) => block.blockType === 'contactSection')
  const legacyForm = page.layout.find((block) => block.blockType === 'formBlock')
  if (hasContactSection || !legacyForm || legacyForm.blockType !== 'formBlock') return

  const formID = typeof legacyForm.form === 'string' ? legacyForm.form : legacyForm.form.id
  const layout = page.layout.map((block) =>
    block === legacyForm ? { ...contactSectionDefaults, form: formID, id: block.id } : block,
  )

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { layout },
    depth: 0,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  payload.logger.info('Upgraded the contact page to the designed contact section')
}
