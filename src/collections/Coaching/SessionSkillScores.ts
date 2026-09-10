import type { CollectionConfig } from 'payload'

import { ownStudentData, staffOnly } from '@/access/coaching'
import { syncSkillProgressFromScore } from './syncSkillProgressFromScore'

export const SessionSkillScores: CollectionConfig = {
  slug: 'session-skill-scores',
  labels: { singular: 'Session Skill Score', plural: 'Session Skill Scores' },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: ownStudentData,
    update: staffOnly,
  },
  admin: {
    group: 'Players',
    useAsTitle: 'label',
    defaultColumns: ['label', 'student', 'session', 'skill', 'status', 'score', 'scoredAt'],
  },
  hooks: { afterChange: [syncSkillProgressFromScore] },
  fields: [
    {
      name: 'scoreKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    { name: 'label', type: 'text', required: true },
    {
      name: 'session',
      type: 'relationship',
      relationTo: 'training-sessions',
      required: true,
      index: true,
      maxDepth: 1,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      required: true,
      index: true,
      maxDepth: 1,
    },
    { name: 'coach', type: 'relationship', relationTo: 'users', index: true, maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', maxDepth: 1 },
    { name: 'lessonWeek', type: 'number', min: 1, index: true },
    {
      name: 'skill',
      type: 'relationship',
      relationTo: 'skills',
      required: true,
      index: true,
      maxDepth: 1,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: ['pending', 'scored', 'not-assessed'],
    },
    { name: 'score', type: 'number', min: 0, max: 5 },
    {
      name: 'evidence',
      type: 'textarea',
      admin: { description: 'What the player demonstrated in this session.' },
    },
    {
      name: 'nextFocus',
      type: 'textarea',
      admin: { description: 'The next coaching priority for this skill.' },
    },
    { name: 'scoredAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
