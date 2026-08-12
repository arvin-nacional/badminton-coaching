import { describe, expect, it } from 'vitest'

import {
  buildHomePracticeSequence,
  canFinishHomePractice,
  canMarkHomePracticeComplete,
  getHomePracticeAdvanceAction,
  getHomePracticeRounds,
  upsertHomePracticeExerciseLog,
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
  })
})
