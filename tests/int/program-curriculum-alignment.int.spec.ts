import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { programHomePracticeInstructions } from '@/collections/Coaching/syncProgramHomePractices'
import {
  programSessionDuration,
  sessionPlanDrillAssignments,
} from '@/collections/Coaching/syncProgramTrainingSessions'
import {
  coachingDrills,
  coachingPrograms,
  homeDrillsForLesson,
  programHomeDrillAssignments,
} from '@/endpoints/seed/coaching'
import { drillIllustrationFor } from '@/utilities/drillIllustration'
import {
  programLessonDrillsForEvent,
  programLessonHomeDrillsForEvent,
} from '@/utilities/programEventBranches'
import {
  buildSessionTiming,
  normalizeSessionDuration,
  sessionDurationOptions,
  stripSessionTimePrefix,
} from '@/utilities/sessionTiming'
import { trainingVideosFromDrills } from '@/utilities/trainingVideos'

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

  it('assigns the reviewed technique videos to the matching drills', () => {
    const expectedVideos = {
      'Solo Racket Control Circuit': 'https://www.youtube.com/watch?v=zCq36gnqGdI',
      'Grip Change Tap-Ups': 'https://www.youtube.com/watch?v=toQ7tOx7Tvs',
      'Reactive Split-Step Cues': 'https://www.youtube.com/watch?v=gy4YZS5tGxE',
      'Compact Home Footwork': 'https://www.youtube.com/watch?v=fBa08o5GEqw',
      'Four-Corner Shadow Rhythm': 'https://www.youtube.com/watch?v=fBa08o5GEqw',
      'Lunge, Net and Recover': 'https://www.youtube.com/watch?v=doV0m6MNTCo',
      'Lift for Length': 'https://www.youtube.com/watch?v=yRLtypZzJ1E',
      'Low Serve Floor Targets': 'https://www.youtube.com/watch?v=kzWpvuWeih0',
      'Low Serve Gate': 'https://www.youtube.com/watch?v=kzWpvuWeih0',
      'High Serve and First Recovery': 'https://www.youtube.com/watch?v=Q5AY-sNovX4',
      'Overhead Shadow Technique': 'https://www.youtube.com/watch?v=xRv1JLg4NMM',
      'Clear to Targets': 'https://www.youtube.com/watch?v=xRv1JLg4NMM',
      'Clear-Drop Decision Rally': 'https://www.youtube.com/watch?v=u--taRfMoTs',
      'Three-Shot Attack Pattern': 'https://www.youtube.com/watch?v=H7kpZ9inc10',
      'Wall Drive and Defence': 'https://www.youtube.com/watch?v=VICxkR6BijI',
      'Drive Channel Exchange': 'https://www.youtube.com/watch?v=_6hffa-Jmpk',
    } as const

    for (const [drillName, expectedURL] of Object.entries(expectedVideos)) {
      expect(drillByName.get(drillName)?.videoURL).toBe(expectedURL)
    }

    const videoURLs = coachingDrills.flatMap((drill) => (drill.videoURL ? [drill.videoURL] : []))
    for (const videoURL of videoURLs) {
      const url = new URL(videoURL)
      expect(url.protocol).toBe('https:')
      expect(url.hostname).toBe('www.youtube.com')
      expect(url.pathname).toBe('/watch')
      expect([...url.searchParams.keys()]).toEqual(['v'])
    }
    expect(videoURLs).not.toContain('https://www.youtube.com/watch?v=msLbOiLoGWw')
    expect(videoURLs).not.toContain('https://www.youtube.com/watch?v=F7Clf4SnTlI')

    const clearDrill = drillByName.get('Clear to Targets')!
    const overheadDrill = drillByName.get('Overhead Shadow Technique')!
    expect(trainingVideosFromDrills([clearDrill, overheadDrill])).toEqual([
      {
        title: 'Clear to Targets',
        url: 'https://www.youtube.com/watch?v=xRv1JLg4NMM',
        level: 'foundations',
        source: 'YouTube reference',
      },
    ])
    expect(
      trainingVideosFromDrills([
        {
          name: 'Unsafe legacy video',
          level: 'foundations',
          videoURL: 'javascript:alert(1)',
        },
      ]),
    ).toEqual([])
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

  it('defaults program lessons to one hour and exactly rebalances each duration preset', () => {
    for (const program of coachingPrograms) {
      for (const lesson of program.phases.flatMap((phase) => phase.lessons)) {
        expect(lesson.durationMinutes).toBe(60)
      }
    }

    for (const duration of sessionDurationOptions) {
      for (const drillCount of [2, 3]) {
        const timing = buildSessionTiming(duration, drillCount)
        expect(timing.durationMinutes).toBe(duration)
        expect(timing.total).toBe(duration)
        expect(timing.drillMinutes).toHaveLength(drillCount)
        expect(timing.drillMinutes.every((minutes) => minutes > 0)).toBe(true)
      }
    }

    expect(normalizeSessionDuration(undefined)).toBe(60)
    expect(normalizeSessionDuration(90)).toBe(90)
    expect(programSessionDuration(60, 90, 90)).toBe(60)
    expect(programSessionDuration(120, 60, 60)).toBe(120)
    expect(programSessionDuration(undefined, 90, 60)).toBe(90)
    expect(programSessionDuration(60, 120, 60, true)).toBe(120)
    expect(stripSessionTimePrefix('10 min — Rehearse split steps.')).toBe('Rehearse split steps.')
  })

  it('uses compatible event branches only where the curriculum calls for specialization', () => {
    for (const program of coachingPrograms) {
      const expectedBranchedWeeks =
        program.name === 'Badminton Foundations'
          ? [9, 10, 11]
          : Array.from({ length: program.durationWeeks }, (_, index) => index + 1)

      for (const lesson of program.phases.flatMap((phase) => phase.lessons)) {
        expect(Boolean(lesson.eventVariants)).toBe(expectedBranchedWeeks.includes(lesson.week))
        if (!lesson.eventVariants) continue

        for (const event of ['singles', 'doubles'] as const) {
          const sessionDrills = programLessonDrillsForEvent(lesson, event)
          const homeDrills = programLessonHomeDrillsForEvent(lesson, event)

          expect(sessionDrills.length).toBeGreaterThanOrEqual(2)
          expect(homeDrills.length).toBeGreaterThanOrEqual(2)
          expect(buildSessionTiming(90, sessionDrills.length).total).toBe(90)
          expect(
            sessionDrills.some((name) => drillByName.get(name)?.eventType === event),
            `${program.name} ${event} week ${lesson.week} needs an event-specific session drill`,
          ).toBe(true)
          expect(homeDrills.some((name) => drillByName.get(name)?.eventType === event)).toBe(true)

          for (const drillName of sessionDrills) {
            const drill = drillByName.get(drillName)
            expect(
              drill,
              `${program.name} ${event} week ${lesson.week}: ${drillName}`,
            ).toBeDefined()
            expect(['general', event]).toContain(drill?.eventType)
            expect(drill?.practiceSetting).not.toBe('home')
          }

          for (const drillName of homeDrills) {
            const drill = drillByName.get(drillName)
            expect(
              drill,
              `${program.name} ${event} home week ${lesson.week}: ${drillName}`,
            ).toBeDefined()
            expect(['general', event]).toContain(drill?.eventType)
            expect(drill?.practiceSetting).toBe('home')
          }
        }
      }
    }

    const competitive = coachingPrograms.find(
      (program) => program.name === 'Competitive Performance',
    )!
    const lessons = competitive.phases.flatMap((phase) => phase.lessons)
    expect(programLessonDrillsForEvent(lessons[0], 'both')).toEqual(
      lessons[0].eventVariants?.singlesDrills,
    )
    expect(programLessonDrillsForEvent(lessons[1], 'both')).toEqual(
      lessons[1].eventVariants?.doublesDrills,
    )
  })

  it('keeps Foundations shared until late-phase event introductions', () => {
    const foundations = coachingPrograms.find(
      (program) => program.name === 'Badminton Foundations',
    )!
    const lessons = foundations.phases.flatMap((phase) => phase.lessons)

    for (const lesson of lessons) {
      if (lesson.week <= 8 || lesson.week === 12) {
        expect(lesson.eventVariants).toBeUndefined()
        expect(programLessonDrillsForEvent(lesson, 'singles')).toEqual(lesson.drills)
        expect(programLessonDrillsForEvent(lesson, 'doubles')).toEqual(lesson.drills)
      }

      for (const event of ['singles', 'doubles'] as const) {
        const selected = programLessonDrillsForEvent(lesson, event)
        expect(selected).not.toContain('Singles Corner Pressure Rally')
        expect(selected).not.toContain('Doubles First Four Shots')
        expect(selected.every((name) => (drillByName.get(name)?.numberOfPlayers || 0) <= 2)).toBe(
          true,
        )
        if ([9, 10, 11].includes(lesson.week)) expect(selected).toHaveLength(2)
      }
    }

    expect(lessons.find((lesson) => lesson.week === 1)?.eventVariants).toBeUndefined()
    expect(lessons.find((lesson) => lesson.week === 12)?.eventVariants).toBeUndefined()
    expect(drillByName.get('Low Serve Gate')?.eventType).toBe('general')
    expect(drillByName.get('Low Serve Floor Targets')?.eventType).toBe('general')

    const rallyLadder = drillByName.get('Progressive Rally Ladder')
    expect(rallyLadder?.instructions).toMatch(/5 consecutive legal shots/i)
    expect(rallyLadder?.instructions).toMatch(/then 10, then 15/i)
    expect(rallyLadder?.successTarget).toMatch(/5-, 10- and 15-shot levels/i)
  })

  it('limits repeated competitive scenarios and removes the fixed 18-all prescription', () => {
    const competitive = coachingPrograms.find(
      (program) => program.name === 'Competitive Performance',
    )!
    const lessons = competitive.phases.flatMap((phase) => phase.lessons)

    for (const event of ['singles', 'doubles'] as const) {
      const selectedSessions = lessons.map((lesson) => programLessonDrillsForEvent(lesson, event))
      const allDrills = selectedSessions.flat()
      const sequenceCounts = new Map<string, number>()

      for (const sessionDrills of selectedSessions) {
        const key = sessionDrills.join('|')
        sequenceCounts.set(key, (sequenceCounts.get(key) || 0) + 1)
      }

      expect(allDrills).not.toContain('Pressure Score: 18-All')
      expect(allDrills.filter((name) => name === 'Progressive Score Scenarios')).toHaveLength(5)
      expect(Math.max(...sequenceCounts.values())).toBeLessThanOrEqual(2)
    }

    const scenario = drillByName.get('Progressive Score Scenarios')
    expect(scenario?.instructions).toContain('15-11 lead')
    expect(scenario?.instructions).toContain('16-18 behind')
    expect(scenario?.instructions).toContain('20-all deuce')
  })

  it('keeps between-rally resets separate from regulation intervals', () => {
    const interval = drillByName.get('Regulation Interval Simulation')
    expect(interval?.instructions).toMatch(/leading score reaches 11/i)
    expect(interval?.instructions).toMatch(/60-second interval/i)
    expect(interval?.instructions).toMatch(/between games/i)
    expect(interval?.instructions).toMatch(/120 seconds/i)
    expect(interval?.instructions).toMatch(/ordinary rally breaks as intervals/i)

    const competitive = coachingPrograms.find(
      (program) => program.name === 'Competitive Performance',
    )!
    const resetLesson = competitive.phases
      .flatMap((phase) => phase.lessons)
      .find((lesson) => lesson.week === 13)!
    expect(programLessonDrillsForEvent(resetLesson, 'singles')).not.toContain(
      'Regulation Interval Simulation',
    )
    expect(programLessonDrillsForEvent(resetLesson, 'doubles')).not.toContain(
      'Regulation Interval Simulation',
    )
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

  it('provides a local illustration for every court drill', () => {
    const courtDrills = coachingDrills.filter((drill) => drill.practiceSetting !== 'home')
    const illustrationURLs = courtDrills.map((drill) => drill.illustrationURL)

    expect(courtDrills).toHaveLength(25)
    expect(illustrationURLs.every(Boolean)).toBe(true)
    expect(new Set(illustrationURLs).size).toBe(courtDrills.length)

    for (const illustrationURL of illustrationURLs) {
      expect(existsSync(path.join(process.cwd(), 'public', illustrationURL!))).toBe(true)
    }
  })

  it('falls back to the reviewed court artwork for existing drill records', () => {
    expect(drillIllustrationFor({ name: 'Low Serve Gate', illustrationURL: null })).toBe(
      '/images/drills/low-serve-gate.png',
    )
  })

  it('uses dedicated artwork for reset rehearsal instead of the split-step illustration', () => {
    const resetIllustration = drillIllustrationFor({
      name: 'Reset and Rally Rehearsal',
      illustrationURL: null,
    })
    expect(resetIllustration).toBe('/images/drills/reset-and-rally-rehearsal.png')
    expect(resetIllustration).not.toBe('/images/drills/reactive-split-step-cues.png')
    expect(existsSync(path.join(process.cwd(), 'public', resetIllustration!))).toBe(true)
  })
})
