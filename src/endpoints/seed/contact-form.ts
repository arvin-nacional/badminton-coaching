import { RequiredDataFromCollectionSlug } from 'payload'

const paragraph = (text: string) => ({
  type: 'paragraph' as const,
  children: [
    {
      type: 'text' as const,
      detail: 0,
      format: 0,
      mode: 'normal' as const,
      style: '',
      text,
      version: 1,
    },
  ],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

const heading = (text: string) => ({
  type: 'heading' as const,
  children: [
    {
      type: 'text' as const,
      detail: 0,
      format: 0,
      mode: 'normal' as const,
      style: '',
      text,
      version: 1,
    },
  ],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  tag: 'h2' as const,
  version: 1,
})

const listItem = (text: string) => ({
  type: 'listitem' as const,
  children: [
    {
      type: 'text' as const,
      detail: 0,
      format: 0,
      mode: 'normal' as const,
      style: '',
      text,
      version: 1,
    },
  ],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  value: 1,
  version: 1,
})

const list = (items: ReturnType<typeof listItem>[]) => ({
  type: 'list' as const,
  children: items,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  listType: 'bullet' as const,
  tag: 'ul' as const,
  version: 1,
})

export const contactForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        heading('Thanks, your message is on its way.'),
        paragraph(
          'The coach will reply to the email you provided, usually within one working day. There is no obligation to book anything after asking.',
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  confirmationType: 'message',
  createdAt: '2023-01-12T21:47:41.374Z',
  emails: [
    // 1. Auto-reply sent to the person who submitted the form
    {
      emailFrom: '"Next Shot Badminton" \u003Cnoreply@nextshot.example\u003E',
      emailTo: '{{email}}',
      message: {
        root: {
          type: 'root',
          children: [
            paragraph('Hi {{full-name}},'),
            paragraph(
              'Thanks for reaching out to Next Shot Badminton Coaching. We received your message and will reply to this email address within one working day.',
            ),
            heading('What happens next'),
            list([
              listItem('A real reply from the coach, not an automated funnel.'),
              listItem('Pricing and venue questions are answered before any payment.'),
              listItem('No obligation to book a session after asking.'),
            ]),
            paragraph(
              'If your question is urgent, just reply to this email and it will reach the coach directly.',
            ),
            paragraph('— Coach, Next Shot Badminton'),
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      subject: 'We received your message, {{full-name}}',
    },
    // 2. Notification sent to the coach with the full submission
    {
      emailFrom: '"Next Shot Badminton" \u003Cnoreply@nextshot.example\u003E',
      emailTo: '',
      replyTo: '{{email}}',
      message: {
        root: {
          type: 'root',
          children: [paragraph('New submission from the contact form.'), paragraph('{{*:table}}')],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      subject: 'New contact form submission from {{full-name}}',
    },
  ],
  fields: [
    {
      name: 'full-name',
      blockName: 'full-name',
      blockType: 'text',
      label: 'Full name',
      required: true,
      width: 50,
    },
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email',
      required: true,
      width: 50,
    },
    {
      name: 'phone',
      blockName: 'phone',
      blockType: 'text',
      label: 'Mobile number',
      required: false,
      validation: 'phone',
      width: 50,
    },
    {
      name: 'topic',
      blockName: 'topic',
      blockType: 'select',
      label: 'What is this about?',
      required: true,
      width: 50,
      options: [
        { label: 'Coaching or programs', value: 'Coaching or programs' },
        { label: 'Pricing and payment', value: 'Pricing and payment' },
        { label: 'Help finding a court', value: 'Help finding a court' },
        { label: 'Reschedule or cancellation', value: 'Reschedule or cancellation' },
        { label: 'Something else', value: 'Something else' },
      ],
    },
    {
      name: 'message',
      blockName: 'message',
      blockType: 'textarea',
      label: 'Message',
      required: true,
      width: 100,
    },
  ],
  redirect: undefined,
  submitButtonLabel: 'Send message',
  title: 'Contact Form',
  updatedAt: '2023-01-12T21:47:41.374Z',
}
