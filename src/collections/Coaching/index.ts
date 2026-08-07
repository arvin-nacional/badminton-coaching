import type { CollectionConfig } from 'payload'

import {
  authenticatedCoachingUser,
  ownStudentData,
  ownStudentProfile,
  staffOnly,
} from '@/access/coaching'
import { syncIndependentPractice } from './syncIndependentPractice'
import { normalizeSkillProgressStage } from './normalizeSkillProgressStage'
import { syncPracticeLibraryInstances } from './syncPracticeLibraryInstances'
import { syncProgramIndependentPractices } from './syncProgramIndependentPractices'
import { syncProgramLessonSkills } from './syncProgramLessonSkills'
import { syncProgramTrainingSessions } from './syncProgramTrainingSessions'
import { syncSessionSkillScores } from './syncSessionSkillScores'
import { syncSkillProgressFromScore } from './syncSkillProgressFromScore'
import { syncStudentProfileFromTrainingSession } from './syncStudentProfileFromTrainingSession'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

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
  hooks: {
    beforeValidate: [syncProgramLessonSkills],
    afterChange: [syncProgramIndependentPractices],
  },
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
                description: 'Automatically derived from the lesson drills. Generated sessions and coach scorecards use this exact list.',
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
            { name: 'independentPractice', type: 'relationship', relationTo: 'practice-library', required: true, maxDepth: 1 },
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
        const programWasProvided = Object.prototype.hasOwnProperty.call(data, 'program')
        const selectedProgramID = programWasProvided ? relationshipID(data.program) : null
        const previousProgramID = relationshipID(originalDoc?.program)
        const programID = programWasProvided ? selectedProgramID : previousProgramID
        const programChanged = operation === 'update' && programWasProvided && selectedProgramID !== previousProgramID

        if (!programID) {
          if (programWasProvided) {
            data.currentProgramWeek = 1
            data.currentPhase = 'Awaiting initial assessment'
            data.weeklyFocus = 'Initial player assessment'
            data.focusExplanation = 'Assign a program so the student receives their lesson roadmap.'
            data.packageName = 'Assessment'
            data.packageSessions = 0
            data.sessionsRemaining = 0
          }
          return data
        }

        const program = await req.payload.findByID({
          collection: 'programs',
          id: programID,
          depth: 1,
          req,
        })
        const completedWeeks = new Set<number>()

        if (!programChanged && originalDoc?.id) {
          const completedSessions = await req.payload.find({
            collection: 'training-sessions',
            depth: 0,
            limit: 1000,
            overrideAccess: true,
            req,
            where: {
              and: [
                { student: { equals: originalDoc.id } },
                { program: { equals: programID } },
                { source: { equals: 'program' } },
                { status: { equals: 'completed' } },
              ],
            },
          })

          for (const session of completedSessions.docs) {
            if (typeof session.lessonWeek === 'number') completedWeeks.add(session.lessonWeek)
          }
        }

        const phases = program.phases?.slice().sort((a, b) => a.order - b.order) || []
        const lessonWeeks = Array.from(new Set(
          phases.flatMap((phase) => phase.lessons || []).map((lesson) => lesson.week),
        )).sort((a, b) => a - b)
        const currentWeek = lessonWeeks.find((week) => !completedWeeks.has(week))
          || lessonWeeks.at(-1)
          || 1
        const activePhase = phases.find((phase) => currentWeek >= phase.startWeek && currentWeek <= phase.endWeek) || phases[0]
        const activeLesson = phases.flatMap((phase) => phase.lessons || []).find((lesson) => lesson.week === currentWeek)

        data.currentProgramWeek = currentWeek
        data.currentPhase = activePhase?.name || 'Program assigned'
        data.weeklyFocus = activeLesson?.title || 'Start your new program'
        data.focusExplanation = activeLesson?.objective || program.description
        data.packageName = program.name
        data.packageSessions = lessonWeeks.length || program.durationWeeks
        data.sessionsRemaining = Math.max(0, (lessonWeeks.length || program.durationWeeks) - completedWeeks.size)

        return data
      },
    ],
    afterChange: [syncIndependentPractice, syncProgramTrainingSessions],
  },
  fields: [
    { name: 'displayName', type: 'text', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, unique: true, maxDepth: 1 },
    { name: 'coach', type: 'relationship', relationTo: 'users', maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', maxDepth: 1 },
    { name: 'currentProgramWeek', type: 'number', required: true, min: 1, defaultValue: 1, admin: { readOnly: true, description: 'Automatically points to the first program lesson that has not been completed.' } },
    { name: 'currentPhase', type: 'text', required: true, defaultValue: 'Awaiting initial assessment', admin: { readOnly: true, description: 'Automatically derived from the current program lesson.' } },
    { name: 'weeklyFocus', type: 'text', required: true, defaultValue: 'Initial player assessment', admin: { readOnly: true, description: 'Automatically derived from the current program lesson.' } },
    { name: 'focusExplanation', type: 'textarea', required: true, defaultValue: 'Complete your initial assessment so your coach can identify your priorities and build your first training plan.', admin: { readOnly: true, description: 'Automatically derived from the current program lesson objective.' } },
    { name: 'packageName', type: 'text', required: true, defaultValue: 'Assessment', admin: { readOnly: true, description: 'Automatically uses the assigned program name.' } },
    { name: 'packageSessions', type: 'number', min: 0, required: true, defaultValue: 0, admin: { readOnly: true, description: 'Automatically uses the number of lessons in the assigned program.' } },
    { name: 'sessionsRemaining', type: 'number', min: 0, required: true, defaultValue: 0, admin: { readOnly: true, description: 'Automatically recalculated from completed program sessions.' } },
    { name: 'attendanceRate', type: 'number', min: 0, max: 100, defaultValue: 100, required: true },
    { name: 'assessmentStatus', type: 'select', defaultValue: 'current', required: true, options: ['required', 'scheduled', 'current'] },
    { name: 'lastTrainingAt', type: 'date' },
    {
      name: 'trainingSessions',
      type: 'join',
      collection: 'training-sessions',
      on: 'student',
      admin: { allowCreate: false, defaultColumns: ['title', 'coach', 'lessonWeek', 'scheduledAt', 'status', 'attendance'] },
    },
    {
      name: 'skillDevelopment',
      type: 'join',
      collection: 'skill-progress',
      on: 'student',
      admin: { allowCreate: false, defaultColumns: ['label', 'stage', 'progress', 'latestScore'] },
    },
    {
      name: 'independentPracticeProgress',
      type: 'join',
      collection: 'independent-practices',
      on: 'student',
      admin: { allowCreate: false, defaultColumns: ['title', 'lessonWeek', 'status', 'completedAt'] },
    },
  ],
}

export const TrainingSessions: CollectionConfig = {
  slug: 'training-sessions',
  access: studentRecordAccess,
  admin: { group: 'Training', useAsTitle: 'title', defaultColumns: ['title', 'student', 'coach', 'program', 'lessonWeek', 'scheduledAt', 'status'] },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const scheduledAt = data.scheduledAt !== undefined ? data.scheduledAt : originalDoc?.scheduledAt
        const status = data.status || originalDoc?.status

        if (scheduledAt && (!status || status === 'planned')) data.status = 'scheduled'
        if (!scheduledAt && status === 'scheduled') data.status = 'planned'
        if (data.status === 'completed' && originalDoc?.status !== 'completed') {
          data.completedAt = data.completedAt || new Date().toISOString()
          if (!data.attendance || data.attendance === 'pending') data.attendance = 'present'
        }
        if (originalDoc?.status === 'completed' && data.status && data.status !== 'completed') data.completedAt = null

        return data
      },
    ],
    afterChange: [syncSessionSkillScores, syncStudentProfileFromTrainingSession],
  },
  fields: [
    { name: 'sessionKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    { name: 'source', type: 'select', required: true, defaultValue: 'manual', options: ['manual', 'program'] },
    { name: 'title', type: 'text', required: true },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 2 },
    { name: 'coach', type: 'relationship', relationTo: 'users', index: true, maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', index: true, maxDepth: 1 },
    { name: 'phase', type: 'text' },
    { name: 'lessonWeek', type: 'number', min: 1, index: true },
    { name: 'objective', type: 'textarea' },
    { name: 'successCriteria', type: 'textarea' },
    { name: 'durationMinutes', type: 'number', min: 1, defaultValue: 90 },
    { name: 'skills', label: 'Skills developed and scored', type: 'relationship', relationTo: 'skills', hasMany: true, maxDepth: 1, admin: { description: 'The session plan and coach scorecards share this list. Program sessions copy it from the program lesson.' } },
    { name: 'scheduledAt', type: 'date', index: true, admin: { description: 'Program sessions begin as planned. Set a date and change the status to Scheduled when confirmed.', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'location', type: 'text' },
    { name: 'status', type: 'select', required: true, defaultValue: 'planned', options: ['planned', 'scheduled', 'completed', 'cancelled', 'missed'] },
    { name: 'completedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
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
  hooks: { beforeChange: [normalizeSkillProgressStage] },
  fields: [
    { name: 'progressKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    { name: 'label', type: 'text', required: true },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 2 },
    { name: 'skill', type: 'relationship', relationTo: 'skills', required: true, maxDepth: 1 },
    { name: 'stage', type: 'select', required: true, options: ['not-introduced', 'learning', 'controlled', 'game-ready', 'pressure-ready'] },
    { name: 'progress', type: 'number', min: 0, max: 100, required: true },
    { name: 'previousProgress', type: 'number', min: 0, max: 100, defaultValue: 0 },
    { name: 'coachFeedback', type: 'textarea' },
    { name: 'latestSession', type: 'relationship', relationTo: 'training-sessions', maxDepth: 1 },
    { name: 'latestScore', type: 'number', min: 0, max: 5 },
    { name: 'updatedAtAssessment', type: 'date' },
  ],
}

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
    { name: 'scoreKey', type: 'text', required: true, unique: true, index: true, admin: { hidden: true } },
    { name: 'label', type: 'text', required: true },
    { name: 'session', type: 'relationship', relationTo: 'training-sessions', required: true, index: true, maxDepth: 1 },
    { name: 'student', type: 'relationship', relationTo: 'student-profiles', required: true, index: true, maxDepth: 1 },
    { name: 'coach', type: 'relationship', relationTo: 'users', index: true, maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', maxDepth: 1 },
    { name: 'lessonWeek', type: 'number', min: 1, index: true },
    { name: 'skill', type: 'relationship', relationTo: 'skills', required: true, index: true, maxDepth: 1 },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', options: ['pending', 'scored', 'not-assessed'] },
    { name: 'score', type: 'number', min: 0, max: 5 },
    { name: 'evidence', type: 'textarea', admin: { description: 'What the player demonstrated in this session.' } },
    { name: 'nextFocus', type: 'textarea', admin: { description: 'The next coaching priority for this skill.' } },
    { name: 'scoredAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
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
  SessionSkillScores,
  Assignments,
  IndependentPractices,
  CoachingEvents,
]
