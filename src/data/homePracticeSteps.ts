export type HomePracticeStep = {
  title: string
  instruction: string
  amount: string
  durationSeconds?: number
}

type StepAmount = Pick<HomePracticeStep, 'amount' | 'durationSeconds'>

type StepSheetConfig = {
  sheetURL: string
  columns: number
  rows: number
  amounts: StepAmount[]
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
    sheetURL: '/images/drills/stepsheets/compact-home-footwork.png',
    columns: 3,
    rows: 2,
    amounts: [
      { amount: 'Ready position' },
      { amount: '40 secs', durationSeconds: 40 },
      { amount: 'Hold 1 sec' },
      { amount: 'Every movement' },
      { amount: 'Reset each rep' },
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

  const steps = numberedSteps.map((match, index): HomePracticeStep => {
    const line = match[2].trim()
    const dividerIndex = line.indexOf(' — ')
    const amount = config.amounts[index] || { amount: `Step ${index + 1}` }

    return {
      title: dividerIndex >= 0 ? line.slice(0, dividerIndex).trim() : `Step ${index + 1}`,
      instruction: dividerIndex >= 0 ? line.slice(dividerIndex + 3).trim() : line,
      ...amount,
    }
  })

  return {
    setup: section(instructions, 'Setup', '\\n\\n1\\.'),
    workRest: section(instructions, 'Work/rest', '\\nSafety:'),
    safety: section(instructions, 'Safety'),
    sheetURL: config.sheetURL,
    columns: config.columns,
    rows: config.rows,
    steps,
  }
}
