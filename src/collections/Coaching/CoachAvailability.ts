import type { CollectionConfig } from 'payload'

import { staffOnly } from '@/access/coaching'

export const CoachAvailability: CollectionConfig = {
  slug: 'coach-availability',
  labels: { singular: 'Assessment Slot', plural: 'Assessment Availability' },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: () => ({ status: { equals: 'open' } }),
    update: staffOnly,
  },
  admin: {
    group: 'Training',
    useAsTitle: 'startsAt',
    defaultColumns: ['startsAt', 'coach', 'durationMinutes', 'status'],
    description:
      'Add the times that players can choose. The player coordinates and supplies the booked court.',
  },
  fields: [
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      maxDepth: 1,
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'durationMinutes', type: 'number', required: true, min: 15, defaultValue: 60 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      index: true,
      options: ['open', 'blocked'],
    },
  ],
}
