import type { CollectionConfig } from 'payload'

import { staffManagedAccess } from './shared'

export const Skills: CollectionConfig = {
  slug: 'skills',
  access: staffManagedAccess,
  admin: { group: 'Coaching', useAsTitle: 'name', defaultColumns: ['name', 'category'] },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Stroke technique', value: 'stroke-technique' },
        { label: 'Footwork', value: 'footwork' },
        { label: 'Consistency', value: 'consistency' },
        { label: 'Tactical decisions', value: 'tactical-decisions' },
        { label: 'Match performance', value: 'match-performance' },
        { label: 'Physical readiness', value: 'physical-readiness' },
        { label: 'Training habits', value: 'training-habits' },
      ],
    },
    { name: 'description', type: 'textarea' },
  ],
}
