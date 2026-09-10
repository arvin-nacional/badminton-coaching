// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import type { Access, AccessArgs, PayloadRequest } from 'payload'

// Evaluate the real sanitized configuration without initializing Payload or its DB.
vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() => {
      throw new Error('Database initialization is forbidden in collection tests')
    }),
  }
})

import configPromise from '@/payload.config'
import * as Coaching from '@/collections/Coaching'
import {
  relationshipID,
  staffManagedAccess,
  studentRecordAccess,
  validateHTTPSURL,
} from '@/collections/Coaching/shared'
import { normalizeSkillProgressStage } from '@/collections/Coaching/normalizeSkillProgressStage'
import { syncIndependentPractice } from '@/collections/Coaching/syncIndependentPractice'
import { syncPracticeLibraryInstances } from '@/collections/Coaching/syncPracticeLibraryInstances'
import { syncProgramHomePractices } from '@/collections/Coaching/syncProgramHomePractices'
import { syncProgramIndependentPractices } from '@/collections/Coaching/syncProgramIndependentPractices'
import { syncProgramLessonSkills } from '@/collections/Coaching/syncProgramLessonSkills'
import { syncProgramTrainingSessions } from '@/collections/Coaching/syncProgramTrainingSessions'
import { syncSessionSkillScores } from '@/collections/Coaching/syncSessionSkillScores'
import { syncSkillProgressFromScore } from '@/collections/Coaching/syncSkillProgressFromScore'
import { syncStudentProfileAfterAssessmentDelete } from '@/collections/Coaching/syncStudentProfileAfterAssessmentDelete'
import { syncStudentProfileFromTrainingSession } from '@/collections/Coaching/syncStudentProfileFromTrainingSession'

const reqFor = (roles?: ('admin' | 'coach' | 'student')[] | null, signedIn = true) =>
  ({
    user: signedIn ? { id: 'coaching-test-user', collection: 'users', roles } : null,
    headers: new Headers(),
    context: {},
  }) as PayloadRequest

const evaluate = (access: Access | undefined, req: PayloadRequest) => {
  expect(access).toBeTypeOf('function')
  return access!({ req } as AccessArgs)
}

// The order matters: it drives the admin sidebar and generated type order.
const expectedSlugs = [
  'programs',
  'skills',
  'drills',
  'practice-library',
  'student-profiles',
  'training-sessions',
  'skill-progress',
  'session-skill-scores',
  'assignments',
  'independent-practices',
  'coaching-events',
  'coach-availability',
  'coach-availability-rules',
  'assessment-bookings',
]

describe('coaching collections module split', () => {
  it('exports the same fourteen collections in the original order', () => {
    expect(Coaching.coachingCollections.map((c) => c.slug)).toEqual(expectedSlugs)
  })

  it('re-exports each collection as the identical object used in the aggregate list', () => {
    const named = [
      Coaching.Programs,
      Coaching.Skills,
      Coaching.Drills,
      Coaching.PracticeLibrary,
      Coaching.StudentProfiles,
      Coaching.TrainingSessions,
      Coaching.SkillProgress,
      Coaching.SessionSkillScores,
      Coaching.Assignments,
      Coaching.IndependentPractices,
      Coaching.CoachingEvents,
      Coaching.CoachAvailability,
      Coaching.CoachAvailabilityRules,
      Coaching.AssessmentBookings,
    ]
    named.forEach((collection, index) => {
      expect(collection).toBe(Coaching.coachingCollections[index])
    })
  })

  it('registers every coaching collection in the sanitized Payload config', async () => {
    const config = await configPromise
    const registered = config.collections.map((c) => c.slug)
    for (const slug of expectedSlugs) expect(registered).toContain(slug)
    expect(new Set(registered).size).toBe(registered.length)
  })

  it('keeps every lifecycle hook wired to the collection it belonged to', () => {
    const {
      AssessmentBookings,
      PracticeLibrary,
      Programs,
      SessionSkillScores,
      SkillProgress,
      StudentProfiles,
      TrainingSessions,
    } = Coaching

    expect(Programs.hooks?.beforeValidate).toEqual([
      syncProgramLessonSkills,
      syncProgramHomePractices,
    ])
    expect(Programs.hooks?.afterChange).toHaveLength(2)
    expect(Programs.hooks?.afterChange?.[1]).toBe(syncProgramIndependentPractices)

    expect(PracticeLibrary.hooks?.afterChange).toEqual([syncPracticeLibraryInstances])

    expect(StudentProfiles.hooks?.beforeChange).toHaveLength(1)
    expect(StudentProfiles.hooks?.afterChange).toEqual([
      syncIndependentPractice,
      syncProgramTrainingSessions,
    ])

    expect(TrainingSessions.hooks?.beforeChange).toHaveLength(1)
    expect(TrainingSessions.hooks?.afterChange).toEqual([
      syncSessionSkillScores,
      syncStudentProfileFromTrainingSession,
    ])

    expect(SkillProgress.hooks?.beforeChange).toEqual([normalizeSkillProgressStage])
    expect(SessionSkillScores.hooks?.afterChange).toEqual([syncSkillProgressFromScore])
    expect(AssessmentBookings.hooks?.afterDelete).toEqual([syncStudentProfileAfterAssessmentDelete])
  })

  it('shares the access presets instead of duplicating them per collection', () => {
    const { Assignments, CoachingEvents, Drills, PracticeLibrary, Programs, Skills } = Coaching
    const { SkillProgress, TrainingSessions } = Coaching

    // Payload's sanitizer rebuilds each collection's access object (adding
    // `unlock`), so compare the operation functions rather than object identity.
    const ops = ['create', 'read', 'update', 'delete'] as const
    for (const c of [Programs, Skills, Drills, PracticeLibrary]) {
      for (const op of ops) expect(c.access?.[op]).toBe(staffManagedAccess[op])
    }
    for (const c of [TrainingSessions, SkillProgress, Assignments, CoachingEvents]) {
      for (const op of ops) expect(c.access?.[op]).toBe(studentRecordAccess[op])
    }
  })

  it('skips program cache invalidation when revalidation is disabled', () => {
    const revalidate = Coaching.Programs.hooks!.afterChange![0]
    const doc = { id: 'program-1' }
    // Only `doc` and `req.context` are read by the hook.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (revalidate as any)({ doc, req: { context: { disableRevalidate: true } } })
    expect(result).toBe(doc)
  })
})

describe('shared coaching access presets', () => {
  const visitor = reqFor(undefined, false)
  const student = reqFor(['student'])
  const coach = reqFor(['coach'])
  const admin = reqFor(['admin'])

  it('staffManagedAccess: any signed-in user reads, only staff writes', async () => {
    expect(await evaluate(staffManagedAccess.read, visitor)).toBe(false)
    expect(await evaluate(staffManagedAccess.read, student)).toBe(true)
    expect(await evaluate(staffManagedAccess.read, coach)).toBe(true)

    for (const op of ['create', 'update', 'delete'] as const) {
      expect(await evaluate(staffManagedAccess[op], visitor)).toBe(false)
      expect(await evaluate(staffManagedAccess[op], student)).toBe(false)
      expect(await evaluate(staffManagedAccess[op], coach)).toBe(true)
      expect(await evaluate(staffManagedAccess[op], admin)).toBe(true)
    }
  })

  it('studentRecordAccess: students are scoped to their own records, staff see all', async () => {
    expect(await evaluate(studentRecordAccess.read, visitor)).toBe(false)
    expect(await evaluate(studentRecordAccess.read, student)).toEqual({
      'student.user': { equals: 'coaching-test-user' },
    })
    expect(await evaluate(studentRecordAccess.read, coach)).toBe(true)
    expect(await evaluate(studentRecordAccess.read, admin)).toBe(true)

    for (const op of ['create', 'update', 'delete'] as const) {
      expect(await evaluate(studentRecordAccess[op], student)).toBe(false)
      expect(await evaluate(studentRecordAccess[op], coach)).toBe(true)
    }
  })
})

describe('shared coaching helpers', () => {
  it('relationshipID unwraps string IDs and populated documents', () => {
    expect(relationshipID('abc')).toBe('abc')
    expect(relationshipID({ id: 'abc', name: 'Populated' })).toBe('abc')
    expect(relationshipID({ id: 123 })).toBeNull()
    expect(relationshipID(null)).toBeNull()
    expect(relationshipID(undefined)).toBeNull()
    expect(relationshipID(42)).toBeNull()
  })

  it('validateHTTPSURL only accepts complete https URLs', () => {
    expect(validateHTTPSURL('https://example.com/video')).toBe(true)
    expect(validateHTTPSURL('http://example.com/video')).toMatch(/secure URL/)
    expect(validateHTTPSURL('example.com/video')).toMatch(/complete video URL/)
    expect(validateHTTPSURL('')).toMatch(/Enter a video URL/)
    expect(validateHTTPSURL('   ')).toMatch(/Enter a video URL/)
    expect(validateHTTPSURL(undefined)).toMatch(/Enter a video URL/)
  })
})
