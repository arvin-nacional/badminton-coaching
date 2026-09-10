import type { CollectionConfig } from 'payload'

import { staffManagedAccess, validateHTTPSURL } from './shared'

export const Drills: CollectionConfig = {
  slug: 'drills',
  access: staffManagedAccess,
  admin: {
    group: 'Coaching',
    useAsTitle: 'name',
    defaultColumns: ['name', 'practiceSetting', 'level', 'difficulty', 'durationMinutes'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'skill', type: 'relationship', relationTo: 'skills', required: true, maxDepth: 1 },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: ['foundations', 'development', 'competitive'],
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: ['general', 'singles', 'doubles'],
    },
    {
      name: 'practiceSetting',
      type: 'select',
      required: true,
      defaultValue: 'court',
      index: true,
      options: [
        { label: 'Home practice', value: 'home' },
        { label: 'Court training', value: 'court' },
      ],
      admin: {
        description: 'Controls whether this drill is available in the home-practice library.',
      },
    },
    { name: 'equipment', type: 'text', required: true },
    { name: 'numberOfPlayers', type: 'number', min: 1, required: true },
    { name: 'durationMinutes', type: 'number', min: 1, required: true },
    { name: 'instructions', type: 'textarea', required: true },
    { name: 'coachingPoints', type: 'textarea', required: true },
    { name: 'commonMistakes', type: 'textarea' },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      options: ['easy', 'moderate', 'challenging'],
    },
    {
      name: 'videoURL',
      label: 'Technique video URL',
      type: 'text',
      validate: (value: unknown) => (value ? validateHTTPSURL(value) : true),
      admin: {
        description:
          'Optional tutorial shown before this drill. Replace the external reference with your own secure video URL when it is ready.',
      },
    },
    {
      name: 'illustrationURL',
      type: 'text',
      admin: { description: 'Public image path used for drill cards and detail views.' },
    },
    {
      name: 'stepIllustrationURL',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.practiceSetting === 'home',
        description: 'Contact sheet used to illustrate each numbered home-practice exercise.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'stepIllustrationColumns',
          type: 'number',
          min: 1,
          admin: {
            condition: (_, siblingData) => siblingData?.practiceSetting === 'home',
            width: '50%',
          },
        },
        {
          name: 'stepIllustrationRows',
          type: 'number',
          min: 1,
          admin: {
            condition: (_, siblingData) => siblingData?.practiceSetting === 'home',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'practiceSteps',
      type: 'array',
      labels: { singular: 'Exercise', plural: 'Exercises' },
      admin: {
        condition: (_, siblingData) => siblingData?.practiceSetting === 'home',
        description:
          'Numbered exercises shown as individual illustrated cards in guided home practice.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'instruction', type: 'textarea', required: true },
        { name: 'amount', type: 'text', required: true },
        { name: 'durationSeconds', type: 'number', min: 1 },
      ],
    },
    { name: 'successTarget', type: 'text', required: true },
    { name: 'easierVariation', type: 'textarea' },
    { name: 'harderProgression', type: 'textarea' },
    { name: 'completionRequirement', type: 'textarea' },
  ],
}
