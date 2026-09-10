import type { CollectionConfig } from 'payload'

import { normalizeSkillProgressStage } from './normalizeSkillProgressStage'
import { studentRecordAccess } from './shared'

export const SkillProgress: CollectionConfig = {
  slug: 'skill-progress',
  access: studentRecordAccess,
  admin: {
    group: 'Players',
    useAsTitle: 'label',
    defaultColumns: ['label', 'student', 'skill', 'stage', 'progress'],
  },
  hooks: { beforeChange: [normalizeSkillProgressStage] },
  fields: [
    { name: 'progressKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    { name: 'label', type: 'text', required: true },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      required: true,
      index: true,
      maxDepth: 2,
    },
    { name: 'skill', type: 'relationship', relationTo: 'skills', required: true, maxDepth: 1 },
    {
      name: 'stage',
      type: 'select',
      required: true,
      options: ['not-introduced', 'learning', 'controlled', 'game-ready', 'pressure-ready'],
    },
    { name: 'progress', type: 'number', min: 0, max: 100, required: true },
    { name: 'previousProgress', type: 'number', min: 0, max: 100, defaultValue: 0 },
    { name: 'coachFeedback', type: 'textarea' },
    { name: 'latestSession', type: 'relationship', relationTo: 'training-sessions', maxDepth: 1 },
    { name: 'latestScore', type: 'number', min: 0, max: 5 },
    { name: 'updatedAtAssessment', type: 'date' },
  ],
}
