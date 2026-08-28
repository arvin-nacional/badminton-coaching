import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { staffOnly } from '@/access/coaching'

export const CoachingSettings: GlobalConfig = {
  slug: 'coaching-settings',
  label: 'Coaching Offer & Trust',
  access: {
    read: () => true,
    update: staffOnly,
  },
  admin: {
    description:
      'Public pricing, service area, policies, coach profile, verified player proof, and health-data notice.',
  },
  fields: [
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          defaultValue: 'Launch pricing',
        },
        {
          name: 'assessmentFeePHP',
          label: '60-minute assessment coaching fee (PHP)',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 900,
        },
        {
          name: 'session60PHP',
          label: '60-minute private coaching fee (PHP)',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 900,
        },
        {
          name: 'session90PHP',
          label: '90-minute private coaching fee (PHP)',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 1300,
        },
        {
          name: 'session120PHP',
          label: '120-minute private coaching fee (PHP)',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 1700,
        },
        {
          name: 'billingNote',
          type: 'textarea',
          required: true,
          defaultValue:
            'Programs are progressive training roadmaps, not prepaid packages. Coaching is billed per completed session at the published rate for its duration.',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'courtFeeMinPerHourPHP',
              label: 'Typical court minimum per hour (PHP)',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 275,
            },
            {
              name: 'courtFeeMaxPerHourPHP',
              label: 'Typical court maximum per hour (PHP)',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 600,
            },
          ],
        },
        {
          name: 'courtFeeNote',
          type: 'textarea',
          required: true,
          defaultValue:
            'Court rental is paid directly to the venue and is not included in the coaching fee. Entrance fees, racket rental, parking, and shuttlecocks may cost extra depending on the venue.',
        },
      ],
    },
    {
      name: 'service',
      type: 'group',
      fields: [
        {
          name: 'area',
          type: 'text',
          required: true,
          defaultValue: 'Metro Manila',
        },
        {
          name: 'details',
          type: 'textarea',
          required: true,
          defaultValue:
            'Sessions are available at suitable badminton venues across Metro Manila, subject to coach schedule and venue availability.',
        },
        {
          name: 'venueOptions',
          type: 'array',
          minRows: 1,
          defaultValue: [
            { option: 'Use a court you already know and book directly with the venue.' },
            { option: 'Ask for venue suggestions near your preferred area.' },
            { option: 'Request help coordinating a suitable court before you pay.' },
          ],
          fields: [{ name: 'option', type: 'text', required: true }],
        },
        {
          name: 'travelPolicy',
          type: 'textarea',
          required: true,
          defaultValue:
            'No travel surcharge applies after a Metro Manila venue is confirmed as within the coach’s service area. For out-of-area requests, any travel fee is quoted and approved before the session is confirmed.',
        },
      ],
    },
    {
      name: 'cancellation',
      type: 'group',
      fields: [
        {
          name: 'noticeHours',
          label: 'Free reschedule notice (hours)',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 24,
        },
        {
          name: 'reschedulePolicy',
          type: 'textarea',
          required: true,
          defaultValue:
            'Reschedule at no coaching-fee charge when you give at least 24 hours’ notice.',
        },
        {
          name: 'latePolicy',
          type: 'textarea',
          required: true,
          defaultValue:
            'With less than 24 hours’ notice, one courtesy reschedule is available per player. After that, the coaching fee or one package credit is used. No-shows use the coaching fee or one package credit.',
        },
        {
          name: 'coachCancellationPolicy',
          type: 'textarea',
          required: true,
          defaultValue:
            'If the coach cancels, you may reschedule or receive a full coaching-fee credit.',
        },
        {
          name: 'venuePolicy',
          type: 'textarea',
          required: true,
          defaultValue:
            'Court cancellations and refunds follow the venue’s own rules because court fees are paid directly to the venue.',
        },
      ],
    },
    {
      name: 'coachProfile',
      type: 'group',
      admin: {
        description:
          'This section stays hidden publicly until a name and biography are supplied. Only publish credentials you can verify.',
      },
      fields: [
        { name: 'publicName', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'biography', type: 'textarea' },
        {
          name: 'credentials',
          type: 'array',
          fields: [
            { name: 'credential', type: 'text', required: true },
            { name: 'issuer', type: 'text' },
            { name: 'year', type: 'number', min: 1900, max: 2100 },
          ],
        },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      admin: {
        description:
          'Only entries with publication permission enabled appear publicly. Use the player’s exact approved wording.',
      },
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'displayName', type: 'text', required: true },
        { name: 'playerContext', type: 'text' },
        { name: 'outcome', type: 'text' },
        {
          name: 'publicationPermission',
          type: 'checkbox',
          required: true,
          defaultValue: false,
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true, defaultValue: 'Contact Next Shot' },
        { name: 'url', type: 'text', required: true, defaultValue: '/contact' },
      ],
    },
    {
      name: 'privacy',
      type: 'group',
      fields: [
        {
          name: 'policyVersion',
          type: 'text',
          required: true,
          defaultValue: '2026-08-27',
        },
        {
          name: 'healthDataNotice',
          type: 'textarea',
          required: true,
          defaultValue:
            'Your injury or health notes are used only to adapt coaching and training safely. They are visible only to authorised coaching staff and are retained with your player or booking record. Do not include details you do not want to share.',
        },
        { name: 'privacyURL', type: 'text', required: true, defaultValue: '/privacy' },
        { name: 'termsURL', type: 'text', required: true, defaultValue: '/terms' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) revalidateTag('global_coaching-settings', 'max')
        return doc
      },
    ],
  },
}
