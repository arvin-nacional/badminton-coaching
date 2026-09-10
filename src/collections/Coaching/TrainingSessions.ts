import type { CollectionConfig } from 'payload'

import { isSessionDuration } from '@/utilities/sessionTiming'
import { studentRecordAccess } from './shared'
import { syncSessionSkillScores } from './syncSessionSkillScores'
import { syncStudentProfileFromTrainingSession } from './syncStudentProfileFromTrainingSession'

export const TrainingSessions: CollectionConfig = {
  slug: 'training-sessions',
  access: studentRecordAccess,
  admin: {
    group: 'Training',
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'coach', 'program', 'lessonWeek', 'scheduledAt', 'status'],
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const scheduledAt =
          data.scheduledAt !== undefined ? data.scheduledAt : originalDoc?.scheduledAt
        const status = data.status || originalDoc?.status

        if (scheduledAt && (!status || status === 'planned')) data.status = 'scheduled'
        if (!scheduledAt && status === 'scheduled') data.status = 'planned'
        if (data.status === 'completed' && originalDoc?.status !== 'completed') {
          data.completedAt = data.completedAt || new Date().toISOString()
          if (!data.attendance || data.attendance === 'pending') data.attendance = 'present'
        }
        if (originalDoc?.status === 'completed' && data.status && data.status !== 'completed')
          data.completedAt = null

        return data
      },
    ],
    afterChange: [syncSessionSkillScores, syncStudentProfileFromTrainingSession],
  },
  fields: [
    { name: 'sessionKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: ['manual', 'program'],
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      required: true,
      index: true,
      maxDepth: 2,
    },
    { name: 'coach', type: 'relationship', relationTo: 'users', index: true, maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', index: true, maxDepth: 1 },
    { name: 'phase', type: 'text' },
    { name: 'lessonWeek', type: 'number', min: 1, index: true },
    { name: 'objective', type: 'textarea' },
    { name: 'successCriteria', type: 'textarea' },
    {
      name: 'durationMinutes',
      label: 'Training duration',
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
          'Choose 60, 90, or 120 minutes. The coaching plan redistributes time across all session blocks.',
      },
    },
    {
      name: 'durationIsOverride',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
        description:
          'True when this session intentionally differs from the player’s program duration.',
      },
    },
    {
      name: 'skills',
      label: 'Skills developed and scored',
      type: 'relationship',
      relationTo: 'skills',
      hasMany: true,
      maxDepth: 1,
      admin: {
        description:
          'The session plan and coach scorecards share this list. Program sessions copy it from the program lesson.',
      },
    },
    {
      name: 'scheduledAt',
      label: 'Student-booked session time',
      type: 'date',
      index: true,
      admin: {
        description:
          'The student books the court and confirms the reserved date and time from their dashboard.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'location',
      label: 'Booked court',
      type: 'text',
      admin: {
        description:
          'Court name, branch and address supplied by the student after booking the venue.',
      },
    },
    {
      name: 'courtBookedByStudent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Confirms that the student supplied this court booking.',
      },
    },
    {
      name: 'courtBookingUpdatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Most recent time the student confirmed or changed the court booking.',
      },
    },
    {
      name: 'courtHelpRequested',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'The student asked the coach for help finding a suitable venue.',
      },
    },
    {
      name: 'courtHelpRequestedAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'courtHelpArea',
      type: 'text',
      admin: { readOnly: true, description: 'Preferred city or area supplied by the student.' },
    },
    {
      name: 'courtHelpPreferredAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      options: ['planned', 'scheduled', 'completed', 'cancelled', 'missed'],
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'attendance',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'present', 'late', 'absent', 'excused'],
    },
    {
      name: 'plan',
      type: 'group',
      fields: [
        { name: 'warmUp', type: 'textarea' },
        { name: 'movementPreparation', type: 'textarea' },
        { name: 'technicalDrill', type: 'relationship', relationTo: 'drills', maxDepth: 1 },
        { name: 'progressiveDrill', type: 'relationship', relationTo: 'drills', maxDepth: 1 },
        {
          name: 'additionalDrills',
          label: 'Additional Lesson Drills',
          type: 'relationship',
          relationTo: 'drills',
          hasMany: true,
          maxDepth: 1,
          admin: {
            description:
              'Any third or later drill from a program lesson, including assessment benchmarks.',
          },
        },
        { name: 'conditionedGame', type: 'textarea' },
        { name: 'matchPlay', type: 'textarea' },
        { name: 'cooldownAndFeedback', type: 'textarea' },
      ],
    },
    { name: 'coachNotes', type: 'textarea' },
    { name: 'studentSummary', type: 'textarea' },
  ],
}
