import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import {
  buildHomePracticeSequence,
  canFinishHomePractice,
  canMarkHomePracticeComplete,
  getHomePracticeRounds,
  upsertHomePracticeExerciseLog,
} from '@/data/homePracticeSteps'

const timerActions = [
  'start',
  'pause',
  'resume',
  'next-step',
  'repeat',
  'next',
  'finish',
  'reset',
] as const
type TimerAction = (typeof timerActions)[number]

const isTimerAction = (value: unknown): value is TimerAction =>
  typeof value === 'string' && timerActions.includes(value as TimerAction)

const runningSegmentSeconds = (startedAt?: string | null) =>
  startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)) : 0

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as {
    completed?: unknown
    timerAction?: unknown
  } | null
  const updatesCompletion = typeof body?.completed === 'boolean'
  const timerAction = isTimerAction(body?.timerAction) ? body.timerAction : null

  if (!updatesCompletion && !timerAction) {
    return Response.json(
      { error: 'A completed boolean or valid timer action is required.' },
      { status: 400 },
    )
  }

  try {
    const { id } = await params
    const practice = await payload.findByID({
      collection: 'independent-practices',
      id,
      depth: 0,
      overrideAccess: false,
      user,
    })

    if (updatesCompletion) {
      const completed = body.completed as boolean
      if (completed && !canMarkHomePracticeComplete(practice.timerStatus)) {
        return Response.json(
          { error: 'Finish every part of the guided workout before marking it as done.' },
          { status: 409 },
        )
      }

      const updated = await payload.update({
        collection: 'independent-practices',
        id: practice.id,
        depth: 0,
        overrideAccess: true,
        data: {
          completedAt: completed ? new Date().toISOString() : null,
          currentRound: Math.max(1, Math.floor(practice.currentRound || 1)),
          status: completed ? 'completed' : 'assigned',
        },
      })

      return Response.json({ completedAt: updated.completedAt, status: updated.status })
    }

    const storedSeconds = Math.max(0, Math.floor(practice.elapsedSeconds || 0))
    const elapsedSeconds =
      practice.timerStatus === 'running'
        ? storedSeconds + runningSegmentSeconds(practice.timerStartedAt)
        : storedSeconds
    const storedDrillSeconds = Math.max(0, Math.floor(practice.currentDrillElapsedSeconds || 0))
    const currentDrillElapsedSeconds =
      practice.timerStatus === 'running'
        ? storedDrillSeconds + runningSegmentSeconds(practice.timerStartedAt)
        : storedDrillSeconds
    const storedStepSeconds = Math.max(0, Math.floor(practice.currentStepElapsedSeconds || 0))
    const currentStepElapsedSeconds =
      practice.timerStatus === 'running'
        ? storedStepSeconds + runningSegmentSeconds(practice.timerStartedAt)
        : storedStepSeconds
    const currentDrillIndex = Math.min(
      Math.max(0, Math.floor(practice.currentDrillIndex || 0)),
      Math.max(0, practice.drills.length - 1),
    )
    const currentRound = Math.max(1, Math.floor(practice.currentRound || 1))
    const currentStepIndex = Math.max(0, Math.floor(practice.currentStepIndex || 0))
    const now = new Date().toISOString()
    const completedExerciseLogs = upsertHomePracticeExerciseLog(practice.exerciseLogs || [], {
      completedAt: now,
      drillIndex: currentDrillIndex,
      elapsedSeconds: currentStepElapsedSeconds,
      round: currentRound,
      stepIndex: currentStepIndex,
    })

    if (timerAction === 'next-step') {
      const currentDrill = practice.drills[currentDrillIndex]
      const currentDrillID = typeof currentDrill === 'string' ? currentDrill : currentDrill.id
      const drill = await payload.findByID({
        collection: 'drills',
        id: currentDrillID,
        depth: 0,
        overrideAccess: true,
      })
      const generatedSequence = buildHomePracticeSequence(drill.name, drill.instructions)
      const stepCount = Math.max(
        1,
        generatedSequence?.useGeneratedSteps
          ? generatedSequence.steps.length
          : drill.practiceSteps?.length || generatedSequence?.steps.length || 1,
      )
      const updated = await payload.update({
        collection: 'independent-practices',
        id: practice.id,
        depth: 0,
        overrideAccess: true,
        data: {
          currentDrillElapsedSeconds,
          currentRound,
          exerciseLogs: completedExerciseLogs,
          currentStepElapsedSeconds: 0,
          currentStepIndex: Math.min(currentStepIndex + 1, stepCount - 1),
          elapsedSeconds,
          timerStartedAt: practice.timerStatus === 'running' ? now : null,
        },
      })

      return Response.json({
        currentDrillElapsedSeconds: updated.currentDrillElapsedSeconds,
        currentDrillIndex: updated.currentDrillIndex,
        currentStepElapsedSeconds: updated.currentStepElapsedSeconds,
        currentStepIndex: updated.currentStepIndex,
        currentRound: updated.currentRound,
        elapsedSeconds: updated.elapsedSeconds,
        exerciseLogs: updated.exerciseLogs,
        timerStartedAt: updated.timerStartedAt,
        timerStatus: updated.timerStatus,
      })
    }

    if (timerAction === 'repeat') {
      const currentDrill = practice.drills[currentDrillIndex]
      const currentDrillID = typeof currentDrill === 'string' ? currentDrill : currentDrill.id
      const drill = await payload.findByID({
        collection: 'drills',
        id: currentDrillID,
        depth: 0,
        overrideAccess: true,
      })
      const rounds =
        buildHomePracticeSequence(drill.name, drill.instructions)?.rounds ||
        getHomePracticeRounds(drill.instructions)
      const updated = await payload.update({
        collection: 'independent-practices',
        id: practice.id,
        depth: 0,
        overrideAccess: true,
        data: {
          currentDrillElapsedSeconds,
          currentRound: Math.min(currentRound + 1, rounds),
          exerciseLogs: completedExerciseLogs,
          currentStepElapsedSeconds: 0,
          currentStepIndex: 0,
          elapsedSeconds,
          timerStartedAt: practice.timerStatus === 'running' ? now : null,
        },
      })

      return Response.json({
        currentDrillElapsedSeconds: updated.currentDrillElapsedSeconds,
        currentDrillIndex: updated.currentDrillIndex,
        currentRound: updated.currentRound,
        currentStepElapsedSeconds: updated.currentStepElapsedSeconds,
        currentStepIndex: updated.currentStepIndex,
        elapsedSeconds: updated.elapsedSeconds,
        exerciseLogs: updated.exerciseLogs,
        timerStartedAt: updated.timerStartedAt,
        timerStatus: updated.timerStatus,
      })
    }

    if (timerAction === 'next') {
      const updated = await payload.update({
        collection: 'independent-practices',
        id: practice.id,
        depth: 0,
        overrideAccess: true,
        data: {
          currentDrillElapsedSeconds: 0,
          currentDrillIndex: Math.min(
            currentDrillIndex + 1,
            Math.max(0, practice.drills.length - 1),
          ),
          currentRound: 1,
          exerciseLogs: completedExerciseLogs,
          currentStepElapsedSeconds: 0,
          currentStepIndex: 0,
          elapsedSeconds,
          timerStartedAt: practice.timerStatus === 'running' ? now : null,
        },
      })

      return Response.json({
        currentDrillElapsedSeconds: updated.currentDrillElapsedSeconds,
        currentDrillIndex: updated.currentDrillIndex,
        currentRound: updated.currentRound,
        currentStepElapsedSeconds: updated.currentStepElapsedSeconds,
        currentStepIndex: updated.currentStepIndex,
        elapsedSeconds: updated.elapsedSeconds,
        exerciseLogs: updated.exerciseLogs,
        timerStartedAt: updated.timerStartedAt,
        timerStatus: updated.timerStatus,
      })
    }

    if (timerAction === 'finish') {
      const currentDrill = practice.drills[currentDrillIndex]
      const currentDrillID = typeof currentDrill === 'string' ? currentDrill : currentDrill.id
      const drill = await payload.findByID({
        collection: 'drills',
        id: currentDrillID,
        depth: 0,
        overrideAccess: true,
      })
      const generatedSequence = buildHomePracticeSequence(drill.name, drill.instructions)
      const stepCount = Math.max(
        1,
        generatedSequence?.useGeneratedSteps
          ? generatedSequence.steps.length
          : drill.practiceSteps?.length || generatedSequence?.steps.length || 1,
      )
      const rounds = generatedSequence?.rounds || getHomePracticeRounds(drill.instructions)

      if (
        !canFinishHomePractice({
          currentDrillIndex,
          drillCount: practice.drills.length,
          currentStepIndex,
          stepCount,
          currentRound,
          rounds,
        })
      ) {
        return Response.json(
          { error: 'Complete the remaining exercises and rounds before finishing.' },
          { status: 409 },
        )
      }
    }

    const timerData =
      timerAction === 'reset'
        ? {
            completedAt: null,
            currentDrillElapsedSeconds: 0,
            currentDrillIndex: 0,
            currentRound: 1,
            currentStepElapsedSeconds: 0,
            currentStepIndex: 0,
            exerciseLogs: [],
            elapsedSeconds: 0,
            status: 'assigned' as const,
            timerStartedAt: null,
            timerStatus: 'not-started' as const,
          }
        : timerAction === 'start' || timerAction === 'resume'
          ? {
              currentDrillElapsedSeconds: timerAction === 'start' ? 0 : currentDrillElapsedSeconds,
              currentRound: timerAction === 'start' ? 1 : currentRound,
              currentStepElapsedSeconds: timerAction === 'start' ? 0 : currentStepElapsedSeconds,
              currentStepIndex: timerAction === 'start' ? 0 : currentStepIndex,
              exerciseLogs: timerAction === 'start' ? [] : practice.exerciseLogs || [],
              elapsedSeconds,
              timerStartedAt: now,
              timerStatus: 'running' as const,
            }
          : {
              currentDrillElapsedSeconds,
              currentRound,
              currentStepElapsedSeconds,
              exerciseLogs:
                timerAction === 'finish' ? completedExerciseLogs : practice.exerciseLogs || [],
              elapsedSeconds,
              timerStartedAt: null,
              timerStatus: timerAction === 'pause' ? ('paused' as const) : ('finished' as const),
            }

    const updated = await payload.update({
      collection: 'independent-practices',
      id: practice.id,
      depth: 0,
      overrideAccess: true,
      data: timerData,
    })

    return Response.json({
      currentDrillElapsedSeconds: updated.currentDrillElapsedSeconds,
      currentDrillIndex: updated.currentDrillIndex,
      currentRound: updated.currentRound,
      currentStepElapsedSeconds: updated.currentStepElapsedSeconds,
      currentStepIndex: updated.currentStepIndex,
      elapsedSeconds: updated.elapsedSeconds,
      exerciseLogs: updated.exerciseLogs,
      completedAt: updated.completedAt,
      status: updated.status,
      timerStartedAt: updated.timerStartedAt,
      timerStatus: updated.timerStatus,
    })
  } catch {
    return Response.json({ error: 'Independent practice was not found.' }, { status: 404 })
  }
}
