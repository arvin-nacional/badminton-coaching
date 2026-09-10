import type { CollectionConfig } from 'payload'

import { ownStudentProfile, staffOnly } from '@/access/coaching'
import { isSessionDuration } from '@/utilities/sessionTiming'
import { relationshipID } from './shared'
import { syncIndependentPractice } from './syncIndependentPractice'
import { syncProgramTrainingSessions } from './syncProgramTrainingSessions'

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
      name: 'trainingDurationMinutes',
      label: 'Program training duration',
      type: 'number',
      min: 60,
      max: 120,
      defaultValue: 60,
      validate: (value: unknown) =>
        value == null || isSessionDuration(value) || 'Choose a duration of 60, 90, or 120 minutes.',
      admin: {
        position: 'sidebar',
        step: 30,
        description:
          'Applies to every planned and scheduled lesson in this player’s current program.',
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
      name: 'healthDataConsentAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the student accepted the health-data use notice.',
      },
    },
    {
      name: 'privacyPolicyVersion',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Policy version accepted with the health-data consent.',
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
