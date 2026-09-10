import type { CollectionConfig } from 'payload'

import { staffOnly } from '@/access/coaching'

export const CoachAvailabilityRules: CollectionConfig = {
  slug: 'coach-availability-rules',
  labels: { singular: 'Weekly Availability', plural: 'Weekly Availability' },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: () => ({ active: { equals: true } }),
    update: staffOnly,
  },
  admin: {
    group: 'Training',
    useAsTitle: 'label',
    defaultColumns: ['label', 'coach', 'weekday', 'startTime', 'endTime', 'active'],
    description:
      'Set a repeating weekly time window. Students choose one of these times and supply the court they booked.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'For example: Monday evenings' },
    },
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      maxDepth: 1,
    },
    {
      name: 'weekday',
      type: 'select',
      required: true,
      options: [
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
        { label: 'Sunday', value: '0' },
      ],
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      defaultValue: '08:00',
      admin: { description: '24-hour Manila time, for example 08:00 or 19:00.' },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      defaultValue: '10:00',
      admin: { description: '24-hour Manila time. Must be later than the start time.' },
    },
    { name: 'slotDurationMinutes', type: 'number', required: true, min: 15, defaultValue: 60 },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true, index: true },
  ],
}
