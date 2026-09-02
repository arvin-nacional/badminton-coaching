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
    {
      emailFrom: '"Next Shot Badminton" \u003Cnoreply@nextshot.example\u003E',
      emailTo: '{{email}}',
      message: {
        root: {
          type: 'root',
          children: [
            paragraph(
              'Thanks for contacting Next Shot Badminton Coaching. We received your message and will reply as soon as we can.',
            ),
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      subject: 'We received your message',
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
        { label: 'Coaching or programs', value: 'coaching' },
        { label: 'Pricing and payment', value: 'pricing' },
        { label: 'Help finding a court', value: 'court' },
        { label: 'Reschedule or cancellation', value: 'schedule' },
        { label: 'Something else', value: 'other' },
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
