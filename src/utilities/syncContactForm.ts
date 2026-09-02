import type { Payload } from 'payload'

import { contactForm } from '@/endpoints/seed/contact-form'

/**
 * Upgrades the contact form's email templates and select-field values if they
 * still match the original seed. Runs from onInit, so it only touches forms
 * that haven't been manually customised from the admin.
 *
 * Detection: the original seed had a single email with the subject
 * "We received your message". If we find that, we replace the emails array
 * and normalise the topic select options so email bodies show human-readable
 * labels instead of slug values.
 */
export async function syncContactForm(payload: Payload) {
  const forms = await payload.find({
    collection: 'forms',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { title: { equals: 'Contact Form' } },
  })
  const form = forms.docs[0]
  if (!form) return

  const emails = form.emails || []
  const hasOldTemplate = emails.length === 1 && emails[0]?.subject === 'We received your message'
  if (!hasOldTemplate) return

  // Normalise the topic select options so values match labels (readable in emails)
  // and add phone validation to the phone field.
  const topicField = contactForm.fields?.find((f) => f.blockType === 'select' && f.name === 'topic')
  const topicOptions = topicField && 'options' in topicField ? topicField.options : undefined
  const fields = (form.fields || []).map((field) => {
    if (field.blockType === 'select' && field.name === 'topic' && topicOptions) {
      return { ...field, options: topicOptions }
    }
    if (field.blockType === 'text' && field.name === 'phone') {
      return { ...field, validation: 'phone' as const }
    }
    return field
  })

  await payload.update({
    collection: 'forms',
    id: form.id,
    data: {
      emails: contactForm.emails,
      fields,
    },
    depth: 0,
    overrideAccess: true,
  })
  payload.logger.info('Upgraded the contact form email templates')
}
