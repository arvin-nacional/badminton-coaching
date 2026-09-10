import type { CollectionConfig } from 'payload'

import { studentRecordAccess } from './shared'

export const Assignments: CollectionConfig = {
  slug: 'assignments',
  access: studentRecordAccess,
  admin: {
    group: 'Training',
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'drill', 'status', 'dueAt'],
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
    { name: 'drill', type: 'relationship', relationTo: 'drills', required: true, maxDepth: 2 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'assigned',
      options: ['assigned', 'in-progress', 'completed'],
    },
    { name: 'dueAt', type: 'date' },
    { name: 'coachFeedback', type: 'textarea' },
  ],
}
