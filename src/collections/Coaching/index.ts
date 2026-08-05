import type { CollectionConfig } from 'payload'

import {
  authenticatedCoachingUser,
  ownStudentData,
  ownStudentProfile,
  staffOnly,
} from '@/access/coaching'

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
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'level', type: 'select', required: true, options: ['foundations', 'development', 'competitive'] },
    { name: 'description', type: 'textarea', required: true },
    { name: 'durationWeeks', type: 'number', min: 1 },
    {
      name: 'phases', type: 'array', minRows: 1, admin: { initCollapsed: true }, fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'order', type: 'number', required: true, min: 1 },
      ],
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

export const StudentProfiles: CollectionConfig = {
  slug: 'student-profiles',
  access: { create: staffOnly, delete: staffOnly, read: ownStudentProfile, update: staffOnly },
  admin: { group: 'Players', useAsTitle: 'displayName', defaultColumns: ['displayName', 'program', 'currentPhase', 'sessionsRemaining', 'assessmentStatus'] },
  fields: [
    { name: 'displayName', type: 'text', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, unique: true, maxDepth: 1 },
    { name: 'coach', type: 'relationship', relationTo: 'users', maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', maxDepth: 1 },
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
  StudentProfiles,
  TrainingSessions,
  SkillProgress,
  Assignments,
  CoachingEvents,
]
