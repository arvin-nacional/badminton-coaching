import type { Block } from 'payload'

export const ContactSection: Block = {
  slug: 'contactSection',
  interfaceName: 'ContactSectionBlock',
  labels: { singular: 'Contact Section', plural: 'Contact Sections' },
  fields: [
    { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Contact Next Shot' },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Ask before you commit.',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Questions about coaching, pricing, schedules, or finding a court? Send a message and we will reply with a clear answer, not a sales pitch.',
    },
    {
      name: 'channels',
      type: 'array',
      minRows: 0,
      maxRows: 6,
      admin: {
        initCollapsed: true,
        description:
          'Direct ways to reach the coach. Leave the URL blank for display-only details such as hours.',
      },
      defaultValue: [
        {
          type: 'hours',
          label: 'Response time',
          value: 'Usually within one working day',
        },
        {
          type: 'location',
          label: 'Service area',
          value: 'Badminton venues across Metro Manila',
        },
      ],
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'email',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone / mobile', value: 'phone' },
            { label: 'Chat / messenger', value: 'chat' },
            { label: 'Location / service area', value: 'location' },
            { label: 'Hours / response time', value: 'hours' },
          ],
        },
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Optional: mailto:, tel:, or https:// link.' },
        },
      ],
    },
    {
      name: 'expectations',
      type: 'array',
      minRows: 0,
      maxRows: 5,
      admin: { initCollapsed: true, description: 'What happens after someone sends a message.' },
      defaultValue: [
        { text: 'You get a direct reply from the coach, not an automated funnel.' },
        { text: 'Pricing and venue questions are answered before any payment.' },
        { text: 'No obligation to book a session after asking.' },
      ],
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    { name: 'formEyebrow', type: 'text', defaultValue: 'Send a message' },
    { name: 'formHeading', type: 'text', defaultValue: 'Tell us how we can help.' },
    {
      name: 'formDescription',
      type: 'textarea',
      defaultValue: 'A few details help us give you a useful answer on the first reply.',
    },
    {
      name: 'formFootnote',
      type: 'text',
      defaultValue: 'We only use your details to reply to this message.',
    },
    {
      name: 'showQuickLinks',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Show links to create a free account, view pricing and policies, and read the privacy notice.',
      },
    },
  ],
}
