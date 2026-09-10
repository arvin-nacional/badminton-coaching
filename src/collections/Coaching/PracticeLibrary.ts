import type { CollectionConfig } from 'payload'

import { staffManagedAccess } from './shared'
import { syncPracticeLibraryInstances } from './syncPracticeLibraryInstances'

export const PracticeLibrary: CollectionConfig = {
  slug: 'practice-library',
  labels: { singular: 'Home Practice', plural: 'Home Practice Library' },
  access: staffManagedAccess,
  hooks: { afterChange: [syncPracticeLibraryInstances] },
  admin: {
    group: 'Coaching',
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'durationMinutes'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, index: true },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: ['foundations', 'development', 'competitive'],
    },
    { name: 'instructions', type: 'textarea', required: true },
    {
      name: 'drills',
      type: 'relationship',
      relationTo: 'drills',
      hasMany: true,
      required: true,
      minRows: 1,
      maxDepth: 1,
      filterOptions: {
        practiceSetting: { equals: 'home' },
      },
    },
    { name: 'durationMinutes', type: 'number', required: true, min: 1 },
    { name: 'successCriteria', type: 'textarea', required: true },
  ],
}
