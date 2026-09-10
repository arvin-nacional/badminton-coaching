import type { CollectionConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { isSessionDuration } from '@/utilities/sessionTiming'
import { staffManagedAccess } from './shared'
import { syncProgramHomePractices } from './syncProgramHomePractices'
import { syncProgramIndependentPractices } from './syncProgramIndependentPractices'
import { syncProgramLessonSkills } from './syncProgramLessonSkills'

export const Programs: CollectionConfig = {
  slug: 'programs',
  access: staffManagedAccess,
  admin: {
    group: 'Coaching',
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'durationWeeks'],
  },
  hooks: {
    beforeValidate: [syncProgramLessonSkills, syncProgramHomePractices],
    afterChange: [
      ({ doc, req: { context } }) => {
        // Invalidate the cached program data so the roadmap and dashboard
        // pick up changes on the next request. Mirrors the posts pattern.
        if (!context.disableRevalidate) {
          revalidateTag(`program-${doc.id}`, 'max')
        }
        return doc
      },
      syncProgramIndependentPractices,
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: ['foundations', 'development', 'competitive'],
    },
    { name: 'description', type: 'textarea', required: true },
    { name: 'durationWeeks', type: 'number', min: 1, required: true },
    {
      name: 'phases',
      type: 'array',
      minRows: 1,
      required: true,
      admin: { initCollapsed: true },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'order', type: 'number', required: true, min: 1 },
        { name: 'startWeek', type: 'number', required: true, min: 1 },
        { name: 'endWeek', type: 'number', required: true, min: 1 },
        {
          name: 'lessons',
          type: 'array',
          minRows: 1,
          required: true,
          admin: { initCollapsed: true },
          fields: [
            { name: 'week', type: 'number', required: true, min: 1 },
            { name: 'title', type: 'text', required: true },
            {
              name: 'lessonType',
              type: 'select',
              required: true,
              options: [
                { label: 'Technical', value: 'technical' },
                { label: 'Movement', value: 'movement' },
                { label: 'Tactical', value: 'tactical' },
                { label: 'Match play', value: 'match-play' },
                { label: 'Assessment', value: 'assessment' },
              ],
            },
            { name: 'objective', type: 'textarea', required: true },
            {
              name: 'durationMinutes',
              label: 'Default training duration',
              type: 'number',
              required: true,
              min: 60,
              max: 120,
              defaultValue: 60,
              validate: (value: unknown) =>
                isSessionDuration(value) || 'Choose a duration of 60, 90, or 120 minutes.',
              admin: {
                step: 30,
                description:
                  'Program sessions start at 60 minutes. Coaches can adjust an individual session to 90 or 120 minutes.',
              },
            },
            {
              name: 'skills',
              label: 'Skills developed and scored',
              type: 'relationship',
              relationTo: 'skills',
              hasMany: true,
              required: true,
              minRows: 1,
              maxDepth: 1,
              admin: {
                readOnly: true,
                description:
                  'Automatically derived from the lesson drills. Generated sessions and coach scorecards use this exact list.',
              },
            },
            {
              name: 'drills',
              type: 'relationship',
              relationTo: 'drills',
              hasMany: true,
              required: true,
              minRows: 1,
              maxDepth: 1,
            },
            {
              name: 'eventVariants',
              label: 'Singles and doubles branches',
              type: 'group',
              admin: {
                description:
                  'Optional event-specific court and home drills. The player’s preferred event selects the matching branch.',
              },
              fields: [
                {
                  name: 'singlesDrills',
                  label: 'Singles session drills',
                  type: 'relationship',
                  relationTo: 'drills',
                  hasMany: true,
                  maxDepth: 1,
                  filterOptions: {
                    and: [
                      { practiceSetting: { not_equals: 'home' } },
                      { eventType: { in: ['general', 'singles'] } },
                    ],
                  },
                },
                {
                  name: 'doublesDrills',
                  label: 'Doubles session drills',
                  type: 'relationship',
                  relationTo: 'drills',
                  hasMany: true,
                  maxDepth: 1,
                  filterOptions: {
                    and: [
                      { practiceSetting: { not_equals: 'home' } },
                      { eventType: { in: ['general', 'doubles'] } },
                    ],
                  },
                },
                {
                  name: 'singlesHomeDrills',
                  label: 'Singles home-practice drills',
                  type: 'relationship',
                  relationTo: 'drills',
                  hasMany: true,
                  maxDepth: 1,
                  filterOptions: {
                    and: [
                      { practiceSetting: { equals: 'home' } },
                      { eventType: { in: ['general', 'singles'] } },
                    ],
                  },
                },
                {
                  name: 'doublesHomeDrills',
                  label: 'Doubles home-practice drills',
                  type: 'relationship',
                  relationTo: 'drills',
                  hasMany: true,
                  maxDepth: 1,
                  filterOptions: {
                    and: [
                      { practiceSetting: { equals: 'home' } },
                      { eventType: { in: ['general', 'doubles'] } },
                    ],
                  },
                },
              ],
            },
            {
              name: 'homePracticeInstructions',
              label: 'Home-Practice Instructions',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'Weekly guidance shown to the student above the generated home-practice drills.',
              },
            },
            {
              name: 'homeDrills',
              label: 'Home Drills',
              type: 'relationship',
              relationTo: 'drills',
              hasMany: true,
              required: true,
              minRows: 1,
              maxDepth: 1,
              filterOptions: { practiceSetting: { equals: 'home' } },
              admin: {
                description:
                  'Exercises assigned for this lesson. Saving the program automatically builds and updates the student home-practice plan.',
              },
            },
            {
              name: 'independentPractice',
              label: 'Generated Home-Practice Plan',
              type: 'relationship',
              relationTo: 'practice-library',
              required: true,
              maxDepth: 1,
              admin: {
                readOnly: true,
                description: 'Automatically generated from the selected Home Drills.',
              },
            },
            { name: 'successCriteria', type: 'textarea', required: true },
            {
              name: 'sessionPlan',
              type: 'group',
              fields: [
                { name: 'warmUp', type: 'textarea', required: true },
                { name: 'movementPreparation', type: 'textarea', required: true },
                { name: 'conditionedGame', type: 'textarea', required: true },
                { name: 'matchPlay', type: 'textarea', required: true },
                { name: 'cooldownAndFeedback', type: 'textarea', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'independentPractices',
      type: 'join',
      collection: 'independent-practices',
      on: 'program',
      admin: {
        allowCreate: false,
        defaultColumns: ['title', 'student', 'lessonWeek', 'status', 'completedAt'],
      },
    },
  ],
}
