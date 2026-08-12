export type HomePracticeStep = {
  title: string
  instruction: string
  amount: string
  durationSeconds?: number
  kind?: 'exercise' | 'rest'
}

export type HomePracticeAdvanceAction = 'next-step' | 'repeat' | 'next' | 'finish'

export type HomePracticeExerciseLog = {
  completedAt: string
  drillIndex: number
  elapsedSeconds: number
  round: number
  stepIndex: number
  id?: string | null
}

export const canMarkHomePracticeComplete = (timerStatus: string | null | undefined) =>
  timerStatus === 'finished'

export const canFinishHomePractice = ({
  currentDrillIndex,
  drillCount,
  currentStepIndex,
  stepCount,
  currentRound,
  rounds,
}: {
  currentDrillIndex: number
  drillCount: number
  currentStepIndex: number
  stepCount: number
  currentRound: number
  rounds: number
}) =>
  drillCount > 0 &&
  currentDrillIndex === drillCount - 1 &&
  currentStepIndex >= stepCount - 1 &&
  currentRound >= rounds

export const upsertHomePracticeExerciseLog = (
  logs: HomePracticeExerciseLog[],
  completedLog: HomePracticeExerciseLog,
) => [
  ...logs.filter(
    (log) =>
      log.drillIndex !== completedLog.drillIndex ||
      log.round !== completedLog.round ||
      log.stepIndex !== completedLog.stepIndex,
  ),
  completedLog,
]

export const getHomePracticeAdvanceAction = ({
  isLastStep,
  isLastDrill,
  currentRound,
  rounds,
}: {
  isLastStep: boolean
  isLastDrill: boolean
  currentRound: number
  rounds: number
}): HomePracticeAdvanceAction => {
  if (!isLastStep) return 'next-step'
  if (currentRound < rounds) return 'repeat'
  return isLastDrill ? 'finish' : 'next'
}

export const getHomePracticeRounds = (instructions: string) => {
  const workRest = instructions.match(/Work\/rest:\s*([^\n]+)/i)?.[1] || ''
  const count = Number(
    workRest.match(/\b(?:complete|perform)\s+(\d+)\s+(?:rounds?|sets?|scenarios?)\b/i)?.[1],
  )

  return Number.isSafeInteger(count) && count > 0 ? count : 1
}

type StepAmount = Pick<HomePracticeStep, 'amount' | 'durationSeconds'>

type StepSheetConfig = {
  sheetURL: string
  columns: number
  rows: number
  amounts?: StepAmount[]
  steps?: HomePracticeStep[]
  setup?: string
  workRest?: string
  safety?: string
  rounds?: number
  equipment?: string
  successTarget?: string
  easierVariation?: string
}

const configs: Record<string, StepSheetConfig> = {
  'Solo Racket Control Circuit': {
    sheetURL: '/images/drills/stepsheets/solo-racket-control-circuit.png',
    columns: 2,
    rows: 2,
    amounts: [
      { amount: '30 secs', durationSeconds: 30 },
      { amount: '30 secs', durationSeconds: 30 },
      { amount: '30 secs', durationSeconds: 30 },
      { amount: 'Rest 30 secs', durationSeconds: 30 },
    ],
  },
  'Low Serve Floor Targets': {
    sheetURL: '/images/drills/stepsheets/low-serve-floor-targets.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: 'Every set' },
      { amount: 'Every serve' },
      { amount: '10 serves' },
      { amount: 'Hold 2 secs' },
      { amount: 'Record score' },
    ],
  },
  'Overhead Shadow Technique': {
    sheetURL: '/images/drills/stepsheets/overhead-shadow-technique.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: '8 reps' },
      { amount: '8 reps' },
      { amount: '8 reps' },
      { amount: '8 reps' },
      { amount: '8 reps' },
    ],
  },
  'Compact Home Footwork': {
    sheetURL: '/images/drills/stepsheets/compact-home-footwork-exercises.png',
    columns: 3,
    rows: 3,
    setup:
      'Arrange six markers around a central base: right front, left front, right side, left side, right rear and left rear. Keep every marker only one controlled step or lunge away. Right-handed movement cues are shown; left-handed players can mirror the racket-side details.',
    workRest:
      'Press Start once. The guide gives you 20 seconds (about 3 controlled reps) at each corner, advances automatically, then starts a 40-second recovery. Complete 3 rounds.',
    safety:
      'Scale every movement to the available room. Do not use full-court strides, step on markers or continue on a slippery surface.',
    rounds: 3,
    equipment: 'Six small floor markers and a clear, non-slip space of about 2 by 2 metres',
    successTarget: 'Complete three rounds without touching a marker or losing balance.',
    easierVariation: 'Walk two controlled reps to each corner before increasing speed.',
    steps: [
      {
        title: 'Right front corner',
        instruction:
          'Start at the base, split step, push diagonally forward-right and finish in a controlled racket-leg lunge. Shadow a forehand net shot, push back and reset at the base.',
        amount: '3 reps · 20 secs',
        durationSeconds: 20,
      },
      {
        title: 'Left front corner',
        instruction:
          'Split step, travel diagonally forward-left and finish with the racket leg supporting a balanced lunge. Shadow a backhand net shot, then recover to the base.',
        amount: '3 reps · 20 secs',
        durationSeconds: 20,
      },
      {
        title: 'Right side corner',
        instruction:
          'Split step, push from the left foot and chasse to the right-side marker. Shadow a compact forehand drive or block, then recover without crossing the feet.',
        amount: '3 reps · 20 secs',
        durationSeconds: 20,
      },
      {
        title: 'Left side corner',
        instruction:
          'Split step, push from the right foot and chasse to the left-side marker. Shadow a compact backhand drive or block, then return under control.',
        amount: '3 reps · 20 secs',
        durationSeconds: 20,
      },
      {
        title: 'Right rear corner',
        instruction:
          'Split step, turn side-on and move diagonally backward-right using small chasse or crossover steps. Shadow an overhead stroke, land balanced and recover to the base.',
        amount: '3 reps · 20 secs',
        durationSeconds: 20,
      },
      {
        title: 'Left rear corner',
        instruction:
          'Split step, turn side-on and move diagonally backward-left. Shadow a round-the-head overhead action, keep the chest controlled and recover to the base.',
        amount: '3 reps · 20 secs',
        durationSeconds: 20,
      },
      {
        title: 'Round recovery',
        instruction:
          'Walk slowly, shake out the legs and breathe. Check that every marker is still in place before the next round begins.',
        amount: 'Rest 40 secs',
        durationSeconds: 40,
        kind: 'rest',
      },
    ],
  },
  'Lunge Balance and Leg Strength': {
    sheetURL: '/images/drills/stepsheets/lunge-balance-leg-strength.png',
    columns: 2,
    rows: 2,
    amounts: [
      { amount: '6 reps / side' },
      { amount: '8 reps' },
      { amount: '20 secs / side', durationSeconds: 20 },
      { amount: 'Rest 45 secs', durationSeconds: 45 },
    ],
  },
  'Wall Drive and Defence': {
    sheetURL: '/images/drills/stepsheets/wall-drive-defence.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: 'Ready position' },
      { amount: 'Gentle feed' },
      { amount: '45 secs', durationSeconds: 45 },
      { amount: '45 secs', durationSeconds: 45 },
      { amount: '45 secs', durationSeconds: 45 },
    ],
  },
  'Reactive Split-Step Cues': {
    sheetURL: '/images/drills/stepsheets/reactive-split-step-cues.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: 'Wait for cue' },
      { amount: 'Every cue' },
      { amount: 'React, then move' },
      { amount: '8–10 reactions' },
      { amount: 'Reset each cue' },
    ],
  },
  'Badminton Bodyweight Strength Circuit': {
    sheetURL: '/images/drills/stepsheets/badminton-bodyweight-strength-circuit.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: '8 reps / side' },
      { amount: '10 reps' },
      { amount: '8 reps' },
      { amount: '12 reps' },
      { amount: '25 secs', durationSeconds: 25 },
    ],
  },
  'Shoulder and Core Control': {
    sheetURL: '/images/drills/stepsheets/shoulder-core-control.png',
    columns: 2,
    rows: 2,
    amounts: [
      { amount: '10 reps or holds' },
      { amount: '8 reps / side' },
      { amount: '8 reps / side' },
      { amount: '20 secs / side', durationSeconds: 20 },
    ],
  },
  'Match Visualization and Reset': {
    sheetURL: '/images/drills/stepsheets/match-visualization-reset.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: '1 scenario' },
      { amount: '45–60 secs', durationSeconds: 60 },
      { amount: '1 rally' },
      { amount: '1 slow breath' },
      { amount: '1 sentence' },
      { amount: 'Reset posture' },
    ],
  },
  'High-Intensity Shadow Intervals': {
    sheetURL: '/images/drills/stepsheets/high-intensity-shadow-intervals.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: 'Start each round' },
      { amount: '30 secs', durationSeconds: 30 },
      { amount: 'Every corner' },
      { amount: 'Recover each rep' },
      { amount: 'Rest 45 secs', durationSeconds: 45 },
    ],
  },
}

const section = (instructions: string, label: string, nextPattern?: string) => {
  const suffix = nextPattern ? `(?=${nextPattern})` : '$'
  return instructions.match(new RegExp(`${label}:\\s*([\\s\\S]*?)${suffix}`))?.[1]?.trim() || ''
}

export const buildHomePracticeSequence = (name: string, instructions: string) => {
  const config = configs[name]
  if (!config) return null

  const numberedSection = instructions.match(/\n\n1\.\s*([\s\S]*?)(?=\n\nWork\/rest:)/)?.[0] || ''
  const numberedSteps = Array.from(
    numberedSection.matchAll(/(?:^|\n)(\d+)\.\s+(.+?)(?=\n\d+\.|\n\nWork\/rest:|$)/gs),
  )

  const parsedSteps = numberedSteps.map((match, index): HomePracticeStep => {
    const line = match[2].trim()
    const dividerIndex = line.indexOf(' — ')
    const amount = config.amounts?.[index] || { amount: `Step ${index + 1}` }

    return {
      title: dividerIndex >= 0 ? line.slice(0, dividerIndex).trim() : `Step ${index + 1}`,
      instruction: dividerIndex >= 0 ? line.slice(dividerIndex + 3).trim() : line,
      ...amount,
    }
  })
  const steps = config.steps || parsedSteps

  return {
    setup: config.setup || section(instructions, 'Setup', '\\n\\n1\\.'),
    workRest: config.workRest || section(instructions, 'Work/rest', '\\nSafety:'),
    safety: config.safety || section(instructions, 'Safety'),
    rounds: config.rounds || getHomePracticeRounds(instructions),
    sheetURL: config.sheetURL,
    columns: config.columns,
    rows: config.rows,
    steps,
    useGeneratedSteps: Boolean(config.steps),
    equipment: config.equipment,
    successTarget: config.successTarget,
    easierVariation: config.easierVariation,
  }
}
