import type { CollectionConfig } from 'payload'

import { studentRecordAccess } from './shared'

export const CoachingEvents: CollectionConfig = {
  slug: 'coaching-events',
  access: studentRecordAccess,
  admin: {
    group: 'Training',
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'eventType', 'startsAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      required: true,
      index: true,
      maxDepth: 2,
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: ['assessment', 'tournament', 'other'],
    },
    { name: 'startsAt', type: 'date', required: true, index: true },
    { name: 'location', type: 'text' },
    { name: 'notes', type: 'textarea' },
  ],
}
