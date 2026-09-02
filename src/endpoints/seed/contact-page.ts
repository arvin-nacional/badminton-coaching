import type { Form } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type ContactArgs = {
  contactForm: Form
}

export const contactSectionDefaults = {
  blockType: 'contactSection' as const,
  eyebrow: 'Contact Next Shot',
  heading: 'Ask before you commit.',
  description:
    'Questions about coaching, pricing, schedules, or finding a court? Send a message and we will reply with a clear answer, not a sales pitch.',
  channels: [
    { type: 'hours' as const, label: 'Response time', value: 'Usually within one working day' },
    {
      type: 'location' as const,
      label: 'Service area',
      value: 'Badminton venues across Metro Manila',
    },
  ],
  expectations: [
    { text: 'You get a direct reply from the coach, not an automated funnel.' },
    { text: 'Pricing and venue questions are answered before any payment.' },
    { text: 'No obligation to book a session after asking.' },
  ],
  formEyebrow: 'Send a message',
  formHeading: 'Tell us how we can help.',
  formDescription: 'A few details help us give you a useful answer on the first reply.',
  formFootnote: 'We only use your details to reply to this message.',
  showQuickLinks: true,
}

export const contact: (args: ContactArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  contactForm,
}) => ({
  slug: 'contact',
  _status: 'published',
  hero: { type: 'none' },
  layout: [{ ...contactSectionDefaults, form: contactForm }],
  meta: {
    title: 'Contact | Next Shot Badminton Coaching',
    description:
      'Ask about coaching, pricing, schedules, or help finding a court before you book anything.',
  },
  title: 'Contact',
})
