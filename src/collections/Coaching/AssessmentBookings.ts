import type { CollectionConfig } from 'payload'

import { staffOnly } from '@/access/coaching'
import { syncStudentProfileAfterAssessmentDelete } from './syncStudentProfileAfterAssessmentDelete'

export const AssessmentBookings: CollectionConfig = {
  slug: 'assessment-bookings',
  labels: { singular: 'Assessment Booking', plural: 'Assessment Bookings' },
  hooks: { afterDelete: [syncStudentProfileAfterAssessmentDelete] },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: staffOnly,
    update: staffOnly,
  },
  admin: {
    group: 'Training',
    useAsTitle: 'playerName',
    defaultColumns: ['playerName', 'email', 'slot', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'bookingKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'scheduled',
      options: ['scheduled', 'direct'],
      index: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      index: true,
      maxDepth: 2,
    },
    {
      name: 'slot',
      type: 'relationship',
      relationTo: 'coach-availability',
      index: true,
      maxDepth: 2,
    },
    {
      name: 'availabilityRule',
      type: 'relationship',
      relationTo: 'coach-availability-rules',
      index: true,
      maxDepth: 1,
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
      name: 'startsAt',
      type: 'date',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'durationMinutes', type: 'number', required: true, min: 15 },
    { name: 'location', type: 'text', required: true },
    {
      name: 'courtHelpRequested',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'The player needs help coordinating a court before the assessment.' },
    },
    {
      name: 'courtHelpArea',
      type: 'text',
      admin: { description: 'Preferred city or area for court coordination.' },
    },
    { name: 'playerName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    {
      name: 'playingExperience',
      type: 'select',
      options: [
        { label: 'New to badminton', value: 'new' },
        { label: 'Less than 1 year', value: 'under-1-year' },
        { label: '1–3 years', value: '1-3-years' },
        { label: 'More than 3 years', value: 'over-3-years' },
      ],
    },
    { name: 'preferredEvent', type: 'select', options: ['singles', 'doubles', 'both', 'not-sure'] },
    { name: 'goals', type: 'textarea' },
    { name: 'trainingAvailability', type: 'textarea' },
    { name: 'injuryConsiderations', type: 'textarea' },
    {
      name: 'healthDataConsentAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'privacyPolicyVersion',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Additional information supplied by the player.' },
    },
    {
      name: 'assessmentResults',
      type: 'group',
      admin: {
        description:
          'The coach completes this structured 60-minute assessment in the coach dashboard.',
      },
      fields: [
        { name: 'averageScore', type: 'number', min: 1, max: 5, admin: { readOnly: true } },
        {
          name: 'developmentStage',
          type: 'select',
          options: ['not-introduced', 'learning', 'controlled', 'game-ready', 'pressure-ready'],
        },
        {
          name: 'recommendedPackage',
          type: 'select',
          options: ['foundations', 'development', 'competitive'],
        },
        {
          name: 'movement',
          type: 'group',
          fields: [
            { name: 'readyPosition', type: 'number', min: 1, max: 5 },
            { name: 'fourCornerMovement', type: 'number', min: 1, max: 5 },
            { name: 'frontCourtRecovery', type: 'number', min: 1, max: 5 },
            { name: 'rearCourtRecovery', type: 'number', min: 1, max: 5 },
            { name: 'balanceCoordination', type: 'number', min: 1, max: 5 },
          ],
        },
        {
          name: 'technical',
          type: 'group',
          fields: [
            { name: 'gripChanges', type: 'number', min: 1, max: 5 },
            { name: 'lowServe', type: 'number', min: 1, max: 5 },
            { name: 'overheadClear', type: 'number', min: 1, max: 5 },
            { name: 'dropShot', type: 'number', min: 1, max: 5 },
            { name: 'netShot', type: 'number', min: 1, max: 5 },
            { name: 'lift', type: 'number', min: 1, max: 5 },
            { name: 'drive', type: 'number', min: 1, max: 5 },
          ],
        },
        {
          name: 'tactical',
          type: 'group',
          fields: [
            { name: 'shotConsistency', type: 'number', min: 1, max: 5 },
            { name: 'courtPositioning', type: 'number', min: 1, max: 5 },
            { name: 'shotSelection', type: 'number', min: 1, max: 5 },
            { name: 'recovery', type: 'number', min: 1, max: 5 },
            { name: 'spaceAwareness', type: 'number', min: 1, max: 5 },
            { name: 'performanceUnderPressure', type: 'number', min: 1, max: 5 },
          ],
        },
        {
          name: 'strengths',
          type: 'array',
          maxRows: 3,
          fields: [{ name: 'item', type: 'text', required: true }],
        },
        {
          name: 'trainingPriorities',
          type: 'array',
          maxRows: 3,
          fields: [{ name: 'item', type: 'text', required: true }],
        },
        { name: 'firstSessionFocus', type: 'textarea' },
        { name: 'independentPractice', type: 'textarea' },
        { name: 'coachSummary', type: 'textarea' },
        {
          name: 'completedAt',
          type: 'date',
          admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: ['confirmed', 'completed'],
    },
  ],
}
