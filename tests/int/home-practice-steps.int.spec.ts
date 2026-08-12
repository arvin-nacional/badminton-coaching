import { describe, expect, it } from 'vitest'

import {
  badmintonBodyweightStrengthContent,
  buildHomePracticeSequence,
  canFinishHomePractice,
  canMarkHomePracticeComplete,
  compactHomeFootworkContent,
  getRandomCueDelayMilliseconds,
  getHomePracticeAdvanceAction,
  getHomePracticeRounds,
  highIntensityShadowIntervalsContent,
  lowServeFloorTargetContent,
  lungeBalanceLegStrengthContent,
  matchVisualizationResetContent,
  overheadShadowTechniqueContent,
  pickRandomDirectionCue,
  reactiveSplitStepCuesContent,
  shoulderAndCoreControlContent,
  soloRacketControlContent,
  upsertHomePracticeExerciseLog,
  wallDriveAndDefenceContent,
} from '@/data/homePracticeSteps'

describe('home practice sequence progress', () => {
  it('reads repeat counts from rounds, sets, and scenarios', () => {
    expect(getHomePracticeRounds('Work/rest: Complete 3 rounds with 30 seconds rest.')).toBe(3)
    expect(getHomePracticeRounds('Work/rest: Complete 4 sets of 10 serves.')).toBe(4)
    expect(getHomePracticeRounds('Work/rest: Complete 10 scenarios.')).toBe(10)
  })

  it('defaults to one round when no supported repeat instruction exists', () => {
    expect(getHomePracticeRounds('Practise each exercise with control.')).toBe(1)
  })

  it('advances exercises, repeats rounds, then leaves the drill', () => {
    expect(
      getHomePracticeAdvanceAction({
        isLastStep: false,
        isLastDrill: false,
        currentRound: 1,
        rounds: 3,
      }),
    ).toBe('next-step')
    expect(
      getHomePracticeAdvanceAction({
        isLastStep: true,
        isLastDrill: false,
        currentRound: 1,
        rounds: 3,
      }),
    ).toBe('repeat')
    expect(
      getHomePracticeAdvanceAction({
        isLastStep: true,
        isLastDrill: false,
        currentRound: 3,
        rounds: 3,
      }),
    ).toBe('next')
    expect(
      getHomePracticeAdvanceAction({
        isLastStep: true,
        isLastDrill: true,
        currentRound: 3,
        rounds: 3,
      }),
    ).toBe('finish')
  })

  it('only permits assignment completion after the guided workout is finished', () => {
    expect(canMarkHomePracticeComplete('not-started')).toBe(false)
    expect(canMarkHomePracticeComplete('running')).toBe(false)
    expect(canMarkHomePracticeComplete('paused')).toBe(false)
    expect(canMarkHomePracticeComplete('finished')).toBe(true)
  })

  it('rejects an early finish until the last drill, exercise, and round', () => {
    const finishedState = {
      currentDrillIndex: 2,
      drillCount: 3,
      currentStepIndex: 3,
      stepCount: 4,
      currentRound: 3,
      rounds: 3,
    }

    expect(canFinishHomePractice(finishedState)).toBe(true)
    expect(canFinishHomePractice({ ...finishedState, currentDrillIndex: 1 })).toBe(false)
    expect(canFinishHomePractice({ ...finishedState, currentStepIndex: 2 })).toBe(false)
    expect(canFinishHomePractice({ ...finishedState, currentRound: 2 })).toBe(false)
  })

  it('replaces a retried exercise log instead of duplicating it', () => {
    const firstLog = {
      completedAt: '2026-08-12T01:00:00.000Z',
      drillIndex: 0,
      elapsedSeconds: 30,
      round: 1,
      stepIndex: 0,
    }
    const retriedLog = {
      ...firstLog,
      completedAt: '2026-08-12T01:00:02.000Z',
      elapsedSeconds: 32,
    }

    expect(upsertHomePracticeExerciseLog([firstLog], retriedLog)).toEqual([retriedLog])
  })

  it('models compact footwork as corner exercises instead of technique steps', () => {
    const sequence = buildHomePracticeSequence(
      'Compact Home Footwork',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 4 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(3)
    expect(sequence?.columns).toBe(3)
    expect(sequence?.rows).toBe(3)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Right front corner',
      'Left front corner',
      'Right side corner',
      'Left side corner',
      'Right rear corner',
      'Left rear corner',
      'Round recovery',
    ])
    expect(sequence?.steps.slice(0, 6).every((step) => step.durationSeconds === 20)).toBe(true)
    expect(sequence?.steps.at(-1)?.durationSeconds).toBe(40)
    expect(sequence?.steps.at(-1)?.kind).toBe('rest')
    expect(sequence?.sheetURL).toBe(compactHomeFootworkContent.stepIllustrationURL)
    expect(compactHomeFootworkContent.instructions).toContain('1. Right front corner')
    expect(compactHomeFootworkContent.instructions).toContain('6. Left rear corner')
    expect(compactHomeFootworkContent.instructions).toContain('Complete 3 rounds')
    expect(
      sequence ? sequence.steps.filter((step) => step.kind !== 'rest').length * sequence.rounds : 0,
    ).toBe(18)
  })

  it('uses a foam ball and three timed exercises for wall drives', () => {
    const sequence = buildHomePracticeSequence(
      'Wall Drive and Defence',
      'Setup: Legacy shuttle setup.\n\n1. Legacy step.\n\nWork/rest: Complete 5 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(3)
    expect(sequence?.columns).toBe(2)
    expect(sequence?.rows).toBe(2)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Forehand wall drives',
      'Backhand wall drives',
      'Alternating wall drives',
      'Round recovery',
    ])
    expect(sequence?.steps.slice(0, 3).every((step) => step.durationSeconds === 45)).toBe(true)
    expect(sequence?.steps.at(-1)).toMatchObject({ durationSeconds: 30, kind: 'rest' })
    expect(wallDriveAndDefenceContent.equipment).toContain('soft foam ball')
    expect(wallDriveAndDefenceContent.instructions).not.toContain('foam ball or suitable shuttle')
    expect(wallDriveAndDefenceContent.harderProgression).toContain('suitable shuttle')
  })

  it('runs reactive split-step cues as one guided exercise plus recovery', () => {
    const sequence = buildHomePracticeSequence(
      'Reactive Split-Step Cues',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 2 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(5)
    expect(sequence?.columns).toBe(2)
    expect(sequence?.rows).toBe(1)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Random direction reactions',
      'Round recovery',
    ])
    expect(sequence?.steps[0]).toMatchObject({
      durationSeconds: 40,
      spokenCues: ['Front', 'Back', 'Left', 'Right'],
      cueIntervalSeconds: { min: 3, max: 4 },
    })
    expect(sequence?.steps[1]).toMatchObject({ durationSeconds: 40, kind: 'rest' })
    expect(sequence?.sheetURL).toBe(reactiveSplitStepCuesContent.stepIllustrationURL)
    expect(reactiveSplitStepCuesContent.instructions).toContain('guide calls a random direction')
  })

  it('keeps random direction cues varied and inside the configured interval', () => {
    expect(pickRandomDirectionCue(['Front', 'Back', 'Left', 'Right'], 'Front', () => 0)).toBe(
      'Back',
    )
    expect(pickRandomDirectionCue(['Front'], 'Front', () => 0.8)).toBe('Front')
    expect(getRandomCueDelayMilliseconds(3, 4, () => 0)).toBe(3000)
    expect(getRandomCueDelayMilliseconds(3, 4, () => 1)).toBe(4000)
  })

  it('introduces all eight directions in the later high-intensity progression', () => {
    const sequence = buildHomePracticeSequence(
      'High-Intensity Shadow Intervals',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 3 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(6)
    expect(sequence?.columns).toBe(2)
    expect(sequence?.rows).toBe(1)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Eight-direction shadow interval',
      'Round recovery',
    ])
    expect(sequence?.steps[0]).toMatchObject({
      durationSeconds: 30,
      cueIntervalSeconds: { min: 2.5, max: 3.5 },
    })
    expect(sequence?.steps[0]?.spokenCues).toEqual([
      'Front',
      'Back',
      'Left',
      'Right',
      'Front left',
      'Front right',
      'Rear left',
      'Rear right',
    ])
    expect(sequence?.steps[1]).toMatchObject({ durationSeconds: 45, kind: 'rest' })
    expect(sequence?.sheetURL).toBe(highIntensityShadowIntervalsContent.stepIllustrationURL)
  })

  it('uses stable support and a real guided recovery for bodyweight strength', () => {
    const sequence = buildHomePracticeSequence(
      'Badminton Bodyweight Strength Circuit',
      'Setup: Legacy chair setup.\n\n1. Legacy step.\n\nWork/rest: Complete 2 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(3)
    expect(sequence?.columns).toBe(3)
    expect(sequence?.rows).toBe(2)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Split squat',
      'Glute bridge',
      'Counter incline push-up',
      'Calf raise',
      'Front plank',
      'Round recovery',
    ])
    expect(sequence?.steps[4]).toMatchObject({ durationSeconds: 25 })
    expect(sequence?.steps[5]).toMatchObject({ durationSeconds: 60, kind: 'rest' })
    expect(sequence?.sheetURL).toBe(badmintonBodyweightStrengthContent.stepIllustrationURL)
    expect(badmintonBodyweightStrengthContent.equipment).not.toContain('chair')
    expect(badmintonBodyweightStrengthContent.instructions).toContain('Do not use a chair')
  })

  it('times each side plank separately and guides recovery for shoulder control', () => {
    const sequence = buildHomePracticeSequence(
      'Shoulder and Core Control',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 2 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(3)
    expect(sequence?.columns).toBe(3)
    expect(sequence?.rows).toBe(2)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Band pull-apart',
      'External rotation',
      'Dead bug',
      'Right bent-knee side plank',
      'Left bent-knee side plank',
      'Round recovery',
    ])
    expect(sequence?.steps[3]).toMatchObject({ durationSeconds: 20 })
    expect(sequence?.steps[4]).toMatchObject({ durationSeconds: 20 })
    expect(sequence?.steps[5]).toMatchObject({ durationSeconds: 45, kind: 'rest' })
    expect(sequence?.sheetURL).toBe(shoulderAndCoreControlContent.stepIllustrationURL)
    expect(shoulderAndCoreControlContent.instructions).toContain('fixed anchor')
    expect(shoulderAndCoreControlContent.instructions).not.toContain('20 seconds per side')
  })

  it('models each visualisation scenario as one complete automatic routine', () => {
    const sequence = buildHomePracticeSequence(
      'Match Visualization and Reset',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 5 scenarios.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(10)
    expect(sequence?.columns).toBe(1)
    expect(sequence?.rows).toBe(1)
    expect(sequence?.steps).toHaveLength(1)
    expect(sequence?.steps[0]).toMatchObject({
      title: 'Visualise and reset one scenario',
      durationSeconds: 75,
    })
    expect(sequence?.sheetURL).toBe(matchVisualizationResetContent.stepIllustrationURL)
    expect(matchVisualizationResetContent.instructions).toContain('advances automatically')
    expect(matchVisualizationResetContent.instructions).toContain('controllable actions')
  })

  it('runs racket control hands-free with one racket and a real recovery step', () => {
    const sequence = buildHomePracticeSequence(
      'Solo Racket Control Circuit',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 2 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(3)
    expect(sequence?.columns).toBe(2)
    expect(sequence?.rows).toBe(2)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Forehand control',
      'Backhand control',
      'Alternating grip control',
      'Round recovery',
    ])
    expect(sequence?.steps.every((step) => step.durationSeconds === 30)).toBe(true)
    expect(sequence?.steps[2]?.instruction).toContain('same hand')
    expect(sequence?.steps[3]).toMatchObject({ durationSeconds: 30, kind: 'rest' })
    expect(sequence?.steps.filter((step) => step.kind !== 'rest')).toHaveLength(3)
    expect(sequence?.sheetURL).toBe(soloRacketControlContent.stepIllustrationURL)
    expect(soloRacketControlContent.instructions).toContain('Press Start once')
  })

  it('treats ten low serves as one exercise instead of five separate taps', () => {
    const sequence = buildHomePracticeSequence(
      'Low Serve Floor Targets',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 2 sets.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(4)
    expect(sequence?.columns).toBe(1)
    expect(sequence?.rows).toBe(1)
    expect(sequence?.steps).toHaveLength(1)
    expect(sequence?.steps[0]).toMatchObject({
      title: '10 low serves',
      amount: '10 serves',
    })
    expect(sequence?.steps[0]?.durationSeconds).toBeUndefined()
    expect(sequence?.steps[0]?.instruction).toContain('pressing once')
    expect(sequence?.sheetURL).toBe(lowServeFloorTargetContent.stepIllustrationURL)
    expect(lowServeFloorTargetContent.instructions).toContain('keep both feet still')
    expect(lowServeFloorTargetContent.instructions).toContain('cork facing the strings')
  })

  it('treats the overhead phases as one complete racket-side repetition', () => {
    const sequence = buildHomePracticeSequence(
      'Overhead Shadow Technique',
      'Setup: Legacy setup.\n\n1. Legacy step.\n\nWork/rest: Complete 2 sets.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(3)
    expect(sequence?.columns).toBe(1)
    expect(sequence?.rows).toBe(1)
    expect(sequence?.steps).toHaveLength(1)
    expect(sequence?.steps[0]).toMatchObject({
      title: 'Racket-side forehand overhead',
      amount: '8 reps',
    })
    expect(sequence?.steps[0]?.durationSeconds).toBeUndefined()
    expect(sequence?.steps[0]?.instruction).toContain('one sequence')
    expect(sequence?.steps[0]?.instruction).toContain('diagonally back')
    expect(sequence?.sheetURL).toBe(overheadShadowTechniqueContent.stepIllustrationURL)
    expect(overheadShadowTechniqueContent.instructions).not.toContain('alternating rear corners')
    expect(overheadShadowTechniqueContent.instructions).toContain('rear-right')
    expect(overheadShadowTechniqueContent.instructions).toContain('rear-left')
  })

  it('runs chair-free lunge and balance work as a hands-free circuit', () => {
    const sequence = buildHomePracticeSequence(
      'Lunge Balance and Leg Strength',
      'Setup: Legacy chair setup.\n\n1. Legacy step.\n\nWork/rest: Complete 2 rounds.\nSafety: Legacy safety.',
    )

    expect(sequence?.rounds).toBe(3)
    expect(sequence?.columns).toBe(2)
    expect(sequence?.rows).toBe(2)
    expect(sequence?.steps.map((step) => step.title)).toEqual([
      'Alternating badminton lunges',
      'Unsupported calf raises',
      'Single-leg balance',
      'Round recovery',
    ])
    expect(sequence?.steps.map((step) => step.durationSeconds)).toEqual([60, 30, 40, 45])
    expect(sequence?.steps[2]?.instruction).toContain('timer reaches 0:20')
    expect(sequence?.steps[3]).toMatchObject({ durationSeconds: 45, kind: 'rest' })
    expect(sequence?.sheetURL).toBe(lungeBalanceLegStrengthContent.stepIllustrationURL)
    expect(lungeBalanceLegStrengthContent.equipment).not.toContain('chair')
    expect(lungeBalanceLegStrengthContent.instructions).toContain('no chair is required')
    expect(lungeBalanceLegStrengthContent.instructions).toContain('advances automatically')
  })
})
