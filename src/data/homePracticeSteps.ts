export type HomePracticeStep = {
  title: string
  instruction: string
  amount: string
  durationSeconds?: number
  kind?: 'exercise' | 'rest'
  spokenCues?: string[]
  cueIntervalSeconds?: {
    min: number
    max: number
  }
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

export const pickRandomDirectionCue = (
  cues: string[],
  previousCue?: string | null,
  random = Math.random,
) => {
  const availableCues = cues.length > 1 ? cues.filter((cue) => cue !== previousCue) : cues
  if (!availableCues.length) return ''

  const randomIndex = Math.min(
    availableCues.length - 1,
    Math.floor(Math.max(0, Math.min(0.999999, random())) * availableCues.length),
  )
  return availableCues[randomIndex]
}

export const getRandomCueDelayMilliseconds = (
  minSeconds: number,
  maxSeconds: number,
  random = Math.random,
) => {
  const safeMin = Math.max(0, Math.min(minSeconds, maxSeconds))
  const safeMax = Math.max(safeMin, Math.max(minSeconds, maxSeconds))
  const progress = Math.max(0, Math.min(1, random()))
  return Math.round((safeMin + (safeMax - safeMin) * progress) * 1000)
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

const compactHomeFootworkSteps: HomePracticeStep[] = [
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
]

const compactHomeFootworkSetup =
  'Arrange six markers around a central base: right front, left front, right side, left side, right rear and left rear. Keep every marker only one controlled step or lunge away. Right-handed movement cues are shown; left-handed players can mirror the racket-side details.'
const compactHomeFootworkWorkRest =
  'Press Start once. The guide gives you 20 seconds (about 3 controlled reps) at each corner, advances automatically, then starts a 40-second recovery. Complete 3 rounds.'
const compactHomeFootworkSafety =
  'Scale every movement to the available room. Do not use full-court strides, step on markers or continue on a slippery surface.'

export const compactHomeFootworkContent = {
  illustrationURL: '/images/drills/compact-home-footwork.png',
  stepIllustrationURL: '/images/drills/stepsheets/compact-home-footwork-exercises.png',
  stepIllustrationColumns: 3,
  stepIllustrationRows: 3,
  durationMinutes: 10,
  equipment: 'Six small floor markers and a clear, non-slip space of about 2 by 2 metres',
  instructions: [
    `Setup: ${compactHomeFootworkSetup}`,
    compactHomeFootworkSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${compactHomeFootworkWorkRest}\nSafety: ${compactHomeFootworkSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Use a small split step, move quietly, keep the knees aligned and return to a balanced base.',
  commonMistakes:
    'Taking court-sized steps in a small room, crossing the feet carelessly and prioritising speed over balance.',
  successTarget: 'Complete three rounds without touching a marker or losing balance.',
  easierVariation: 'Walk two controlled reps to each corner before increasing speed.',
  harderProgression: 'Use random audio cues and change direction without returning fully upright.',
  completionRequirement:
    'Maintains posture, rhythm and a consistent base throughout the final round.',
}

const wallDriveAndDefenceSteps: HomePracticeStep[] = [
  {
    title: 'Forehand wall drives',
    instruction:
      'Start in a neutral ready position. Feed the foam ball gently to the wall, then play compact forehand drives. Keep the contact in front and return the racket to ready after every hit.',
    amount: '45 secs',
    durationSeconds: 45,
  },
  {
    title: 'Backhand wall drives',
    instruction:
      'Use a thumb-led backhand grip and compact finger action. Keep the racket head above the hand and make small foot adjustments instead of reaching across the body.',
    amount: '45 secs',
    durationSeconds: 45,
  },
  {
    title: 'Alternating wall drives',
    instruction:
      'Change between forehand and backhand according to the rebound. Keep one neutral ready position between contacts and count your longest controlled rally.',
    amount: '45 secs',
    durationSeconds: 45,
  },
  {
    title: 'Round recovery',
    instruction:
      'Lower the racket, walk slowly and shake out the hand. Check that the wall area is still clear before the next round begins.',
    amount: 'Rest 30 secs',
    durationSeconds: 30,
    kind: 'rest',
  },
]

const wallDriveAndDefenceSetup =
  'Choose a solid, unbreakable wall with no windows, decorations or people nearby. Mark a chest-height target and begin about 1.5–2 metres away with one soft foam ball.'
const wallDriveAndDefenceWorkRest =
  'Press Start once. Complete 45 seconds of forehand drives, 45 seconds of backhand drives and 45 seconds of alternating drives, followed by 30 seconds recovery. Complete 3 rounds.'
const wallDriveAndDefenceSafety =
  'Use a soft foam ball for the standard drill. Stop immediately if the rebound becomes unpredictable or enters another person’s space. Never practise against glass, a fragile surface or a crowded wall.'

export const wallDriveAndDefenceContent = {
  illustrationURL: '/images/drills/wall-drive-defence.png',
  stepIllustrationURL: '/images/drills/stepsheets/wall-drive-defence.png',
  stepIllustrationColumns: 2,
  stepIllustrationRows: 2,
  durationMinutes: 10,
  equipment: 'Racket, one soft foam ball, tape and a clear solid wall',
  instructions: [
    `Setup: ${wallDriveAndDefenceSetup}`,
    wallDriveAndDefenceSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${wallDriveAndDefenceWorkRest}\nSafety: ${wallDriveAndDefenceSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Keep the racket head up, shorten the swing, contact in front and recover to a neutral ready position after each hit.',
  commonMistakes:
    'Using a hard ball or fragile wall, swinging too hard and letting the racket drop between contacts.',
  successTarget:
    'Reach at least 20 consecutive controlled contacts during the alternating exercise in two of the three rounds.',
  easierVariation: 'Stand closer, allow one bounce and practise forehand or backhand separately.',
  harderProgression:
    'After the foam-ball version is controlled, use a suitable shuttle only where its rebound is predictable; wear eye protection and stop immediately after an unsafe rebound.',
  completionRequirement:
    'Maintains compact technique, racket readiness and a predictable foam-ball rebound as the pace increases.',
}

const reactiveSplitStepCuesSteps: HomePracticeStep[] = [
  {
    title: 'Random direction reactions',
    instruction:
      'Wait relaxed at the base. When the guide calls front, back, left or right, make a small split step, push to that marker, shadow the matching stroke and recover fully before the next cue.',
    amount: '8–10 cues · 40 secs',
    durationSeconds: 40,
    spokenCues: ['Front', 'Back', 'Left', 'Right'],
    cueIntervalSeconds: { min: 3, max: 4 },
  },
  {
    title: 'Round recovery',
    instruction:
      'Walk slowly, lower the racket and breathe. Check that every marker is still in place, then return to the base ready for the next round.',
    amount: 'Rest 40 secs',
    durationSeconds: 40,
    kind: 'rest',
  },
]

const reactiveSplitStepCuesSetup =
  'Put four markers one controlled step from a central base: front, back, left and right. Turn up your device volume and place the screen where you do not need to look at it while moving.'
const reactiveSplitStepCuesWorkRest =
  'Press Start once. The guide calls a random direction every 3–4 seconds for 40 seconds, then starts a 40-second recovery. Complete 5 rounds.'
const reactiveSplitStepCuesSafety =
  'Test the cue volume before moving. Keep every marker close enough to fit the room, and reduce speed if the feet cross, slide or approach furniture.'

export const reactiveSplitStepCuesContent = {
  illustrationURL: '/images/drills/reactive-split-step-cues.png',
  stepIllustrationURL: '/images/drills/stepsheets/reactive-split-step-cues-v2.png',
  stepIllustrationColumns: 2,
  stepIllustrationRows: 1,
  durationMinutes: 9,
  equipment: 'Racket, four floor markers and a device with sound',
  instructions: [
    `Setup: ${reactiveSplitStepCuesSetup}`,
    reactiveSplitStepCuesSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${reactiveSplitStepCuesWorkRest}\nSafety: ${reactiveSplitStepCuesSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Stay relaxed before the cue, land the split step as the direction is called and push first with the leg opposite the direction of travel.',
  commonMistakes:
    'Bouncing continuously, guessing before the cue and using steps too large for the available space.',
  successTarget:
    'Complete at least 8 correctly timed reactions in four of five rounds while finishing balanced.',
  easierVariation: 'Walk to each called marker and use only a small split step before each push.',
  harderProgression:
    'Move the markers slightly farther away or assign a specific shadow stroke to each direction while preserving control.',
  completionRequirement:
    'Reacts after each cue without pre-moving and regains a balanced base before the next cue.',
}

const highIntensityShadowIntervalSteps: HomePracticeStep[] = [
  {
    title: 'Eight-direction shadow interval',
    instruction:
      'Wait on the base, then react only after the guide calls a straight or diagonal direction. Split step, move to the matching marker, shadow the appropriate stroke and recover fully before the next cue.',
    amount: '8–10 cues · 30 secs',
    durationSeconds: 30,
    spokenCues: [
      'Front',
      'Back',
      'Left',
      'Right',
      'Front left',
      'Front right',
      'Rear left',
      'Rear right',
    ],
    cueIntervalSeconds: { min: 2.5, max: 3.5 },
  },
  {
    title: 'Round recovery',
    instruction:
      'Walk slowly, breathe and rate the round’s movement quality from 1 to 5. Reset every marker and return to the base before the next round.',
    amount: 'Rest 45 secs',
    durationSeconds: 45,
    kind: 'rest',
  },
]

const highIntensityShadowIntervalSetup =
  'Arrange eight markers one controlled step from a central base: front, back, left, right and the four diagonals. Leave full racket clearance, turn up your device volume and warm up with 2–3 minutes of easy movement.'
const highIntensityShadowIntervalWorkRest =
  'Press Start once. The guide mixes all eight directions every 2.5–3.5 seconds for 30 seconds, then starts a 45-second recovery. Complete 6 rounds at purposeful—not maximum—speed.'
const highIntensityShadowIntervalSafety =
  'Keep every route compact enough for the room. Stop a round when balance, landing control or recovery shape breaks down, and never continue on a slippery surface.'

export const highIntensityShadowIntervalsContent = {
  illustrationURL: '/images/drills/high-intensity-shadow-intervals.png',
  stepIllustrationURL: '/images/drills/stepsheets/high-intensity-shadow-intervals-v2.png',
  stepIllustrationColumns: 2,
  stepIllustrationRows: 1,
  durationMinutes: 14,
  equipment: 'Racket, eight small floor markers and a device with sound',
  instructions: [
    `Setup: ${highIntensityShadowIntervalSetup}`,
    highIntensityShadowIntervalSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${highIntensityShadowIntervalWorkRest}\nSafety: ${highIntensityShadowIntervalSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'React after the cue, keep the split step light, use steps scaled to the room and preserve a balanced recovery to base.',
  commonMistakes:
    'Guessing the next direction, confusing rear with back, using maximum speed immediately and continuing after movement shape breaks down.',
  successTarget:
    'Complete all six rounds with at least 8 correct reactions and movement quality rated 4 out of 5 or better.',
  easierVariation:
    'Use the four diagonal cues only, move at a controlled pace and complete four 25-second rounds.',
  harderProgression:
    'Move the markers slightly farther away or assign a specific stroke to every direction while preserving recovery quality.',
  completionRequirement:
    'Responds correctly to straight and diagonal cues while maintaining the same balance and recovery rhythm in the final round as the first.',
}

const badmintonBodyweightStrengthSteps: HomePracticeStep[] = [
  {
    title: 'Split squat',
    instruction:
      'Stand in a staggered stance with both feet planted. Lower vertically until the rear knee hovers above the floor, keep the front knee aligned over the foot, then stand with control. Complete both sides.',
    amount: '8 reps / side',
  },
  {
    title: 'Glute bridge',
    instruction:
      'Lie on your back with knees bent. Press through both feet, lift the hips without arching the lower back, pause briefly, then lower with control.',
    amount: '10 reps',
  },
  {
    title: 'Counter incline push-up',
    instruction:
      'Place both hands on a sturdy fixed counter or use a wall. Keep the body in one straight line, bend the elbows to lower the chest, then press away without letting the hips sag.',
    amount: '8 reps',
  },
  {
    title: 'Calf raise',
    instruction:
      'Stand tall near a wall for light balance support if needed. Rise onto the balls of both feet, pause at the top, then lower the heels slowly.',
    amount: '12 reps',
  },
  {
    title: 'Front plank',
    instruction:
      'Place the elbows below the shoulders, brace the trunk, squeeze the glutes and keep a straight line from head to heels. Breathe normally throughout the hold.',
    amount: '25 secs',
    durationSeconds: 25,
  },
  {
    title: 'Round recovery',
    instruction:
      'Stand or walk slowly, breathe and shake out the arms and legs. Check the mat and counter area before the next round starts.',
    amount: 'Rest 60 secs',
    durationSeconds: 60,
    kind: 'rest',
  },
]

const badmintonBodyweightStrengthSetup =
  'Place an exercise mat on a non-slip floor and choose a sturdy fixed counter or clear wall for incline push-ups. Warm up with 2 minutes of easy marching, squats and arm circles.'
const badmintonBodyweightStrengthWorkRest =
  'Complete each rep target with control and tap Reps done once after each set. The 25-second plank and 60-second round recovery advance automatically. Complete 3 rounds.'
const badmintonBodyweightStrengthSafety =
  'Do not use a chair or movable table for push-ups. Stop any exercise that causes sharp pain, and shorten the set when posture or joint alignment can no longer be maintained.'

export const badmintonBodyweightStrengthContent = {
  illustrationURL: '/images/drills/badminton-bodyweight-strength-circuit-v2.png',
  stepIllustrationURL: '/images/drills/stepsheets/badminton-bodyweight-strength-circuit-v2.png',
  stepIllustrationColumns: 3,
  stepIllustrationRows: 2,
  durationMinutes: 14,
  equipment: 'Exercise mat and a sturdy fixed counter or clear wall',
  instructions: [
    `Setup: ${badmintonBodyweightStrengthSetup}`,
    badmintonBodyweightStrengthSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${badmintonBodyweightStrengthWorkRest}\nSafety: ${badmintonBodyweightStrengthSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Move with control, keep knees aligned, brace the trunk, breathe continuously and stop every set before form breaks down.',
  commonMistakes:
    'Resting the rear knee during split squats, using movable furniture for push-ups, rushing repetitions and holding the breath.',
  successTarget:
    'Finish three rounds with consistent technique and no more than one shortened set.',
  easierVariation:
    'Complete two rounds, reduce each exercise by two repetitions and perform incline push-ups against a wall.',
  harderProgression:
    'Add a fourth round or use a three-second lowering phase without increasing resistance.',
  completionRequirement:
    'Maintains posture, joint alignment and controlled breathing through the final round.',
}

const shoulderAndCoreControlSteps: HomePracticeStep[] = [
  {
    title: 'Band pull-apart',
    instruction:
      'Hold a very light band at chest height with the arms nearly straight. Keep the shoulders down, gently pull the hands apart without arching the back, then return slowly.',
    amount: '10 reps',
  },
  {
    title: 'External rotation',
    instruction:
      'Secure the very light band to a fixed anchor at elbow height. Keep the elbow bent 90 degrees and lightly against the ribs, rotate the forearm outward without twisting, then return slowly. Complete both sides.',
    amount: '8 reps / side',
  },
  {
    title: 'Dead bug',
    instruction:
      'Lie on your back, brace gently and keep the lower back neutral. Slowly extend one leg as the opposite arm reaches overhead, return with control, then alternate sides.',
    amount: '8 reps / side',
  },
  {
    title: 'Right bent-knee side plank',
    instruction:
      'Lie on the right side with both knees bent and the right elbow directly below the shoulder. Lift the hips to make a straight line from head to knees and breathe normally.',
    amount: '20 secs',
    durationSeconds: 20,
  },
  {
    title: 'Left bent-knee side plank',
    instruction:
      'Lie on the left side with both knees bent and the left elbow directly below the shoulder. Lift the hips to make a straight line from head to knees and keep the neck relaxed.',
    amount: '20 secs',
    durationSeconds: 20,
  },
  {
    title: 'Round recovery',
    instruction:
      'Stand or walk slowly, lower the shoulders and breathe. Check that the band anchor and mat are still secure before beginning the next round.',
    amount: 'Rest 45 secs',
    durationSeconds: 45,
    kind: 'rest',
  },
]

const shoulderAndCoreControlSetup =
  'Use a very light resistance band, a fixed anchor at elbow height and an exercise mat on a non-slip floor. Warm up for 5 minutes with easy walking and comfortable shoulder movements.'
const shoulderAndCoreControlWorkRest =
  'Complete each rep target with control and tap Reps done once after each set. The right and left side-plank timers run separately for 20 seconds, followed by an automatic 45-second recovery. Complete 3 rounds.'
const shoulderAndCoreControlSafety =
  'Test the band and anchor before every round. Use only a comfortable, pain-free range; stop for shoulder, neck or lower-back pain, and do not continue if the band or anchor slips or shows damage.'

export const shoulderAndCoreControlContent = {
  illustrationURL: '/images/drills/shoulder-core-control-v2.png',
  stepIllustrationURL: '/images/drills/stepsheets/shoulder-core-control-v2.png',
  stepIllustrationColumns: 3,
  stepIllustrationRows: 2,
  durationMinutes: 12,
  equipment: 'Very light resistance band, secure fixed anchor and exercise mat',
  instructions: [
    `Setup: ${shoulderAndCoreControlSetup}`,
    shoulderAndCoreControlSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${shoulderAndCoreControlWorkRest}\nSafety: ${shoulderAndCoreControlSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Keep the ribs controlled, shoulders away from the ears and movements slow enough to maintain a relaxed neck and stable trunk.',
  commonMistakes:
    'Using a heavy band, relying on an insecure anchor, shrugging, twisting the trunk and forcing a painful shoulder range.',
  successTarget:
    'Complete all three rounds with pain-free shoulder movement, a relaxed neck and stable trunk position.',
  easierVariation:
    'Use no band for the shoulder patterns, reduce the core repetitions and shorten each side plank to 10 seconds.',
  harderProgression:
    'Add two controlled repetitions per exercise or lengthen each bent-knee side plank to 30 seconds without increasing band resistance.',
  completionRequirement:
    'Controls the shoulder and trunk without shrugging, twisting or discomfort through the final round.',
}

const resetRallyRehearsalSteps: HomePracticeStep[] = [
  {
    title: 'Build the reset',
    instruction:
      'Stand as if the last rally just ended. Turn away from the imaginary court, breathe out slowly, loosen the racket grip and shoulders, say “next rally”, then turn back into a balanced ready stance. Repeat the same sequence three times.',
    amount: '3 resets · 30 secs',
    durationSeconds: 30,
  },
  {
    title: 'Serve and third shot',
    instruction:
      'Use the reset, then say a short plan aloud: serve target plus next shot. Picture the likely return for one breath, then shadow the serve, split step, third shot and recovery at game speed. Complete three clear rehearsals.',
    amount: '3 patterns · 50 secs',
    durationSeconds: 50,
  },
  {
    title: 'Return and first attack',
    instruction:
      'Use the same reset and start in a receiving stance. Say one return target, picture the server contact for one breath, then split, shadow the return, move to the next attacking shot and recover. Complete three rehearsals at game speed.',
    amount: '3 patterns · 50 secs',
    durationSeconds: 50,
  },
  {
    title: 'Defend and recover',
    instruction:
      'Use the reset after an imagined error. Rehearse three pressure replies in order: block and recover, drive and recover, then lift and recover. Keep the racket available and finish every pattern balanced rather than trying to imagine a perfect winner.',
    amount: '3 choices · 50 secs',
    durationSeconds: 50,
  },
  {
    title: 'Round recovery',
    instruction:
      'Walk slowly, breathe normally and relax the hand and shoulders. Recall the four reset actions—turn, exhale, release and cue—then return to the ready stance for the next round.',
    amount: 'Recover · 30 secs',
    durationSeconds: 30,
    kind: 'rest',
  },
]

const resetRallyRehearsalSetup =
  'Clear a non-slip space for one split step and two controlled shadow movements. Place two floor markers for front and rear court, hold one racket and stand at a central base. The app provides every situation; no prompts or notes are needed.'
const resetRallyRehearsalWorkRest =
  'Press Start once. Complete the five guided steps for 2 rounds. Keep round 1 controlled, then make round 2 sharper while preserving the same brief reset and spoken plan.'
const resetRallyRehearsalSafety =
  'Check ceiling height and keep every swing controlled. Use a smaller movement range in a tight space, keep eyes open during all shadow actions and stop if movement causes pain, dizziness or loss of balance.'

export const resetRallyRehearsalContent = {
  illustrationURL: '/images/drills/reset-and-rally-rehearsal.png',
  stepIllustrationURL: '/images/drills/reset-and-rally-rehearsal.png',
  stepIllustrationColumns: 1,
  stepIllustrationRows: 1,
  durationMinutes: 7,
  equipment: 'One racket, two floor markers and a clear non-slip space',
  instructions: [
    `Setup: ${resetRallyRehearsalSetup}`,
    resetRallyRehearsalSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${resetRallyRehearsalWorkRest}\nSafety: ${resetRallyRehearsalSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Use the same short reset every time, keep each spoken plan to one controllable pattern and connect the mental picture immediately to balanced game-speed shadow movement.',
  commonMistakes:
    'Creating a long story, focusing on winning the rally, changing the reset each time, gripping tightly and performing the shadow pattern too slowly to resemble play.',
  successTarget:
    'Use the same turn-exhale-release-cue reset and state a clear first-three-shot intention before at least 5 of 6 rally patterns, then shadow each pattern at game speed with a balanced recovery.',
  easierVariation:
    'Complete one round, use only one movement after the serve or return and perform every shadow action at a controlled pace.',
  harderProgression:
    'Use an opponent-specific serve, return or defensive pattern, reduce the reset to five seconds and change the second shot when the imagined reply changes.',
  completionRequirement:
    'Completes the reset without prompting, states one controllable rally intention and physically rehearses the opening pattern with balanced recovery.',
}

const soloRacketControlSteps: HomePracticeStep[] = [
  {
    title: 'Forehand control',
    instruction:
      'Hold one racket in your usual racket hand with a relaxed forehand grip. Tap one shuttle or lightweight foam ball upward using small finger and forearm movements. Keep the racket in front and contacts below head height.',
    amount: '30 secs',
    durationSeconds: 30,
  },
  {
    title: 'Backhand control',
    instruction:
      'Keep the same racket in the same hand and change to a thumb-led backhand grip. Tap the object upward with a compact action, keeping the racket head in front and the arm relaxed.',
    amount: '30 secs',
    durationSeconds: 30,
  },
  {
    title: 'Alternating grip control',
    instruction:
      'Keep one racket in the same hand. After every contact, rotate the handle with the fingers between forehand and backhand grip, then make the next compact upward tap.',
    amount: '30 secs',
    durationSeconds: 30,
  },
  {
    title: 'Round recovery',
    instruction:
      'Lower the racket, shake out the hand and walk slowly. Retrieve the object only after it has stopped moving, then return to the clear practice area.',
    amount: 'Rest 30 secs',
    durationSeconds: 30,
    kind: 'rest',
  },
]

const soloRacketControlSetup =
  'Clear at least 2 metres around you. Use one racket and one shuttle or lightweight foam ball, hold the racket in your usual racket hand and begin with a relaxed forehand grip.'
const soloRacketControlWorkRest =
  'Press Start once. Complete 30 seconds of forehand control, 30 seconds of backhand control and 30 seconds alternating grips, followed by a 30-second recovery. Complete 3 rounds.'
const soloRacketControlSafety =
  'Keep every contact below head height. Stop swinging if the object moves toward furniture, a wall or another person; let it land and retrieve it only when it is safe.'

export const soloRacketControlContent = {
  illustrationURL: '/images/drills/solo-racket-control-circuit.png',
  stepIllustrationURL: '/images/drills/stepsheets/solo-racket-control-circuit.png',
  stepIllustrationColumns: 2,
  stepIllustrationRows: 2,
  durationMinutes: 8,
  equipment: 'One racket, one shuttle or lightweight foam ball, and a clear 2-metre practice space',
  instructions: [
    `Setup: ${soloRacketControlSetup}`,
    soloRacketControlSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${soloRacketControlWorkRest}\nSafety: ${soloRacketControlSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Use relaxed fingers to rotate the grip, keep the racket in front and make compact controlled contacts.',
  commonMistakes:
    'Squeezing the handle, moving the racket between hands, swinging from the shoulder and chasing loose contacts.',
  successTarget:
    'Complete all three rounds with at least 20 controlled contacts in each work round while keeping one racket in the same hand.',
  easierVariation:
    'Use a balloon or allow the object to bounce or be caught after each contact before resetting the grip.',
  harderProgression:
    'Alternate high and low contacts while taking small side steps without leaving the clear area.',
  completionRequirement:
    'Changes grip with the fingers without looking at the handle and stays in control of the object.',
}

const lowServeFloorTargetSteps: HomePracticeStep[] = [
  {
    title: '10 low serves',
    instruction:
      'For every serve, set the racket foot slightly forward and keep both feet still. Hold the feathers with the cork facing the strings, use a relaxed thumb grip and make one continuous short forward push that sends the shuttle on a shallow rising path. Contact the cork first with the whole shuttle below 1.15 metres, hold the finish briefly and reset. Count target hits, record the score and collect every shuttle before pressing once to begin the next round.',
    amount: '10 serves',
  },
]

const lowServeFloorTargetSetup =
  'Mark a serving line and a wide scaled landing target 2.5–3 metres ahead using tape or two flat towels. This shorter home target trains touch rather than full-court distance. Keep 10 shuttles in a tube or stable container beside and behind the racket foot, clear of the serving path.'
const lowServeFloorTargetWorkRest =
  'Complete 4 rounds of 10 serves. After each group of 10, record the number that landed in the target, collect all shuttles and press once to begin the next round.'
const lowServeFloorTargetSafety =
  'Use a clear lane with no people, glass or breakable objects ahead. Keep loose shuttles in the container and do not begin another round until every shuttle has been collected from the floor.'

export const lowServeFloorTargetContent = {
  illustrationURL: '/images/drills/low-serve-floor-targets.png',
  stepIllustrationURL: '/images/drills/low-serve-floor-targets.png',
  stepIllustrationColumns: 1,
  stepIllustrationRows: 1,
  durationMinutes: 10,
  equipment:
    'One racket, 10 shuttles, tape or two flat towels, a shuttle tube or stable container, and a clear 3-metre lane',
  instructions: [
    `Setup: ${lowServeFloorTargetSetup}`,
    lowServeFloorTargetSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${lowServeFloorTargetWorkRest}\nSafety: ${lowServeFloorTargetSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Start from the same balanced stance, keep both feet still, use a relaxed thumb grip and send the shuttle with a short continuous push from a repeatable contact point.',
  commonMistakes:
    'Using a large backswing, moving a foot during the serve, contacting the feathers first, striking too hard and leaving loose shuttles near the feet.',
  successTarget:
    'Land at least 7 of 10 serves in the floor target in each of the final two rounds.',
  easierVariation:
    'Make the landing zone wider or move it closer while keeping the same compact serving action.',
  harderProgression:
    'If a safe lane of about 4 metres is available, move the target toward full-court service distance and alternate clearly marked T, body and wide zones.',
  completionRequirement:
    'Repeats the same stable setup and compact action while controlling landing distance in two consecutive rounds.',
}

const overheadShadowTechniqueSteps: HomePracticeStep[] = [
  {
    title: 'Racket-side forehand overhead',
    instruction:
      'Complete each repetition as one sequence: start balanced at the base and make a small split step; turn side-on and move one controlled step diagonally back toward the racket-side marker; raise the non-racket arm and prepare the racket behind the shoulder; reach to an imaginary contact point high and slightly in front of the racket shoulder; let the forearm rotate naturally, finish across the body and recover to the base. Move smoothly rather than swinging at full speed. After 8 repetitions, rest for about 30 seconds, then press once to begin the next round.',
    amount: '8 reps',
  },
]

const overheadShadowTechniqueSetup =
  'Place one marker a small step diagonally behind the base on the racket side: rear-right for a right-handed player or rear-left for a left-handed player. Check the full swing path above, behind and beside you. Use a racket only with safe overhead clearance; otherwise use a rolled hand towel.'
const overheadShadowTechniqueWorkRest =
  'Complete 3 rounds of 8 controlled repetitions. Rest about 30 seconds after each group of 8, then press once to begin the next round.'
const overheadShadowTechniqueSafety =
  'Keep the rear movement to one controlled step and never run backward. Stop if the racket or hand could reach the ceiling, a light fitting, a wall or furniture, or if the shoulder movement causes pain.'

export const overheadShadowTechniqueContent = {
  illustrationURL: '/images/drills/overhead-shadow-technique.png',
  stepIllustrationURL: '/images/drills/overhead-shadow-technique.png',
  stepIllustrationColumns: 1,
  stepIllustrationRows: 1,
  durationMinutes: 9,
  equipment:
    'One racket or rolled hand towel, one floor marker, and a clear non-slip space with safe overhead clearance',
  instructions: [
    `Setup: ${overheadShadowTechniqueSetup}`,
    overheadShadowTechniqueSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${overheadShadowTechniqueWorkRest}\nSafety: ${overheadShadowTechniqueSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Turn side-on early, lead with the non-racket arm, keep the grip relaxed, reach high and slightly in front, then recover balanced to the same base.',
  commonMistakes:
    'Treating each phase as a separate exercise, running backward, forcing a full-speed swing, letting the contact drift behind the shoulder and practising beneath a low ceiling.',
  successTarget:
    'Complete at least 20 of 24 repetitions with a high contact shape and a balanced return to the base.',
  easierVariation:
    'Use a rolled hand towel and rehearse the complete sequence without the diagonal step until the swing path is comfortable.',
  harderProgression:
    'Move two controlled steps to the racket-side rear marker or call clear, drop or smash while keeping the same preparation and balanced recovery.',
  completionRequirement:
    'Completes the full split-turn-reach-finish-recover sequence without losing balance in at least 7 of 8 repetitions in the final round.',
}

const lungeBalanceLegStrengthSteps: HomePracticeStep[] = [
  {
    title: 'Alternating badminton lunges',
    instruction:
      'Step forward into a controlled racket-leg lunge, land heel first and keep the front knee aligned over the toes. Reach the racket forward, hold for 2 seconds, push back to the start and alternate sides. Aim for about 6 repetitions per side without rushing.',
    amount: '6 reps / side · 60 secs',
    durationSeconds: 60,
  },
  {
    title: 'Unsupported calf raises',
    instruction:
      'Stand tall with feet hip-width and arms slightly out for balance. Rise slowly onto the balls of both feet, pause for 1 second and lower under control. Aim for 8 smooth repetitions without leaning on furniture.',
    amount: '8 reps · 30 secs',
    durationSeconds: 30,
  },
  {
    title: 'Single-leg balance',
    instruction:
      'Stand on one leg with a soft knee and level hips, lift the other knee modestly forward and keep the racket relaxed at your side. Balance on the first leg for 20 seconds, then change legs when the timer reaches 0:20.',
    amount: '20 secs / side · 40 secs',
    durationSeconds: 40,
  },
  {
    title: 'Round recovery',
    instruction:
      'Walk slowly, shake out the legs and breathe normally. Check that the floor remains clear and non-slip before the next round starts.',
    amount: 'Rest 45 secs',
    durationSeconds: 45,
    kind: 'rest',
  },
]

const lungeBalanceLegStrengthSetup =
  'Clear a non-slip space long enough for one comfortable forward lunge. Keep furniture outside the movement area. Hold one racket for the lunge and balance exercises; no chair is required.'
const lungeBalanceLegStrengthWorkRest =
  'Press Start once. Complete 60 seconds of alternating lunges, 30 seconds of calf raises and 40 seconds of single-leg balance, followed by a 45-second recovery. Complete 3 rounds; the guide advances automatically.'
const lungeBalanceLegStrengthSafety =
  'Use a shorter lunge if the front knee turns inward, the heel lifts or balance is lost. Stand near a clear wall for fingertip support only if needed. Stop for sharp pain, joint pain or dizziness; muscle effort is acceptable, pain is not.'

export const lungeBalanceLegStrengthContent = {
  illustrationURL: '/images/drills/lunge-balance-leg-strength.png',
  stepIllustrationURL: '/images/drills/stepsheets/lunge-balance-leg-strength-v2.png',
  stepIllustrationColumns: 2,
  stepIllustrationRows: 2,
  durationMinutes: 10,
  equipment: 'One racket and a clear, non-slip space long enough for one comfortable forward lunge',
  instructions: [
    `Setup: ${lungeBalanceLegStrengthSetup}`,
    lungeBalanceLegStrengthSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${lungeBalanceLegStrengthWorkRest}\nSafety: ${lungeBalanceLegStrengthSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Land heel first, keep the knee tracking over the toes, hold the trunk tall, move slowly and finish every repetition balanced.',
  commonMistakes:
    'Knee collapsing inward, front heel lifting, leaning on furniture, locking the standing knee and using a range that causes pain.',
  successTarget:
    'Complete all three rounds with aligned lunges, controlled calf raises and no more than one balance reset per side in the final round.',
  easierVariation:
    'Use a shallower lunge and stand beside a clear wall for light fingertip support during calf raises or single-leg balance.',
  harderProgression:
    'Add a controlled racket reach to each lunge and a slow knee drive after each recovery without increasing lunge depth.',
  completionRequirement:
    'Controls both sides without pain, knee collapse or repeated balance loss through the final round.',
}

const singlesBaseRecoveryShadowSteps: HomePracticeStep[] = [
  {
    title: 'Serve, recover and cover',
    instruction:
      'Shadow a high serve toward the deep centre, recover to a balanced singles base, then react to one called corner. Shadow the reply and recover according to the quality of the imagined shot.',
    amount: '6 patterns · 45 secs',
    durationSeconds: 45,
    spokenCues: ['Front left', 'Front right', 'Rear left', 'Rear right'],
    cueIntervalSeconds: { min: 5, max: 7 },
  },
  {
    title: 'Round recovery',
    instruction:
      'Walk slowly, loosen the grip and check that the serving action, first recovery step and final base remained balanced.',
    amount: 'Rest 30 secs',
    durationSeconds: 30,
    kind: 'rest',
  },
]

const singlesBaseRecoveryShadowSetup =
  'Mark a serving position, one central singles base and four corner targets in a clear non-slip area. Use compact home-sized steps and mirror racket-side details if you are left-handed.'
const singlesBaseRecoveryShadowWorkRest =
  'Complete 4 rounds of 45 seconds. Start each pattern with a high-serve shadow, recover to base, react to the called corner and recover again. Rest 30 seconds between rounds.'
const singlesBaseRecoveryShadowSafety =
  'Use only home-sized movements, keep the racket clear of walls and ceilings, and stop if balance or landing control deteriorates.'

export const singlesBaseRecoveryShadowContent = {
  illustrationURL: '/images/drills/singles-base-recovery-shadow.svg',
  stepIllustrationURL: '/images/drills/singles-base-recovery-shadow.svg',
  stepIllustrationColumns: 1,
  stepIllustrationRows: 1,
  durationMinutes: 8,
  equipment: 'Racket, five floor markers and a device with sound',
  instructions: [
    `Setup: ${singlesBaseRecoveryShadowSetup}`,
    singlesBaseRecoveryShadowSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${singlesBaseRecoveryShadowWorkRest}\nSafety: ${singlesBaseRecoveryShadowSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Finish the serve balanced, recover immediately, split as the cue arrives and let the imagined reply determine the final base.',
  commonMistakes:
    'Watching the imagined serve, returning automatically to one fixed spot and using court-sized steps in a small room.',
  successTarget: 'Complete at least 20 of 24 patterns with two balanced recoveries.',
  easierVariation: 'Use two front corners only and walk each pattern.',
  harderProgression:
    'Add straight-lift and cross-lift calls that require different recovery positions.',
  completionRequirement:
    'Links the serve, first recovery, split step and corner movement without pausing between actions.',
}

const doublesFirstFourShadowSteps: HomePracticeStep[] = [
  {
    title: 'Serve and third shot',
    instruction:
      'Shadow a low serve, stay ready near the front service line, then react to a straight, body or wide return cue with a compact net interception or drive.',
    amount: '6 patterns · 40 secs',
    durationSeconds: 40,
    spokenCues: ['Straight', 'Body', 'Wide'],
    cueIntervalSeconds: { min: 5, max: 6 },
  },
  {
    title: 'Return and fourth shot',
    instruction:
      'Start in a receiving stance, shadow an early flat or net return, recover with the racket up and react to the next cue without drifting backward unnecessarily.',
    amount: '6 patterns · 40 secs',
    durationSeconds: 40,
    spokenCues: ['Net', 'Drive', 'Push'],
    cueIntervalSeconds: { min: 5, max: 6 },
  },
  {
    title: 'Round recovery',
    instruction: 'Relax the grip, breathe and review whether the racket stayed above the hand.',
    amount: 'Rest 30 secs',
    durationSeconds: 30,
    kind: 'rest',
  },
]

const doublesFirstFourShadowSetup =
  'Mark a short service line, a serving position and a receiving position in a clear space. Add three compact target markers for straight, body and wide replies.'
const doublesFirstFourShadowWorkRest =
  'Complete 3 rounds. Work for 40 seconds on serve-and-third-shot patterns, 40 seconds on return-and-fourth-shot patterns, then rest for 30 seconds.'
const doublesFirstFourShadowSafety =
  'Keep movements compact, use a short racket action and leave full clearance from walls, furniture and other people.'

export const doublesFirstFourShadowContent = {
  illustrationURL: '/images/drills/doubles-first-four-shadow.svg',
  stepIllustrationURL: '/images/drills/doubles-first-four-shadow.svg',
  stepIllustrationColumns: 1,
  stepIllustrationRows: 1,
  durationMinutes: 8,
  equipment: 'Racket, five floor markers and a device with sound',
  instructions: [
    `Setup: ${doublesFirstFourShadowSetup}`,
    doublesFirstFourShadowSteps
      .map((step, index) => `${index + 1}. ${step.title} — ${step.instruction}`)
      .join('\n'),
    `Work/rest: ${doublesFirstFourShadowWorkRest}\nSafety: ${doublesFirstFourShadowSafety}`,
  ].join('\n\n'),
  coachingPoints:
    'Use a compact serve or return action, keep the racket up and prepare immediately for the third or fourth shot.',
  commonMistakes:
    'Admiring the serve, dropping the racket, taking a large swing and recovering away from the likely next contact.',
  successTarget: 'Complete 30 of 36 patterns with the racket ready before the next cue.',
  easierVariation: 'Use only straight cues and pause briefly between the first and second action.',
  harderProgression: 'Randomise serving and receiving starts without advance notice.',
  completionRequirement:
    'Connects the first two actions of the rally with compact preparation and an event-appropriate recovery.',
}

const configs: Record<string, StepSheetConfig> = {
  'Solo Racket Control Circuit': {
    sheetURL: soloRacketControlContent.stepIllustrationURL,
    columns: soloRacketControlContent.stepIllustrationColumns,
    rows: soloRacketControlContent.stepIllustrationRows,
    setup: soloRacketControlSetup,
    workRest: soloRacketControlWorkRest,
    safety: soloRacketControlSafety,
    rounds: 3,
    equipment: soloRacketControlContent.equipment,
    successTarget: soloRacketControlContent.successTarget,
    easierVariation: soloRacketControlContent.easierVariation,
    steps: soloRacketControlSteps,
  },
  'Low Serve Floor Targets': {
    sheetURL: lowServeFloorTargetContent.stepIllustrationURL,
    columns: lowServeFloorTargetContent.stepIllustrationColumns,
    rows: lowServeFloorTargetContent.stepIllustrationRows,
    setup: lowServeFloorTargetSetup,
    workRest: lowServeFloorTargetWorkRest,
    safety: lowServeFloorTargetSafety,
    rounds: 4,
    equipment: lowServeFloorTargetContent.equipment,
    successTarget: lowServeFloorTargetContent.successTarget,
    easierVariation: lowServeFloorTargetContent.easierVariation,
    steps: lowServeFloorTargetSteps,
  },
  'Overhead Shadow Technique': {
    sheetURL: overheadShadowTechniqueContent.stepIllustrationURL,
    columns: overheadShadowTechniqueContent.stepIllustrationColumns,
    rows: overheadShadowTechniqueContent.stepIllustrationRows,
    setup: overheadShadowTechniqueSetup,
    workRest: overheadShadowTechniqueWorkRest,
    safety: overheadShadowTechniqueSafety,
    rounds: 3,
    equipment: overheadShadowTechniqueContent.equipment,
    successTarget: overheadShadowTechniqueContent.successTarget,
    easierVariation: overheadShadowTechniqueContent.easierVariation,
    steps: overheadShadowTechniqueSteps,
  },
  'Compact Home Footwork': {
    sheetURL: compactHomeFootworkContent.stepIllustrationURL,
    columns: compactHomeFootworkContent.stepIllustrationColumns,
    rows: compactHomeFootworkContent.stepIllustrationRows,
    setup: compactHomeFootworkSetup,
    workRest: compactHomeFootworkWorkRest,
    safety: compactHomeFootworkSafety,
    rounds: 3,
    equipment: compactHomeFootworkContent.equipment,
    successTarget: compactHomeFootworkContent.successTarget,
    easierVariation: compactHomeFootworkContent.easierVariation,
    steps: compactHomeFootworkSteps,
  },
  'Lunge Balance and Leg Strength': {
    sheetURL: lungeBalanceLegStrengthContent.stepIllustrationURL,
    columns: lungeBalanceLegStrengthContent.stepIllustrationColumns,
    rows: lungeBalanceLegStrengthContent.stepIllustrationRows,
    setup: lungeBalanceLegStrengthSetup,
    workRest: lungeBalanceLegStrengthWorkRest,
    safety: lungeBalanceLegStrengthSafety,
    rounds: 3,
    equipment: lungeBalanceLegStrengthContent.equipment,
    successTarget: lungeBalanceLegStrengthContent.successTarget,
    easierVariation: lungeBalanceLegStrengthContent.easierVariation,
    steps: lungeBalanceLegStrengthSteps,
  },
  'Wall Drive and Defence': {
    sheetURL: wallDriveAndDefenceContent.stepIllustrationURL,
    columns: wallDriveAndDefenceContent.stepIllustrationColumns,
    rows: 2,
    setup: wallDriveAndDefenceSetup,
    workRest: wallDriveAndDefenceWorkRest,
    safety: wallDriveAndDefenceSafety,
    rounds: 3,
    equipment: wallDriveAndDefenceContent.equipment,
    successTarget: wallDriveAndDefenceContent.successTarget,
    easierVariation: wallDriveAndDefenceContent.easierVariation,
    steps: wallDriveAndDefenceSteps,
  },
  'Reactive Split-Step Cues': {
    sheetURL: reactiveSplitStepCuesContent.stepIllustrationURL,
    columns: reactiveSplitStepCuesContent.stepIllustrationColumns,
    rows: reactiveSplitStepCuesContent.stepIllustrationRows,
    setup: reactiveSplitStepCuesSetup,
    workRest: reactiveSplitStepCuesWorkRest,
    safety: reactiveSplitStepCuesSafety,
    rounds: 5,
    equipment: reactiveSplitStepCuesContent.equipment,
    successTarget: reactiveSplitStepCuesContent.successTarget,
    easierVariation: reactiveSplitStepCuesContent.easierVariation,
    steps: reactiveSplitStepCuesSteps,
  },
  'Badminton Bodyweight Strength Circuit': {
    sheetURL: badmintonBodyweightStrengthContent.stepIllustrationURL,
    columns: badmintonBodyweightStrengthContent.stepIllustrationColumns,
    rows: badmintonBodyweightStrengthContent.stepIllustrationRows,
    setup: badmintonBodyweightStrengthSetup,
    workRest: badmintonBodyweightStrengthWorkRest,
    safety: badmintonBodyweightStrengthSafety,
    rounds: 3,
    equipment: badmintonBodyweightStrengthContent.equipment,
    successTarget: badmintonBodyweightStrengthContent.successTarget,
    easierVariation: badmintonBodyweightStrengthContent.easierVariation,
    steps: badmintonBodyweightStrengthSteps,
  },
  'Shoulder and Core Control': {
    sheetURL: shoulderAndCoreControlContent.stepIllustrationURL,
    columns: shoulderAndCoreControlContent.stepIllustrationColumns,
    rows: shoulderAndCoreControlContent.stepIllustrationRows,
    setup: shoulderAndCoreControlSetup,
    workRest: shoulderAndCoreControlWorkRest,
    safety: shoulderAndCoreControlSafety,
    rounds: 3,
    equipment: shoulderAndCoreControlContent.equipment,
    successTarget: shoulderAndCoreControlContent.successTarget,
    easierVariation: shoulderAndCoreControlContent.easierVariation,
    steps: shoulderAndCoreControlSteps,
  },
  'Reset and Rally Rehearsal': {
    sheetURL: resetRallyRehearsalContent.stepIllustrationURL,
    columns: resetRallyRehearsalContent.stepIllustrationColumns,
    rows: resetRallyRehearsalContent.stepIllustrationRows,
    setup: resetRallyRehearsalSetup,
    workRest: resetRallyRehearsalWorkRest,
    safety: resetRallyRehearsalSafety,
    rounds: 2,
    equipment: resetRallyRehearsalContent.equipment,
    successTarget: resetRallyRehearsalContent.successTarget,
    easierVariation: resetRallyRehearsalContent.easierVariation,
    steps: resetRallyRehearsalSteps,
  },
  'Match Visualization and Reset': {
    sheetURL: resetRallyRehearsalContent.stepIllustrationURL,
    columns: resetRallyRehearsalContent.stepIllustrationColumns,
    rows: resetRallyRehearsalContent.stepIllustrationRows,
    setup: resetRallyRehearsalSetup,
    workRest: resetRallyRehearsalWorkRest,
    safety: resetRallyRehearsalSafety,
    rounds: 2,
    equipment: resetRallyRehearsalContent.equipment,
    successTarget: resetRallyRehearsalContent.successTarget,
    easierVariation: resetRallyRehearsalContent.easierVariation,
    steps: resetRallyRehearsalSteps,
  },
  'High-Intensity Shadow Intervals': {
    sheetURL: highIntensityShadowIntervalsContent.stepIllustrationURL,
    columns: highIntensityShadowIntervalsContent.stepIllustrationColumns,
    rows: highIntensityShadowIntervalsContent.stepIllustrationRows,
    setup: highIntensityShadowIntervalSetup,
    workRest: highIntensityShadowIntervalWorkRest,
    safety: highIntensityShadowIntervalSafety,
    rounds: 6,
    equipment: highIntensityShadowIntervalsContent.equipment,
    successTarget: highIntensityShadowIntervalsContent.successTarget,
    easierVariation: highIntensityShadowIntervalsContent.easierVariation,
    steps: highIntensityShadowIntervalSteps,
  },
  'Singles Base Recovery Shadow': {
    sheetURL: singlesBaseRecoveryShadowContent.stepIllustrationURL,
    columns: singlesBaseRecoveryShadowContent.stepIllustrationColumns,
    rows: singlesBaseRecoveryShadowContent.stepIllustrationRows,
    setup: singlesBaseRecoveryShadowSetup,
    workRest: singlesBaseRecoveryShadowWorkRest,
    safety: singlesBaseRecoveryShadowSafety,
    rounds: 4,
    equipment: singlesBaseRecoveryShadowContent.equipment,
    successTarget: singlesBaseRecoveryShadowContent.successTarget,
    easierVariation: singlesBaseRecoveryShadowContent.easierVariation,
    steps: singlesBaseRecoveryShadowSteps,
  },
  'Doubles First-Four-Shot Shadow': {
    sheetURL: doublesFirstFourShadowContent.stepIllustrationURL,
    columns: doublesFirstFourShadowContent.stepIllustrationColumns,
    rows: doublesFirstFourShadowContent.stepIllustrationRows,
    setup: doublesFirstFourShadowSetup,
    workRest: doublesFirstFourShadowWorkRest,
    safety: doublesFirstFourShadowSafety,
    rounds: 3,
    equipment: doublesFirstFourShadowContent.equipment,
    successTarget: doublesFirstFourShadowContent.successTarget,
    easierVariation: doublesFirstFourShadowContent.easierVariation,
    steps: doublesFirstFourShadowSteps,
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
