import type { CollectionConfig } from 'payload'

import {
  authenticatedCoachingUser,
  ownStudentData,
  ownStudentProfile,
  staffOnly,
} from '@/access/coaching'
import { syncIndependentPractice } from './syncIndependentPractice'
import { syncPracticeLibraryInstances } from './syncPracticeLibraryInstances'
import { syncProgramIndependentPractices } from './syncProgramIndependentPractices'

const staffManagedAccess = {
  create: staffOnly,
  delete: staffOnly,
  read: authenticatedCoachingUser,
  update: staffOnly,
}

const studentRecordAccess = {
  create: staffOnly,
  delete: staffOnly,
  read: ownStudentData,
  update: staffOnly,
}

export const Programs: CollectionConfig = {
  slug: 'programs',
  access: staffManagedAccess,
  admin: { group: 'Coaching', useAsTitle: 'name', defaultColumns: ['name', 'level', 'durationWeeks'] },
  hooks: { afterChange: [syncProgramIndependentPractices] },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'level', type: 'select', required: true, options: ['foundations', 'development', 'competitive'] },
    { name: 'description', type: 'textarea', required: true },
    { name: 'durationWeeks', type: 'number', min: 1, required: true },
    {
      name: 'phases', type: 'array', minRows: 1, required: true, admin: { initCollapsed: true }, fields: [
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
            { name: 'durationMinutes', type: 'number', required: true, min: 30, defaultValue: 90 },
            {
              name: 'drills',
              type: 'relationship',
              relationTo: 'drills',
              hasMany: true,
              required: true,
              minRows: 1,
              maxDepth: 1,
            },
            { name: 'independentPractice', type: 'relationship', relationTo: 'practice-library', required: true, maxDepth: 1 },
            { name: 'successCriteria', type: 'textarea', required: true },
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

export const Skills: CollectionConfig = {
  slug: 'skills',
  access: staffManagedAccess,
  admin: { group: 'Coaching', useAsTitle: 'name', defaultColumns: ['name', 'category'] },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    {
      name: 'category', type: 'select', required: true, options: [
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

export const Drills: CollectionConfig = {
  slug: 'drills',
  access: staffManagedAccess,
  admin: { group: 'Coaching', useAsTitle: 'name', defaultColumns: ['name', 'level', 'difficulty', 'durationMinutes'] },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'skill', type: 'relationship', relationTo: 'skills', required: true, maxDepth: 1 },
    { name: 'level', type: 'select', required: true, options: ['foundations', 'development', 'competitive'] },
    { name: 'eventType', type: 'select', required: true, defaultValue: 'general', options: ['general', 'singles', 'doubles'] },
    { name: 'equipment', type: 'text', required: true },
    { name: 'numberOfPlayers', type: 'number', min: 1, required: true },
    { name: 'durationMinutes', type: 'number', min: 1, required: true },
    { name: 'instructions', type: 'textarea', required: true },
    { name: 'coachingPoints', type: 'textarea', required: true },
    { name: 'commonMistakes', type: 'textarea' },
    { name: 'difficulty', type: 'select', required: true, options: ['easy', 'moderate', 'challenging'] },
    { name: 'videoURL', type: 'text' },
    { name: 'successTarget', type: 'text', required: true },
    { name: 'easierVariation', type: 'textarea' },
    { name: 'harderProgression', type: 'textarea' },
    { name: 'completionRequirement', type: 'textarea' },
  ],
}

export const PracticeLibrary: CollectionConfig = {
  slug: 'practice-library',
  labels: { singular: 'Independent Practice', plural: 'Independent Practice Library' },
  access: staffManagedAccess,
  hooks: { afterChange: [syncPracticeLibraryInstances] },
  admin: {
    group: 'Coaching',
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'durationMinutes'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, index: true },
    { name: 'level', type: 'select', required: true, options: ['foundations', 'development', 'competitive'] },
    { name: 'instructions', type: 'textarea', required: true },
    { name: 'drills', type: 'relationship', relationTo: 'drills', hasMany: true, required: true, minRows: 1, maxDepth: 1 },
    { name: 'durationMinutes', type: 'number', required: true, min: 1 },
    { name: 'successCriteria', type: 'textarea', required: true },
  ],
}

export const StudentProfiles: CollectionConfig = {
  slug: 'student-profiles',
  access: { create: staffOnly, delete: staffOnly, read: ownStudentProfile, update: staffOnly },
  admin: { group: 'Players', useAsTitle: 'displayName', defaultColumns: ['displayName', 'program', 'currentPhase', 'sessionsRemaining', 'assessmentStatus'] },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const relationshipID = (value: unknown): string | null => {
          if (typeof value === 'string') return value
          if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
          return null
        }
        const selectedProgramID = relationshipID(data.program)
        const previousProgramID = relationshipID(originalDoc?.program)
        const programID = selectedProgramID || previousProgramID
        const programChanged = Boolean(selectedProgramID && selectedProgramID !== previousProgramID)
        const requestedWeek = typeof data.currentProgramWeek === 'number'
          ? data.currentProgramWeek
          : originalDoc?.currentProgramWeek || 1
        const weekChanged = operation === 'update' && requestedWeek !== originalDoc?.currentProgramWeek

        if (!programID || (operation === 'update' && !programChanged && !weekChanged)) return data

        const program = await req.payload.findByID({
          collection: 'programs',
          id: programID,
          depth: 1,
          req,
        })
        const currentWeek = programChanged ? 1 : Math.min(Math.max(requestedWeek, 1), program.durationWeeks)
        const phases = program.phases?.slice().sort((a, b) => a.order - b.order) || []
        const activePhase = phases.find((phase) => currentWeek >= phase.startWeek && currentWeek <= phase.endWeek) || phases[0]
        const activeLesson = phases.flatMap((phase) => phase.lessons || []).find((lesson) => lesson.week === currentWeek)

        data.currentProgramWeek = currentWeek
        data.currentPhase = activePhase?.name || 'Program assigned'
        data.weeklyFocus = activeLesson?.title || 'Start your new program'
        data.focusExplanation = activeLesson?.objective || program.description

        return data
      },
    ],
    afterChange: [syncIndependentPractice],
  },
  fields: [
    { name: 'displayName', type: 'text', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, unique: true, maxDepth: 1 },
    { name: 'coach', type: 'relationship', relationTo: 'users', maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', maxDepth: 1 },
    { name: 'currentProgramWeek', type: 'number', required: true, min: 1, defaultValue: 1, admin: { description: 'Controls which weekly lesson appears on the student dashboard.' } },
    { name: 'currentPhase', type: 'text', required: true, defaultValue: 'Awaiting initial assessment' },
    { name: 'weeklyFocus', type: 'text', required: true, defaultValue: 'Initial player assessment' },
    { name: 'focusExplanation', type: 'textarea', required: true, defaultValue: 'Complete your initial assessment so your coach can identify your priorities and build your first training plan.' },
    { name: 'packageName', type: 'text', required: true, defaultValue: 'Assessment' },
    { name: 'packageSessions', type: 'number', min: 0, required: true, defaultValue: 0 },
    { name: 'sessionsRemaining', type: 'number', min: 0, required: true, defaultValue: 0 },
    { name: 'attendanceRate', type: 'number', min: 0, max: 100, defaultValue: 100, required: true },
    { name: 'assessmentStatus', type: 'select', defaultValue: 'current', required: true, options: ['required', 'scheduled', 'current'] },
    { name: 'lastTrainingAt', type: 'date' },
  ],
}

export const TrainingSessions: CollectionConfig = {
  slug: 'training-sessions',
  access: studentRecordAccess,
  admin: { group: 'Training', useAsTitle: 'title', defaultColumns: ['title', 'student', 'scheduledAt', 'status'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 2 },
    { name: 'scheduledAt', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'location', type: 'text' },
    { name: 'status', type: 'select', required: true, defaultValue: 'scheduled', options: ['scheduled', 'completed', 'cancelled', 'missed'] },
    { name: 'attendance', type: 'select', defaultValue: 'pending', options: ['pending', 'present', 'late', 'absent', 'excused'] },
    {
      name: 'plan', type: 'group', fields: [
        { name: 'warmUp', type: 'textarea' },
        { name: 'movementPreparation', type: 'textarea' },
        { name: 'technicalDrill', type: 'relationship', relationTo: 'drills', maxDepth: 1 },
        { name: 'progressiveDrill', type: 'relationship', relationTo: 'drills', maxDepth: 1 },
        { name: 'conditionedGame', type: 'textarea' },
        { name: 'matchPlay', type: 'textarea' },
        { name: 'cooldownAndFeedback', type: 'textarea' },
      ],
    },
    { name: 'coachNotes', type: 'textarea' },
    { name: 'studentSummary', type: 'textarea' },
  ],
}

export const SkillProgress: CollectionConfig = {
  slug: 'skill-progress',
  access: studentRecordAccess,
  admin: { group: 'Players', useAsTitle: 'label', defaultColumns: ['label', 'student', 'skill', 'stage', 'progress'] },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 2 },
    { name: 'skill', type: 'relationship', relationTo: 'skills', required: true, maxDepth: 1 },
    { name: 'stage', type: 'select', required: true, options: ['not-introduced', 'learning', 'controlled', 'game-ready', 'pressure-ready'] },
    { name: 'progress', type: 'number', min: 0, max: 100, required: true },
    { name: 'previousProgress', type: 'number', min: 0, max: 100, defaultValue: 0 },
    { name: 'coachFeedback', type: 'textarea' },
    { name: 'updatedAtAssessment', type: 'date' },
  ],
}

export const Assignments: CollectionConfig = {
  slug: 'assignments',
  access: studentRecordAccess,
  admin: { group: 'Training', useAsTitle: 'title', defaultColumns: ['title', 'student', 'drill', 'status', 'dueAt'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 2 },
    { name: 'drill', type: 'relationship', relationTo: 'drills', required: true, maxDepth: 2 },
    { name: 'status', type: 'select', required: true, defaultValue: 'assigned', options: ['assigned', 'in-progress', 'completed'] },
    { name: 'dueAt', type: 'date' },
    { name: 'coachFeedback', type: 'textarea' },
  ],
}

export const IndependentPractices: CollectionConfig = {
  slug: 'independent-practices',
  labels: { singular: 'Student Practice', plural: 'Student Practice Progress' },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: ownStudentData,
    update: staffOnly,
  },
  admin: {
    group: 'Training',
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'program', 'lessonWeek', 'status', 'completedAt'],
  },
  fields: [
    { name: 'practiceKey', type: 'text', required: true, unique: true, index: true, admin: { hidden: true } },
    { name: 'title', type: 'text', required: true },
    { name: 'practice', type: 'relationship', relationTo: 'practice-library', required: true, maxDepth: 2 },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 2 },
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true, maxDepth: 1 },
    { name: 'phase', type: 'text', required: true },
    { name: 'lessonWeek', type: 'number', required: true, min: 1, index: true },
    { name: 'instructions', type: 'textarea', required: true },
    { name: 'drills', type: 'relationship', relationTo: 'drills', hasMany: true, required: true, minRows: 1, maxDepth: 1 },
    { name: 'successCriteria', type: 'textarea', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'assigned', options: ['assigned', 'completed'] },
    { name: 'completedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'coachFeedback', type: 'textarea' },
  ],
}

export const CoachingEvents: CollectionConfig = {
  slug: 'coaching-events',
  access: studentRecordAccess,
  admin: { group: 'Training', useAsTitle: 'title', defaultColumns: ['title', 'student', 'eventType', 'startsAt'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 2 },
    { name: 'eventType', type: 'select', required: true, options: ['assessment', 'tournament', 'other'] },
    { name: 'startsAt', type: 'date', required: true, index: true },
    { name: 'location', type: 'text' },
    { name: 'notes', type: 'textarea' },
  ],
}

export const coachingCollections = [
  Programs,
  Skills,
  Drills,
  PracticeLibrary,
  StudentProfiles,
  TrainingSessions,
  SkillProgress,
  Assignments,
  IndependentPractices,
  CoachingEvents,
]
