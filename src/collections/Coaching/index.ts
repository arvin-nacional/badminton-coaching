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
import { syncProgramHomePractices } from './syncProgramHomePractices'
import { syncProgramIndependentPractices } from './syncProgramIndependentPractices'
import { syncProgramLessonSkills } from './syncProgramLessonSkills'
import { syncProgramTrainingSessions } from './syncProgramTrainingSessions'
import { syncSessionSkillScores } from './syncSessionSkillScores'
import { syncSkillProgressFromScore } from './syncSkillProgressFromScore'
import { syncStudentProfileFromTrainingSession } from './syncStudentProfileFromTrainingSession'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
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
  admin: {
    group: 'Coaching',
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'durationWeeks'],
  },
  hooks: {
    beforeValidate: [syncProgramLessonSkills, syncProgramHomePractices],
    afterChange: [syncProgramIndependentPractices],
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
    { name: 'videoURL', type: 'text' },
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

export const PracticeLibrary: CollectionConfig = {
  slug: 'practice-library',
  labels: { singular: 'Home Practice', plural: 'Home Practice Library' },
  access: staffManagedAccess,
  hooks: { afterChange: [syncPracticeLibraryInstances] },
  admin: {
    group: 'Coaching',
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'durationMinutes'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, index: true },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: ['foundations', 'development', 'competitive'],
    },
    { name: 'instructions', type: 'textarea', required: true },
    {
      name: 'drills',
      type: 'relationship',
      relationTo: 'drills',
      hasMany: true,
      required: true,
      minRows: 1,
      maxDepth: 1,
      filterOptions: {
        practiceSetting: { equals: 'home' },
      },
    },
    { name: 'durationMinutes', type: 'number', required: true, min: 1 },
    { name: 'successCriteria', type: 'textarea', required: true },
  ],
}

export const StudentProfiles: CollectionConfig = {
  slug: 'student-profiles',
  access: { create: staffOnly, delete: staffOnly, read: ownStudentProfile, update: staffOnly },
  admin: {
    group: 'Players',
    useAsTitle: 'displayName',
    defaultColumns: [
      'displayName',
      'program',
      'currentPhase',
      'sessionsRemaining',
      'assessmentStatus',
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const programWasProvided = Object.prototype.hasOwnProperty.call(data, 'program')
        const selectedProgramID = programWasProvided ? relationshipID(data.program) : null
        const previousProgramID = relationshipID(originalDoc?.program)
        const programID = programWasProvided ? selectedProgramID : previousProgramID
        const programChanged =
          operation === 'update' && programWasProvided && selectedProgramID !== previousProgramID

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
        const lessonWeeks = Array.from(
          new Set(phases.flatMap((phase) => phase.lessons || []).map((lesson) => lesson.week)),
        ).sort((a, b) => a - b)
        const currentWeek =
          lessonWeeks.find((week) => !completedWeeks.has(week)) || lessonWeeks.at(-1) || 1
        const activePhase =
          phases.find((phase) => currentWeek >= phase.startWeek && currentWeek <= phase.endWeek) ||
          phases[0]
        const activeLesson = phases
          .flatMap((phase) => phase.lessons || [])
          .find((lesson) => lesson.week === currentWeek)

        data.currentProgramWeek = currentWeek
        data.currentPhase = activePhase?.name || 'Program assigned'
        data.weeklyFocus = activeLesson?.title || 'Start your new program'
        data.focusExplanation = activeLesson?.objective || program.description
        data.packageName = program.name
        data.packageSessions = lessonWeeks.length || program.durationWeeks
        data.sessionsRemaining = Math.max(
          0,
          (lessonWeeks.length || program.durationWeeks) - completedWeeks.size,
        )

        return data
      },
    ],
    afterChange: [syncIndependentPractice, syncProgramTrainingSessions],
  },
  fields: [
    { name: 'displayName', type: 'text', required: true, index: true },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      maxDepth: 1,
    },
    { name: 'coach', type: 'relationship', relationTo: 'users', maxDepth: 1 },
    { name: 'program', type: 'relationship', relationTo: 'programs', maxDepth: 1 },
    {
      name: 'currentProgramWeek',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
      admin: {
        readOnly: true,
        description:
          'Automatically points to the first program lesson that has not been completed.',
      },
    },
    {
      name: 'currentPhase',
      type: 'text',
      required: true,
      defaultValue: 'Awaiting initial assessment',
      admin: {
        readOnly: true,
        description: 'Automatically derived from the current program lesson.',
      },
    },
    {
      name: 'weeklyFocus',
      type: 'text',
      required: true,
      defaultValue: 'Initial player assessment',
      admin: {
        readOnly: true,
        description: 'Automatically derived from the current program lesson.',
      },
    },
    {
      name: 'focusExplanation',
      type: 'textarea',
      required: true,
      defaultValue:
        'Complete your initial assessment so your coach can identify your priorities and build your first training plan.',
      admin: {
        readOnly: true,
        description: 'Automatically derived from the current program lesson objective.',
      },
    },
    {
      name: 'packageName',
      type: 'text',
      required: true,
      defaultValue: 'Assessment',
      admin: { readOnly: true, description: 'Automatically uses the assigned program name.' },
    },
    {
      name: 'packageSessions',
      type: 'number',
      min: 0,
      required: true,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Automatically uses the number of lessons in the assigned program.',
      },
    },
    {
      name: 'sessionsRemaining',
      type: 'number',
      min: 0,
      required: true,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Automatically recalculated from completed program sessions.',
      },
    },
    { name: 'attendanceRate', type: 'number', min: 0, max: 100, defaultValue: 100, required: true },
    {
      name: 'assessmentStatus',
      type: 'select',
      defaultValue: 'current',
      required: true,
      options: ['required', 'scheduled', 'current'],
    },
    { name: 'lastTrainingAt', type: 'date' },
    {
      name: 'playingExperience',
      type: 'select',
      options: [
        { label: 'New to badminton', value: 'new' },
        { label: 'Less than 1 year', value: 'under-1-year' },
        { label: '1–3 years', value: '1-3-years' },
        { label: 'More than 3 years', value: 'over-3-years' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Captured during student onboarding.',
      },
    },
    {
      name: 'preferredEvent',
      type: 'select',
      options: ['singles', 'doubles', 'both', 'not-sure'],
      admin: {
        position: 'sidebar',
        description: 'Captured during student onboarding.',
      },
    },
    {
      name: 'goals',
      type: 'textarea',
      admin: {
        description: 'What the student wants to achieve. Captured during onboarding.',
      },
    },
    {
      name: 'trainingAvailability',
      type: 'textarea',
      admin: {
        description: 'When the student is available to train. Captured during onboarding.',
      },
    },
    {
      name: 'injuryConsiderations',
      type: 'textarea',
      admin: {
        description: 'Any injuries or health notes. Captured during onboarding.',
      },
    },
    {
      name: 'skillSelfRating',
      type: 'number',
      min: 1,
      max: 10,
      admin: {
        position: 'sidebar',
        description:
          'Student self-rating from 1 (beginner) to 10 (advanced). Captured during onboarding.',
      },
    },
    {
      name: 'trainingFrequencyPerWeek',
      type: 'select',
      options: [
        { label: '1 session per week', value: '1' },
        { label: '2 sessions per week', value: '2' },
        { label: '3 sessions per week', value: '3' },
        { label: '4 or more sessions per week', value: '4+' },
      ],
      admin: {
        position: 'sidebar',
        description: 'How often the student can train. Captured during onboarding.',
      },
    },
    {
      name: 'competitionGoal',
      type: 'select',
      options: [
        { label: 'Casual / fitness', value: 'casual' },
        { label: 'Club-level play', value: 'club' },
        { label: 'Local tournaments', value: 'tournament' },
        { label: 'National / high-performance', value: 'national' },
      ],
      admin: {
        position: 'sidebar',
        description: 'The student\u2019s competitive ambition. Captured during onboarding.',
      },
    },
    {
      name: 'recommendedProgramLevel',
      type: 'select',
      options: ['foundations', 'development', 'competitive'],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Automatically derived from onboarding answers. The coach confirms the final program assignment.',
      },
    },
    {
      name: 'onboardingCompletedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set when the student completes the self-onboarding form.',
      },
    },
    {
      name: 'trainingSessions',
      type: 'join',
      collection: 'training-sessions',
      on: 'student',
      admin: {
        allowCreate: false,
        defaultColumns: ['title', 'coach', 'lessonWeek', 'scheduledAt', 'status', 'attendance'],
      },
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
      admin: {
        allowCreate: false,
        defaultColumns: ['title', 'lessonWeek', 'status', 'completedAt'],
      },
    },
  ],
}

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
    { name: 'durationMinutes', type: 'number', min: 1, defaultValue: 90 },
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
      type: 'date',
      index: true,
      admin: {
        description:
          'Program sessions begin as planned. Set a date and change the status to Scheduled when confirmed.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    { name: 'location', type: 'text' },
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

export const Assignments: CollectionConfig = {
  slug: 'assignments',
  access: studentRecordAccess,
  admin: {
    group: 'Training',
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'drill', 'status', 'dueAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      required: true,
      index: true,
      maxDepth: 2,
    },
    { name: 'drill', type: 'relationship', relationTo: 'drills', required: true, maxDepth: 2 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'assigned',
      options: ['assigned', 'in-progress', 'completed'],
    },
    { name: 'dueAt', type: 'date' },
    { name: 'coachFeedback', type: 'textarea' },
  ],
}

export const IndependentPractices: CollectionConfig = {
  slug: 'independent-practices',
  labels: { singular: 'Student Home Practice', plural: 'Student Home Practice Progress' },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: ownStudentData,
    update: staffOnly,
  },
  admin: {
    group: 'Training',
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'student',
      'program',
      'lessonWeek',
      'timerStatus',
      'currentDrillIndex',
      'elapsedSeconds',
      'status',
    ],
  },
  fields: [
    {
      name: 'practiceKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'practice',
      type: 'relationship',
      relationTo: 'practice-library',
      required: true,
      maxDepth: 2,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      required: true,
      index: true,
      maxDepth: 2,
    },
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true, maxDepth: 1 },
    { name: 'phase', type: 'text', required: true },
    { name: 'lessonWeek', type: 'number', required: true, min: 1, index: true },
    { name: 'instructions', type: 'textarea', required: true },
    {
      name: 'drills',
      type: 'relationship',
      relationTo: 'drills',
      hasMany: true,
      required: true,
      minRows: 1,
      maxDepth: 1,
    },
    { name: 'successCriteria', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'assigned',
      options: ['assigned', 'completed'],
    },
    {
      name: 'timerStatus',
      type: 'select',
      required: true,
      defaultValue: 'not-started',
      options: [
        { label: 'Not started', value: 'not-started' },
        { label: 'Running', value: 'running' },
        { label: 'Paused', value: 'paused' },
        { label: 'Finished', value: 'finished' },
      ],
      admin: {
        readOnly: true,
        description: 'Current state of the student’s home-practice timer.',
      },
    },
    {
      name: 'timerStartedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Start time for the currently running timer segment.',
      },
    },
    {
      name: 'elapsedSeconds',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Accumulated practice time in seconds.',
      },
    },
    {
      name: 'currentDrillIndex',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Zero-based position of the active drill in the guided practice modal.',
      },
    },
    {
      name: 'currentDrillElapsedSeconds',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Accumulated time for the active drill countdown.',
      },
    },
    {
      name: 'currentStepIndex',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Zero-based position of the active exercise inside the current drill.',
      },
    },
    {
      name: 'currentRound',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
      admin: {
        readOnly: true,
        description: 'One-based round number inside the active home-practice drill.',
      },
    },
    {
      name: 'currentStepElapsedSeconds',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Accumulated time for the active exercise.',
      },
    },
    {
      name: 'exerciseLogs',
      type: 'array',
      labels: { singular: 'Exercise log', plural: 'Exercise logs' },
      defaultValue: [],
      admin: {
        readOnly: true,
        description: 'Elapsed time recorded whenever a student completes an exercise.',
      },
      fields: [
        { name: 'drillIndex', type: 'number', required: true, min: 0 },
        { name: 'round', type: 'number', required: true, min: 1 },
        { name: 'stepIndex', type: 'number', required: true, min: 0 },
        { name: 'elapsedSeconds', type: 'number', required: true, min: 0 },
        { name: 'completedAt', type: 'date', required: true },
      ],
    },
    { name: 'completedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'coachFeedback', type: 'textarea' },
  ],
}

export const CoachingEvents: CollectionConfig = {
  slug: 'coaching-events',
  access: studentRecordAccess,
  admin: {
    group: 'Training',
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'eventType', 'startsAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'student-profiles',
      required: true,
      index: true,
      maxDepth: 2,
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: ['assessment', 'tournament', 'other'],
    },
    { name: 'startsAt', type: 'date', required: true, index: true },
    { name: 'location', type: 'text' },
    { name: 'notes', type: 'textarea' },
  ],
}

export const CoachAvailability: CollectionConfig = {
  slug: 'coach-availability',
  labels: { singular: 'Assessment Slot', plural: 'Assessment Availability' },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: () => ({ status: { equals: 'open' } }),
    update: staffOnly,
  },
  admin: {
    group: 'Training',
    useAsTitle: 'startsAt',
    defaultColumns: ['startsAt', 'coach', 'durationMinutes', 'location', 'status'],
    description: 'Add the times that players can choose when booking an initial assessment.',
  },
  fields: [
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
    { name: 'durationMinutes', type: 'number', required: true, min: 15, defaultValue: 60 },
    { name: 'location', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      index: true,
      options: ['open', 'blocked'],
    },
  ],
}

export const CoachAvailabilityRules: CollectionConfig = {
  slug: 'coach-availability-rules',
  labels: { singular: 'Weekly Availability', plural: 'Weekly Availability' },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: () => ({ active: { equals: true } }),
    update: staffOnly,
  },
  admin: {
    group: 'Training',
    useAsTitle: 'label',
    defaultColumns: ['label', 'coach', 'weekday', 'startTime', 'endTime', 'active'],
    description:
      'Set a repeating weekly window. Individual assessment times are created automatically from it.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'For example: Monday evenings' },
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
      name: 'weekday',
      type: 'select',
      required: true,
      options: [
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
        { label: 'Sunday', value: '0' },
      ],
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      defaultValue: '08:00',
      admin: { description: '24-hour Manila time, for example 08:00 or 19:00.' },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      defaultValue: '10:00',
      admin: { description: '24-hour Manila time. Must be later than the start time.' },
    },
    { name: 'slotDurationMinutes', type: 'number', required: true, min: 15, defaultValue: 60 },
    { name: 'location', type: 'text', required: true },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true, index: true },
  ],
}

export const AssessmentBookings: CollectionConfig = {
  slug: 'assessment-bookings',
  labels: { singular: 'Assessment Booking', plural: 'Assessment Bookings' },
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
  CoachAvailability,
  CoachAvailabilityRules,
  AssessmentBookings,
]
