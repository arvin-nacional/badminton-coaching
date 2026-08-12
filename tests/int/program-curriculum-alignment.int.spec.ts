import { describe, expect, it } from 'vitest'

import { programHomePracticeInstructions } from '@/collections/Coaching/syncProgramHomePractices'
import { sessionPlanDrillAssignments } from '@/collections/Coaching/syncProgramTrainingSessions'
import {
  coachingDrills,
  coachingPrograms,
  homeDrillsForLesson,
  programHomeDrillAssignments,
} from '@/endpoints/seed/coaching'

describe('program curriculum alignment', () => {
  const drillByName = new Map(coachingDrills.map((drill) => [drill.name, drill]))

  it('covers every program week exactly once with reviewed home-practice assignments', () => {
    expect(coachingPrograms).toHaveLength(3)

    for (const program of coachingPrograms) {
      const lessons = program.phases.flatMap((phase) => phase.lessons)
      const expectedWeeks = Array.from({ length: program.durationWeeks }, (_, index) => index + 1)

      expect(lessons.map((lesson) => lesson.week)).toEqual(expectedWeeks)
      expect(Object.keys(programHomeDrillAssignments[program.name]).map(Number)).toEqual(
        expectedWeeks,
      )

      for (const phase of program.phases) {
        expect(phase.lessons.every((lesson) => lesson.week >= phase.startWeek)).toBe(true)
        expect(phase.lessons.every((lesson) => lesson.week <= phase.endWeek)).toBe(true)
      }
    }

    const foundationsLesson = coachingPrograms[0].phases[0].lessons[0]
    expect(() =>
      homeDrillsForLesson(
        'Badminton Foundations',
        { ...foundationsLesson, week: 99 },
        'foundations',
      ),
    ).toThrow('Missing reviewed home-practice assignment')
  })

  it('keeps session drills, home drills, duration and weekly guidance connected', () => {
    for (const program of coachingPrograms) {
      for (const lesson of program.phases.flatMap((phase) => phase.lessons)) {
        expect(lesson.drills.every((drillName) => drillByName.has(drillName))).toBe(true)

        const homeDrills = homeDrillsForLesson(program.name, lesson, program.level)
        expect(homeDrills.length).toBeGreaterThanOrEqual(2)
        expect(homeDrills.length).toBeLessThanOrEqual(3)
        expect(new Set(homeDrills).size).toBe(homeDrills.length)
        expect(
          homeDrills.every((drillName) => drillByName.get(drillName)?.practiceSetting === 'home'),
        ).toBe(true)

        const duration = homeDrills.reduce(
          (total, drillName) => total + (drillByName.get(drillName)?.durationMinutes || 0),
          0,
        )
        expect(duration).toBeGreaterThanOrEqual(15)
        expect(duration).toBeLessThanOrEqual(30)

        expect(lesson.independentPractice).toMatch(/^Complete|^Use/)
        expect(lesson.independentPractice).not.toMatch(
          /\b(with a partner|cooperative sets|half-court games|target rallies|film|video)\b/i,
        )

        const generatedInstructions = programHomePracticeInstructions(
          lesson.objective,
          lesson.independentPractice,
        )
        expect(generatedInstructions).toContain(lesson.objective)
        expect(generatedInstructions).toContain(lesson.independentPractice)
      }
    }
  })

  it('preserves third and later lesson drills in generated coach sessions', () => {
    for (const program of coachingPrograms) {
      for (const lesson of program.phases.flatMap((phase) => phase.lessons)) {
        const assignments = sessionPlanDrillAssignments(lesson.drills)
        expect(assignments.technicalDrill).toBe(lesson.drills[0])
        expect(assignments.progressiveDrill).toBe(lesson.drills[1] || lesson.drills[0])
        expect(assignments.additionalDrills).toEqual(lesson.drills.slice(2))
      }
    }
  })

  it('does not mistake preserve for a serving lesson in fallback mappings', () => {
    const movementLesson = coachingPrograms[1].phases[0].lessons[1]
    const homeDrills = homeDrillsForLesson(
      'Future Program',
      {
        ...movementLesson,
        title: 'Preserve movement quality under load',
        objective: 'Preserve timing, posture and recovery through repeated efforts.',
      },
      'development',
    )

    expect(homeDrills).not.toContain('Low Serve Floor Targets')
  })
})
