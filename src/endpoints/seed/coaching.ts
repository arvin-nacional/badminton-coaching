import type { Payload } from 'payload'

import {
  homePracticeName,
  programHomePracticeInstructions,
  programHomePracticeSuccessCriteria,
} from '@/collections/Coaching/syncProgramHomePractices'
import {
  badmintonBodyweightStrengthContent,
  buildHomePracticeSequence,
  compactHomeFootworkContent,
  highIntensityShadowIntervalsContent,
  lowServeFloorTargetContent,
  lungeBalanceLegStrengthContent,
  matchVisualizationResetContent,
  overheadShadowTechniqueContent,
  reactiveSplitStepCuesContent,
  shoulderAndCoreControlContent,
  soloRacketControlContent,
  wallDriveAndDefenceContent,
} from '@/data/homePracticeSteps'

type Level = 'foundations' | 'development' | 'competitive'
type SkillCategory =
  | 'stroke-technique'
  | 'footwork'
  | 'consistency'
  | 'tactical-decisions'
  | 'match-performance'
  | 'physical-readiness'
  | 'training-habits'

type LessonType = 'technical' | 'movement' | 'tactical' | 'match-play' | 'assessment'
export type LessonSeed = {
  week: number
  title: string
  lessonType: LessonType
  objective: string
  durationMinutes: number
  drills: string[]
  independentPractice: string
  successCriteria: string
  sessionPlan: {
    warmUp: string
    movementPreparation: string
    conditionedGame: string
    matchPlay: string
    cooldownAndFeedback: string
  }
}
type PhaseSeed = {
  name: string
  description: string
  order: number
  startWeek: number
  endWeek: number
  lessons: LessonSeed[]
}
type ProgramSeed = {
  name: string
  level: Level
  description: string
  durationWeeks: number
  phases: PhaseSeed[]
}

const lesson = (
  week: number,
  title: string,
  lessonType: LessonType,
  objective: string,
  drills: string[],
  independentPractice: string,
  successCriteria: string,
): LessonSeed => {
  const primaryDrill = drills[0]
  const progressiveDrill = drills[1] || drills[0]
  const warmUpByType: Record<LessonType, string> = {
    assessment:
      '10 min — Raise body temperature, mobilise ankles, hips and shoulders, then complete familiar racket contacts without corrective coaching so the starting level is observable.',
    technical:
      '10 min — Use light court movement, shoulder mobility and relaxed racket contacts. Gradually increase range while keeping grip changes and preparation clean.',
    movement:
      '10 min — Raise body temperature, mobilise ankles and hips, then rehearse split steps, directional pushes and controlled lunges at increasing speed.',
    tactical:
      '10 min — Combine dynamic movement with cooperative rallying. Call the intended target before each shot to connect preparation with decision-making.',
    'match-play':
      '10 min — Complete a match-ready dynamic warm-up followed by cooperative length, net and flat exchanges. Finish with serve and return rehearsal.',
  }

  return {
    week,
    title,
    lessonType,
    objective,
    durationMinutes: 90,
    drills,
    independentPractice,
    successCriteria,
    sessionPlan: {
      warmUp: warmUpByType[lessonType],
      movementPreparation: `10 min — Rehearse the movement pattern needed for ${primaryDrill}. Begin without a shuttle, add a partner cue, then increase speed only while balance and recovery remain controlled.`,
      conditionedGame: `15 min — Use ${progressiveDrill} as the starting pattern, then play the rally out. Award a bonus point when the player demonstrates the session objective: ${objective}`,
      matchPlay:
        lessonType === 'assessment'
          ? `20 min — Play scored rallies with minimal intervention. Record evidence against this standard: ${successCriteria}`
          : `20 min — Play a scored game with one process goal linked to the session objective. Coach only at agreed intervals and record whether the trained pattern transfers without prompting.`,
      cooldownAndFeedback: `10 min — Reduce intensity with easy movement and mobility. Ask the player what improved, what limited performance and what should be practised next. Record progress against: ${successCriteria}`,
    },
  }
}

const programs: ProgramSeed[] = [
  {
    name: 'Badminton Foundations',
    level: 'foundations',
    description:
      'Build dependable movement, grips, preparation and core strokes before adding speed and pressure.',
    durationWeeks: 12,
    phases: [
      {
        name: 'Movement and racket basics',
        description: 'Athletic posture, grips, split step and safe court movement.',
        order: 1,
        startWeek: 1,
        endWeek: 3,
        lessons: [
          lesson(
            1,
            'Starting profile and court orientation',
            'assessment',
            'Establish a safe movement and racket-control baseline.',
            ['Grip Change Tap-Ups', 'Four-Corner Shadow Rhythm'],
            'Complete the solo racket-control, compact-footwork and lunge-and-balance benchmarks at a controlled pace, then record the lowest result as the starting priority.',
            'Uses a suitable grip and reaches four corners without losing balance.',
          ),
          lesson(
            2,
            'Grip changes and ready position',
            'technical',
            'Change grip with the fingers while keeping the racket available for the next shot.',
            ['Grip Change Tap-Ups', 'Low Serve Gate'],
            'Complete the solo racket-control circuit for relaxed grip changes, then the low-serve target circuit and record the final two target scores.',
            'Changes grip without looking at the handle in 8 of 10 attempts.',
          ),
          lesson(
            3,
            'Split, move and recover',
            'movement',
            'Introduce a repeatable split-step and recovery rhythm.',
            ['Four-Corner Shadow Rhythm', 'Lunge, Net and Recover'],
            'Complete the compact-footwork, reactive split-step and lunge-and-balance circuits, then record the least stable direction or recovery.',
            'Returns to a balanced base after 8 of 10 movements.',
          ),
        ],
      },
      {
        name: 'Core stroke patterns',
        description: 'Serve, lift, clear, net shot and recovery to base.',
        order: 2,
        startWeek: 4,
        endWeek: 7,
        lessons: [
          lesson(
            4,
            'Overhead clear foundations',
            'technical',
            'Create safe height and length using early preparation and overhead contact.',
            ['Clear to Targets', 'Grip Change Tap-Ups'],
            'Complete 3 x 8 controlled overhead shadows, then reinforce relaxed grip changes with one racket-control circuit.',
            'Places 8 of 10 clears beyond the doubles service line.',
          ),
          lesson(
            5,
            'Clear and rear-court recovery',
            'movement',
            'Link the overhead clear to an immediate balanced recovery.',
            ['Clear to Targets', 'Rear-Court Clear and Recovery'],
            'Complete the compact-footwork circuit for controlled rear-court movement, then 3 x 8 overhead-shadow repetitions with an immediate balanced recovery.',
            'Recovers before the feeder begins the next action in 8 of 10 feeds.',
          ),
          lesson(
            6,
            'Reliable service starts',
            'technical',
            'Develop a repeatable low serve and understand legal service preparation.',
            ['Low Serve Gate', 'Twenty-Shot Cooperative Rally'],
            'Complete one solo racket-control circuit to prime the thumb-led grip, then complete 4 rounds of 10 low serves and record target hits.',
            'Achieves at least 80% legal serves with controlled height.',
          ),
          lesson(
            7,
            'Lift for time and length',
            'technical',
            'Use the lift to move the opponent back and regain court position.',
            ['Lift for Length', 'Lunge, Net and Recover'],
            'Complete the compact-footwork circuit with controlled front-corner approaches, then the lunge-and-balance circuit that supports a stable underarm lift.',
            'Reaches the rear target and recovers on 8 of 10 feeds.',
          ),
        ],
      },
      {
        name: 'Controlled rallies',
        description: 'Link movement and strokes with repeatable placement.',
        order: 3,
        startWeek: 8,
        endWeek: 10,
        lessons: [
          lesson(
            8,
            'Forecourt control',
            'technical',
            'Approach, play and recover from the forecourt with a stable lunge.',
            ['Lunge, Net and Recover', 'Lift for Length'],
            'Complete the compact footwork circuit with extra attention to balanced front-corner lunges, then respond to random direction cues and recover to the same base.',
            'Selects net or lift appropriately and finishes balanced in 8 of 10 feeds.',
          ),
          lesson(
            9,
            'Serve, return and first recovery',
            'tactical',
            'Start the rally with a clear serve, return and recovery intention.',
            ['Low Serve Gate', 'Lift for Length'],
            'Complete the low-serve target circuit, then use reactive split-step cues to practise the first movement after serving or returning.',
            'Completes the first three actions without an unforced error in 7 of 10 rallies.',
          ),
          lesson(
            10,
            'Build a controlled rally',
            'match-play',
            'Sustain a rally using safe height, length and recovery.',
            ['Twenty-Shot Cooperative Rally', 'Rear-Court Clear and Recovery'],
            'Complete the solo racket-control circuit for repeatable contacts, then rehearse controlled overhead preparation and recovery to base.',
            'Completes three rallies of at least 20 shots with functional recovery.',
          ),
        ],
      },
      {
        name: 'Ready for development',
        description: 'Apply the foundations in conditioned games and assessment.',
        order: 4,
        startWeek: 11,
        endWeek: 12,
        lessons: [
          lesson(
            11,
            'Connect the full court',
            'match-play',
            'Move between forecourt and rear court while selecting a safe response.',
            [
              'Four-Corner Shadow Rhythm',
              'Rear-Court Clear and Recovery',
              'Lunge, Net and Recover',
            ],
            'Complete the compact six-corner footwork and reactive split-step cue circuits, then note the least stable direction to review with your coach.',
            'Maintains balance and returns to a suitable base in 8 of 10 rallies.',
          ),
          lesson(
            12,
            'Foundations progress assessment',
            'assessment',
            'Demonstrate the core movement, serve, clear, lift and rally standards.',
            ['Low Serve Gate', 'Clear to Targets', 'Twenty-Shot Cooperative Rally'],
            'Complete the low-serve, overhead-shadow and compact-footwork benchmarks at a controlled pace, then record the weakest result as the next training priority.',
            'Meets the completion target for at least three drills and identifies the next priority.',
          ),
        ],
      },
    ],
  },
  {
    name: 'Player Development',
    level: 'development',
    description:
      'Improve movement efficiency, shot quality, consistency and tactical choices in realistic rallies.',
    durationWeeks: 16,
    phases: [
      {
        name: 'Movement efficiency',
        description: 'Earlier preparation, balanced recovery and efficient court coverage.',
        order: 1,
        startWeek: 1,
        endWeek: 4,
        lessons: [
          lesson(
            1,
            'Development movement baseline',
            'assessment',
            'Measure split-step timing, corner efficiency and recovery quality.',
            ['Random Six-Corner Feeding', 'Twenty-Shot Cooperative Rally'],
            'Complete the compact six-corner footwork and reactive split-step cue circuits, then record the least stable direction and one repeated timing issue.',
            'Completes at least 10 of 12 random feeds with a balanced recovery and sustains a 20-shot cooperative rally with functional recovery.',
          ),
          lesson(
            2,
            'Reactive split-step timing',
            'movement',
            'Time the split from opponent contact rather than guessing direction.',
            ['Four-Corner Shadow Rhythm', 'Random Six-Corner Feeding'],
            'Complete the reactive split-step cue circuit before the compact footwork circuit, and record how many reactions were correctly timed without guessing.',
            'Responds correctly without pre-moving on 10 of 12 feeds.',
          ),
          lesson(
            3,
            'Efficient rear-court recovery',
            'movement',
            'Use an economical turn, landing and recovery under increasing feed speed.',
            ['Rear-Court Clear and Recovery', 'Clear to Targets'],
            'Complete the overhead-shadow circuit, then use both rear markers in the compact-footwork circuit and note which recovery loses balance first.',
            'Maintains clear length and recovers before 8 of 10 follow-up feeds.',
          ),
          lesson(
            4,
            'Forecourt transition and balance',
            'movement',
            'Move forward quickly, control the lunge and recover for the next direction.',
            ['Lunge, Net and Recover', 'Net-Lift-Kill Progression'],
            'Complete the lunge-and-balance circuit before the compact-footwork circuit, keeping both front-corner approaches controlled and balanced.',
            'Handles both forecourt corners with correct recovery in 8 of 10 feeds.',
          ),
        ],
      },
      {
        name: 'Building pressure',
        description: 'Use length, pace and the net to create weak replies.',
        order: 2,
        startWeek: 5,
        endWeek: 8,
        lessons: [
          lesson(
            5,
            'Clear and drop from one preparation',
            'technical',
            'Disguise clear and drop while preserving balance and recovery.',
            ['Clear to Targets', 'Clear-Drop Decision Rally'],
            'Complete the overhead-shadow circuit with one repeatable preparation, then finish the shoulder-and-core circuit without losing posture.',
            'Uses the same preparation and reaches the intended zone in 8 of 10 shots.',
          ),
          lesson(
            6,
            'Smash and second attack',
            'technical',
            'Carry attacking pressure from the smash into the next shot.',
            ['Rear-Court Clear and Recovery', 'Three-Shot Attack Pattern'],
            'Complete the overhead-shadow circuit for the first attack, then use the wall-drive circuit to rehearse compact second-shot preparation.',
            'Completes 7 of 10 three-shot attacks without losing balance.',
          ),
          lesson(
            7,
            'Flat exchanges and front-court follow-up',
            'technical',
            'Control drives, protect the body and recognise the chance to move forward.',
            ['Lunge, Net and Recover', 'Drive Channel Exchange'],
            'Complete the wall-drive circuit for compact exchanges, then the lunge-and-balance circuit for a controlled front-court follow-up.',
            'Sustains 20 drives and responds correctly to 4 of 5 blocks.',
          ),
          lesson(
            8,
            'Mid-program technical review',
            'assessment',
            'Check whether improved technique remains stable in a rally.',
            ['Random Six-Corner Feeding', 'Three-Shot Attack Pattern', 'Drive Channel Exchange'],
            'Complete the reactive-cue, overhead-shadow and wall-drive benchmarks, then record the lowest result to review with your coach.',
            'Improves at least one baseline measure without reducing movement quality.',
          ),
        ],
      },
      {
        name: 'Rally construction',
        description: 'Recognise space and select shots with purpose.',
        order: 3,
        startWeek: 9,
        endWeek: 12,
        lessons: [
          lesson(
            9,
            'Create space through the forecourt',
            'tactical',
            'Use net pressure and the lift to change opponent position.',
            ['Lunge, Net and Recover', 'Net-Lift-Kill Progression'],
            'Complete the lunge-and-balance circuit, then use match-visualisation prompts to rehearse when to stay at the net and when to lift.',
            'Creates a clear attacking chance in 6 of 10 rallies.',
          ),
          lesson(
            10,
            'Singles clear-drop construction',
            'tactical',
            'Move the opponent deep before using the forecourt with purpose.',
            ['Twenty-Shot Cooperative Rally', 'Clear-Drop Decision Rally'],
            'Complete the overhead-shadow circuit, then visualise clear-drop rallies in which a deep shot creates the next forecourt opportunity.',
            'Makes the correct clear-or-drop choice in 8 of 10 reviewed rallies.',
          ),
          lesson(
            11,
            'Defend, neutralise and counter',
            'tactical',
            'Select a block, drive or lift according to balance and available space.',
            ['Drive Channel Exchange', 'Defence Choice Under Pressure'],
            'Complete the wall-drive circuit, then visualise defensive scenarios and choose one clear intention: neutralise, counter or lift to reset.',
            'Chooses an effective defensive response on 12 of 15 attacks.',
          ),
          lesson(
            12,
            'Doubles formation and rotation',
            'tactical',
            'Transition between front-back and side-side formations as a pair.',
            ['Drive Channel Exchange', 'Attack-Defence Rotation'],
            'Complete the compact-footwork circuit, then visualise attack-to-defence transitions and name the correct formation after each prompt.',
            'Uses the correct formation after 8 of 10 transitions.',
          ),
        ],
      },
      {
        name: 'Match transfer',
        description: 'Apply skills consistently in games, scoring and assessment.',
        order: 4,
        startWeek: 13,
        endWeek: 16,
        lessons: [
          lesson(
            13,
            'Consistency under direction change',
            'match-play',
            'Maintain shot quality while moving the shuttle between front and rear court.',
            ['Twenty-Shot Cooperative Rally', 'Clear-Drop Decision Rally'],
            'Complete the overhead-shadow and compact-footwork circuits, then record whether preparation, direction change or recovery caused the most errors.',
            'Sustains a 20-shot rally while including four controlled changes of direction.',
          ),
          lesson(
            14,
            'Pressure score decisions',
            'match-play',
            'Use high-percentage patterns and a reset routine at critical scores.',
            ['Tournament Interval Simulation', 'Pressure Score: 18-All'],
            'Complete the low-serve target circuit, then visualise critical-score serve and return scenarios using one repeatable reset and first-three-shot plan.',
            'Follows the stated plan in 8 of 10 pressure rallies.',
          ),
          lesson(
            15,
            'Personal match plan',
            'match-play',
            'Connect one reliable rally pattern to one attacking pattern.',
            ['Clear-Drop Decision Rally', 'Three-Shot Attack Pattern', 'Pressure Score: 18-All'],
            'Complete the overhead-shadow circuit, then use match visualisation to rehearse the opening actions and adjustment cue from a three-point match plan.',
            'Starts at least 7 of 10 rallies with the intended tactical pattern.',
          ),
          lesson(
            16,
            'Development progress assessment',
            'assessment',
            'Demonstrate technical, movement and tactical progress in match conditions.',
            ['Random Six-Corner Feeding', 'Net-Lift-Kill Progression', 'Pressure Score: 18-All'],
            'Complete the reactive-cue, overhead-shadow and wall-drive benchmarks, then use the lowest result to identify the next independent-practice priority.',
            'Meets two drill targets under pressure and explains the next training priority.',
          ),
        ],
      },
    ],
  },
  {
    name: 'Competitive Performance',
    level: 'competitive',
    description:
      'Develop an individual competition plan, pressure-ready skills and repeatable tournament routines.',
    durationWeeks: 20,
    phases: [
      {
        name: 'Performance profile',
        description: 'Assess strengths, limiting factors and match identity.',
        order: 1,
        startWeek: 1,
        endWeek: 5,
        lessons: [
          lesson(
            1,
            'Competition performance profile',
            'assessment',
            'Establish technical, movement, tactical and pressure baselines.',
            [
              'Random Six-Corner Feeding',
              'Pressure Score: 18-All',
              'Repeat Movement Quality Intervals',
            ],
            'Complete the high-intensity shadow benchmark, then visualise recent match scenarios and record one strength, one limiter and the first training priority.',
            'Produces a clear strength, limiting factor and first training priority.',
          ),
          lesson(
            2,
            'Movement quality under load',
            'movement',
            'Preserve timing, posture and recovery through repeated efforts.',
            ['Repeat Movement Quality Intervals', 'Random Six-Corner Feeding'],
            'Complete the high-intensity shadow and bodyweight-strength circuits, recording when footwork shape or posture first falls below the planned standard.',
            'Maintains a 4/5 movement-quality rating through the final interval.',
          ),
          lesson(
            3,
            'Rear-court recovery at match pace',
            'movement',
            'Recover according to shot quality while feeds become less predictable.',
            ['Rear-Court Clear and Recovery', 'Random Six-Corner Feeding'],
            'Complete the overhead-shadow circuit before the high-intensity movement intervals, and review whether the first recovery step stays efficient under load.',
            'Reaches an effective base before 10 of 12 follow-up shots.',
          ),
          lesson(
            4,
            'Serve and return pressure',
            'tactical',
            'Use placement and the third shot to gain the first advantage.',
            ['Low Serve Gate', 'Drive Channel Exchange', 'Pressure Score: 18-All'],
            'Complete the low-serve target and wall-drive circuits, linking accurate serve placement to compact return and third-shot preparation.',
            'Wins or neutralises the first three shots in 7 of 10 rallies.',
          ),
          lesson(
            5,
            'Confirm the performance plan',
            'assessment',
            'Translate baseline evidence into two measurable competition priorities.',
            ['Tournament Interval Simulation', 'Twenty-Shot Cooperative Rally'],
            'Use match visualisation to rehearse two measurable process goals, then complete the shoulder-and-core circuit as a controlled physical reset.',
            'Can state, demonstrate and measure both selected priorities.',
          ),
        ],
      },
      {
        name: 'Weapon development',
        description: 'Sharpen high-value patterns for singles or doubles.',
        order: 2,
        startWeek: 6,
        endWeek: 10,
        lessons: [
          lesson(
            6,
            'Primary attacking pattern',
            'technical',
            'Increase the repeatability of the player’s highest-value attack.',
            ['Three-Shot Attack Pattern', 'Clear-Drop Decision Rally'],
            'Complete the overhead-shadow and shoulder-and-core circuits, preserving the same preparation, trunk control and balanced recovery throughout.',
            'Completes 8 of 10 attack patterns with balance and intended placement.',
          ),
          lesson(
            7,
            'Second-shot continuation',
            'technical',
            'Maintain pressure when the first attack does not finish the rally.',
            ['Three-Shot Attack Pattern', 'Drive Channel Exchange'],
            'Complete the overhead-shadow circuit, then the wall-drive circuit to rehearse compact preparation for the second and third attacking contacts.',
            'Keeps the initiative through three shots in 7 of 10 sequences.',
          ),
          lesson(
            8,
            'Front-court creation and finish',
            'tactical',
            'Use tight net pressure to force a lift or loose reply.',
            ['Net-Lift-Kill Progression', 'Lunge, Net and Recover'],
            'Complete the lunge-and-balance circuit before the reactive split-step cues, keeping the racket available and the recovery controlled after every front call.',
            'Creates or finishes 7 of 10 forecourt attacking opportunities.',
          ),
          lesson(
            9,
            'Counterattack from defence',
            'tactical',
            'Turn a stable defensive contact into neutral or attacking position.',
            ['Defence Choice Under Pressure', 'Drive Channel Exchange'],
            'Complete the wall-drive circuit before the reactive split-step cues, recovering to a neutral ready position after every defensive contact and direction call.',
            'Neutralises or counterattacks 12 of 15 quality attacks.',
          ),
          lesson(
            10,
            'Weapon test in conditioned games',
            'assessment',
            'Apply the selected weapon without forcing it from poor situations.',
            ['Pressure Score: 18-All', 'Three-Shot Attack Pattern', 'Net-Lift-Kill Progression'],
            'Complete the overhead-shadow circuit, then visualise suitable and unsuitable attacking situations and record when the primary weapon should be used.',
            'Creates the intended pattern in at least 6 of 10 suitable rallies.',
          ),
        ],
      },
      {
        name: 'Pressure training',
        description: 'Execute decisions and techniques under score and time pressure.',
        order: 3,
        startWeek: 11,
        endWeek: 15,
        lessons: [
          lesson(
            11,
            'Mid-cycle match review',
            'assessment',
            'Identify which improvements are transferring into scored games.',
            ['Tournament Interval Simulation', 'Pressure Score: 18-All'],
            'Use match visualisation to review transfer under pressure, then complete the shoulder-and-core circuit and record what improved, the current limiter and the next priority.',
            'Supports the next priority with evidence from at least three rallies.',
          ),
          lesson(
            12,
            'Critical-score execution',
            'match-play',
            'Commit to a clear plan and appropriate risk at deuce scores.',
            ['Pressure Score: 18-All', 'Low Serve Gate'],
            'Complete the low-serve target circuit using the same breathing cue, then visualise critical-score first-three-shot plans and record whether the intention stayed clear.',
            'Follows the plan in 8 of 10 critical-score rallies.',
          ),
          lesson(
            13,
            'Between-rally reset',
            'match-play',
            'Use a short physical and mental reset after both wins and errors.',
            ['Tournament Interval Simulation', 'Pressure Score: 18-All'],
            'Complete the match-visualisation reset scenarios, then use the shoulder-and-core circuit to reinforce relaxed breathing, posture and physical control.',
            'Completes the routine independently before 9 of 10 rallies.',
          ),
          lesson(
            14,
            'Physical quality under fatigue',
            'movement',
            'Protect movement mechanics while fatigue and decision demands increase.',
            ['Repeat Movement Quality Intervals', 'Random Six-Corner Feeding'],
            'Complete the high-intensity shadow and bodyweight-strength circuits, stopping and recording the point where landing, posture or recovery quality first changes.',
            'Maintains technical movement standards through the final interval.',
          ),
          lesson(
            15,
            'Defence under scoreboard pressure',
            'match-play',
            'Make stable defensive choices when the opponent attacks at a critical score.',
            ['Defence Choice Under Pressure', 'Pressure Score: 18-All'],
            'Complete the wall-drive circuit, then visualise pressure attacks and rehearse three intentions: neutralise, counter and reset.',
            'Makes an effective choice in 12 of 15 pressure attacks.',
          ),
        ],
      },
      {
        name: 'Competition readiness',
        description: 'Practise tournament routines, review and performance planning.',
        order: 4,
        startWeek: 16,
        endWeek: 20,
        lessons: [
          lesson(
            16,
            'Tournament simulation',
            'match-play',
            'Rehearse warm-up, intervals, coaching cues and post-match review.',
            [
              'Tournament Interval Simulation',
              'Pressure Score: 18-All',
              'Repeat Movement Quality Intervals',
            ],
            'Complete the high-intensity shadow circuit as the physical rehearsal, then use match visualisation to practise the planned interval cues and tournament routine.',
            'Completes the simulation using the planned routine without coach reminders.',
          ),
          lesson(
            17,
            'Primary game plan',
            'tactical',
            'Apply the preferred game plan against a suitable opponent style.',
            ['Clear-Drop Decision Rally', 'Three-Shot Attack Pattern', 'Pressure Score: 18-All'],
            'Complete the overhead-shadow circuit, then visualise the opening, adjustment and closing patterns for game plan A against a suitable opponent style.',
            'Recognises and uses the planned pattern in 7 of 10 suitable rallies.',
          ),
          lesson(
            18,
            'Alternative game plan',
            'tactical',
            'Adjust when the primary pattern is being neutralised.',
            [
              'Defence Choice Under Pressure',
              'Attack-Defence Rotation',
              'Net-Lift-Kill Progression',
            ],
            'Complete the wall-drive circuit, then visualise two match signals that trigger the alternative plan and rehearse the first response to each.',
            'Changes plan for a clear reason and improves rally control in conditioned play.',
          ),
          lesson(
            19,
            'Taper and confidence rehearsal',
            'match-play',
            'Reduce volume while preserving sharpness, confidence and routine quality.',
            ['Low Serve Gate', 'Three-Shot Attack Pattern', 'Tournament Interval Simulation'],
            'Complete the low-serve target circuit at controlled quality, then use match visualisation for a brief confidence rehearsal and finish physically fresh.',
            'Meets key targets with low volume and finishes physically fresh.',
          ),
          lesson(
            20,
            'Competition readiness assessment',
            'assessment',
            'Confirm progress, readiness, next priorities and independent practice.',
            [
              'Random Six-Corner Feeding',
              'Pressure Score: 18-All',
              'Tournament Interval Simulation',
            ],
            'Complete the high-intensity shadow benchmark, then use match visualisation to record what improved, the current limiter, the next focus and competition readiness.',
            'Explains what improved, the current limiter, the next focus and readiness to compete.',
          ),
        ],
      },
    ],
  },
]

export const coachingPrograms = programs

const skills: Array<{ name: string; category: SkillCategory; description: string }> = [
  {
    name: 'Grip changes and racket readiness',
    category: 'stroke-technique',
    description:
      'Change efficiently between forehand, backhand and thumb grips while keeping the racket available for the next shot.',
  },
  {
    name: 'Forehand overhead clear',
    category: 'stroke-technique',
    description:
      'Create length with early preparation, overhead contact and a relaxed throwing action.',
  },
  {
    name: 'Backhand short serve',
    category: 'stroke-technique',
    description:
      'Deliver a repeatable low serve that crosses tightly and lands near the service line.',
  },
  {
    name: 'Forehand high serve',
    category: 'stroke-technique',
    description: 'Serve high and deep with balance, control and consistent placement.',
  },
  {
    name: 'Net shot',
    category: 'stroke-technique',
    description: 'Play a soft, controlled reply that travels close to the tape.',
  },
  {
    name: 'Underarm lift',
    category: 'stroke-technique',
    description: 'Lift with sufficient height and length from the forecourt under control.',
  },
  {
    name: 'Drop shot',
    category: 'stroke-technique',
    description: 'Use overhead preparation to play a controlled shot into the forecourt.',
  },
  {
    name: 'Smash and follow-up',
    category: 'stroke-technique',
    description: 'Attack steeply, land balanced and prepare immediately for the next ball.',
  },
  {
    name: 'Drive and block',
    category: 'stroke-technique',
    description: 'Exchange flat shots with compact preparation and stable racket control.',
  },
  {
    name: 'Split step timing',
    category: 'footwork',
    description: 'Time a small directional loading action as the opponent strikes.',
  },
  {
    name: 'Rear-court recovery',
    category: 'footwork',
    description: 'Recover from an overhead stroke to an effective base before the next reply.',
  },
  {
    name: 'Forecourt lunge and recovery',
    category: 'footwork',
    description: 'Move into the forecourt with a stable lunge and push back efficiently.',
  },
  {
    name: 'Six-corner movement',
    category: 'footwork',
    description: 'Move efficiently to all court corners while maintaining posture and rhythm.',
  },
  {
    name: 'Rally length and error control',
    category: 'consistency',
    description: 'Sustain purposeful rallies while reducing unforced errors.',
  },
  {
    name: 'Serve and return consistency',
    category: 'consistency',
    description: 'Start rallies reliably with accurate serves and controlled returns.',
  },
  {
    name: 'Change of direction control',
    category: 'consistency',
    description: 'Redirect the shuttle without losing balance, height or accuracy.',
  },
  {
    name: 'Creating space',
    category: 'tactical-decisions',
    description: 'Move the opponent before attacking the available space.',
  },
  {
    name: 'Defending under pressure',
    category: 'tactical-decisions',
    description: 'Choose blocks, lifts and drives that neutralise an opponent’s attack.',
  },
  {
    name: 'Singles rally construction',
    category: 'tactical-decisions',
    description: 'Use length, movement and changes of pace to build a scoring opportunity.',
  },
  {
    name: 'Doubles rotation',
    category: 'tactical-decisions',
    description:
      'Move between attacking and defensive formations with clear partner responsibility.',
  },
  {
    name: 'Score management',
    category: 'match-performance',
    description: 'Use routines and sensible risk choices at different stages of a game.',
  },
  {
    name: 'Between-rally routine',
    category: 'match-performance',
    description: 'Reset physically and mentally, then commit to a clear next-rally intention.',
  },
  {
    name: 'Movement endurance',
    category: 'physical-readiness',
    description: 'Maintain quality court movement through repeated efforts.',
  },
  {
    name: 'Landing and lunge stability',
    category: 'physical-readiness',
    description: 'Control deceleration, landing and lunging positions safely.',
  },
  {
    name: 'Independent practice quality',
    category: 'training-habits',
    description: 'Practise with a measurable target, deliberate repetitions and honest review.',
  },
  {
    name: 'Session preparation and reflection',
    category: 'training-habits',
    description: 'Arrive ready, record learning and act on coach feedback.',
  },
]

type DrillSeed = {
  name: string
  skill: string
  level: Level
  eventType: 'general' | 'singles' | 'doubles'
  equipment: string
  numberOfPlayers: number
  durationMinutes: number
  instructions: string
  coachingPoints: string
  commonMistakes: string
  difficulty: 'easy' | 'moderate' | 'challenging'
  practiceSetting?: 'home' | 'court'
  illustrationURL?: string
  successTarget: string
  easierVariation: string
  harderProgression: string
  completionRequirement: string
}

const drills: DrillSeed[] = [
  {
    name: 'Solo Racket Control Circuit',
    skill: 'Grip changes and racket readiness',
    level: 'foundations',
    eventType: 'general',
    practiceSetting: 'home',
    ...soloRacketControlContent,
    numberOfPlayers: 1,
    difficulty: 'easy',
  },
  {
    name: 'Low Serve Floor Targets',
    skill: 'Backhand short serve',
    level: 'foundations',
    eventType: 'doubles',
    practiceSetting: 'home',
    ...lowServeFloorTargetContent,
    numberOfPlayers: 1,
    difficulty: 'easy',
  },
  {
    name: 'Overhead Shadow Technique',
    skill: 'Forehand overhead clear',
    level: 'foundations',
    eventType: 'general',
    practiceSetting: 'home',
    ...overheadShadowTechniqueContent,
    numberOfPlayers: 1,
    difficulty: 'easy',
  },
  {
    name: 'Compact Home Footwork',
    skill: 'Six-corner movement',
    level: 'foundations',
    eventType: 'general',
    practiceSetting: 'home',
    ...compactHomeFootworkContent,
    numberOfPlayers: 1,
    difficulty: 'easy',
  },
  {
    name: 'Lunge Balance and Leg Strength',
    skill: 'Landing and lunge stability',
    level: 'foundations',
    eventType: 'general',
    practiceSetting: 'home',
    ...lungeBalanceLegStrengthContent,
    numberOfPlayers: 1,
    difficulty: 'easy',
  },
  {
    name: 'Wall Drive and Defence',
    skill: 'Drive and block',
    level: 'development',
    eventType: 'general',
    practiceSetting: 'home',
    ...wallDriveAndDefenceContent,
    numberOfPlayers: 1,
    difficulty: 'moderate',
  },
  {
    name: 'Reactive Split-Step Cues',
    skill: 'Split step timing',
    level: 'development',
    eventType: 'general',
    practiceSetting: 'home',
    ...reactiveSplitStepCuesContent,
    numberOfPlayers: 1,
    difficulty: 'moderate',
  },
  {
    name: 'Badminton Bodyweight Strength Circuit',
    skill: 'Landing and lunge stability',
    level: 'development',
    eventType: 'general',
    practiceSetting: 'home',
    ...badmintonBodyweightStrengthContent,
    numberOfPlayers: 1,
    difficulty: 'moderate',
  },
  {
    name: 'Shoulder and Core Control',
    skill: 'Smash and follow-up',
    level: 'development',
    eventType: 'general',
    practiceSetting: 'home',
    ...shoulderAndCoreControlContent,
    numberOfPlayers: 1,
    difficulty: 'moderate',
  },
  {
    name: 'Match Visualization and Reset',
    skill: 'Between-rally routine',
    level: 'competitive',
    eventType: 'general',
    practiceSetting: 'home',
    ...matchVisualizationResetContent,
    numberOfPlayers: 1,
    difficulty: 'moderate',
  },
  {
    name: 'High-Intensity Shadow Intervals',
    skill: 'Movement endurance',
    level: 'competitive',
    eventType: 'singles',
    practiceSetting: 'home',
    ...highIntensityShadowIntervalsContent,
    numberOfPlayers: 1,
    difficulty: 'challenging',
  },
  {
    name: 'Grip Change Tap-Ups',
    skill: 'Grip changes and racket readiness',
    level: 'foundations',
    eventType: 'general',
    equipment: 'Racket and shuttle',
    numberOfPlayers: 1,
    durationMinutes: 8,
    instructions: 'Alternate forehand and backhand tap-ups while changing grip with the fingers.',
    coachingPoints: 'Relax the hand, rotate with the fingers and keep the racket in front.',
    commonMistakes: 'Panhandle grip, tight fist and large arm swings.',
    difficulty: 'easy',
    successTarget: 'Three sets of 20 controlled contacts without losing the correct grip.',
    easierVariation: 'Catch the shuttle after each contact and reset the grip.',
    harderProgression: 'Move while alternating low and high contacts.',
    completionRequirement: 'Changes grip automatically while maintaining control.',
  },
  {
    name: 'Clear to Targets',
    skill: 'Forehand overhead clear',
    level: 'foundations',
    eventType: 'general',
    equipment: 'Rackets, shuttles and two rear-court targets',
    numberOfPlayers: 2,
    durationMinutes: 12,
    instructions:
      'A feeder sends comfortable shuttles to the rear court. The player clears toward alternating deep targets.',
    coachingPoints: 'Turn side-on, prepare early, contact overhead and finish balanced.',
    commonMistakes: 'Contact behind the body, excessive force and falling sideways.',
    difficulty: 'moderate',
    successTarget: '8 of 10 clears land beyond the doubles service line.',
    easierVariation: 'Use hand feeds and one large central target.',
    harderProgression: 'Randomise feeds between the two rear corners.',
    completionRequirement: 'Maintains length and balance in a cooperative rally.',
  },
  {
    name: 'Rear-Court Clear and Recovery',
    skill: 'Rear-court recovery',
    level: 'foundations',
    eventType: 'general',
    equipment: 'Rackets, shuttles and a base marker',
    numberOfPlayers: 2,
    durationMinutes: 12,
    instructions:
      'Move from base to a fed rear-court shuttle, clear, land balanced and recover to the marker immediately.',
    coachingPoints:
      'Split as the feeder strikes, turn early, contact overhead, land balanced and recover immediately.',
    commonMistakes:
      'Waiting flat-footed, crossing under the shuttle and watching the shot before recovering.',
    difficulty: 'moderate',
    successTarget: '8 successful clear-and-recovery repetitions out of 10.',
    easierVariation: 'Shadow the pattern without a shuttle.',
    harderProgression: 'Use a random clear or drop feed after the recovery.',
    completionRequirement: 'Applies the correct recovery in a conditioned rally.',
  },
  {
    name: 'Four-Corner Shadow Rhythm',
    skill: 'Six-corner movement',
    level: 'foundations',
    eventType: 'general',
    equipment: 'Four court markers',
    numberOfPlayers: 1,
    durationMinutes: 10,
    instructions:
      'Move from base to four called corners, shadow the appropriate stroke and recover with steady rhythm.',
    coachingPoints:
      'Stay tall, use a split step, lead with the correct leg and return under control.',
    commonMistakes:
      'Rushing, clicking heels together and standing upright during direction changes.',
    difficulty: 'easy',
    successTarget: 'Complete 4 rounds of 45 seconds with correct movement shape.',
    easierVariation: 'Walk each pattern before increasing speed.',
    harderProgression: 'Use six corners with unpredictable calls.',
    completionRequirement: 'Maintains balance and a consistent base throughout the sequence.',
  },
  {
    name: 'Lunge, Net and Recover',
    skill: 'Forecourt lunge and recovery',
    level: 'foundations',
    eventType: 'general',
    equipment: 'Rackets, shuttles and a base marker',
    numberOfPlayers: 2,
    durationMinutes: 10,
    instructions:
      'The feeder sends to one forecourt corner. Play a net shot, stabilise the lunge and push back to base.',
    coachingPoints:
      'Racket leads, heel lands first, knee tracks over toes and the front leg pushes recovery.',
    commonMistakes:
      'Reaching with the trunk, collapsing the knee and turning away from the shuttle.',
    difficulty: 'moderate',
    successTarget: '8 of 10 repetitions finish balanced back at base.',
    easierVariation: 'Shadow the lunge with a suspended shuttle.',
    harderProgression: 'Randomise between both forecourt corners.',
    completionRequirement: 'Recovers in time for a follow-up lift or net feed.',
  },
  {
    name: 'Low Serve Gate',
    skill: 'Backhand short serve',
    level: 'foundations',
    eventType: 'doubles',
    equipment: 'Racket, 20 shuttles and a tape or gate above the net',
    numberOfPlayers: 1,
    durationMinutes: 10,
    instructions:
      'Serve through the gate so the shuttle crosses low and lands inside a marked front service target.',
    coachingPoints: 'Stable setup, relaxed thumb grip, small push and consistent contact point.',
    commonMistakes: 'Large backswing, slicing excessively and changing the starting position.',
    difficulty: 'easy',
    successTarget: '16 of 20 legal serves land in the target area.',
    easierVariation: 'Increase the target size and net clearance.',
    harderProgression: 'Alternate wide, body and T targets under a time limit.',
    completionRequirement: 'Starts a conditioned service game with 80% target accuracy.',
  },
  {
    name: 'Lift for Length',
    skill: 'Underarm lift',
    level: 'foundations',
    eventType: 'general',
    equipment: 'Rackets, shuttles and rear-court targets',
    numberOfPlayers: 2,
    durationMinutes: 10,
    instructions:
      'Feed to the forecourt and lift high toward a marked rear-court target before recovering.',
    coachingPoints:
      'Approach with racket prepared, contact in front and use a smooth accelerating action.',
    commonMistakes: 'Scooping from below, hitting too flat and remaining at the net.',
    difficulty: 'easy',
    successTarget: '8 of 10 lifts reach the rear target with enough height.',
    easierVariation: 'Feed to the racket side only.',
    harderProgression: 'Randomise forehand and backhand forecourt feeds.',
    completionRequirement: 'Uses the lift to reset a rally and recovers to base.',
  },
  {
    name: 'Twenty-Shot Cooperative Rally',
    skill: 'Rally length and error control',
    level: 'foundations',
    eventType: 'general',
    equipment: 'Rackets and shuttle',
    numberOfPlayers: 2,
    durationMinutes: 12,
    instructions: 'Rally cooperatively using clears and lifts, counting consecutive legal shots.',
    coachingPoints: 'Use safe height, recover after every shot and choose control before speed.',
    commonMistakes: 'Trying to win the rally, standing still and aiming too close to lines.',
    difficulty: 'moderate',
    successTarget: 'Complete three rallies of at least 20 shots.',
    easierVariation: 'Use half court and allow catches between sequences.',
    harderProgression: 'Add one controlled drop shot every five contacts.',
    completionRequirement: 'Sustains a controlled rally while keeping a functional base.',
  },
  {
    name: 'Random Six-Corner Feeding',
    skill: 'Split step timing',
    level: 'development',
    eventType: 'singles',
    equipment: 'Racket and multi-shuttle basket',
    numberOfPlayers: 2,
    durationMinutes: 15,
    instructions:
      'The feeder sends randomly to six areas. The player splits on contact, moves, returns safely and recovers.',
    coachingPoints:
      'Watch the feeder, time the split, take an efficient first step and regain base according to the reply.',
    commonMistakes: 'Splitting too early, guessing and using the same base after every shot.',
    difficulty: 'challenging',
    successTarget: 'Complete 3 sets of 12 feeds with at least 10 balanced recoveries.',
    easierVariation: 'Limit feeds to four known corners.',
    harderProgression: 'Add deception and require specified target returns.',
    completionRequirement: 'Responds to random feeds without pre-empting movement.',
  },
  {
    name: 'Clear-Drop Decision Rally',
    skill: 'Singles rally construction',
    level: 'development',
    eventType: 'singles',
    equipment: 'Rackets and shuttle',
    numberOfPlayers: 2,
    durationMinutes: 15,
    instructions:
      'Play half-court singles. Use clears to create space and select a drop only when the opponent is displaced.',
    coachingPoints:
      'Read opponent position, show the same preparation and recover according to shot quality.',
    commonMistakes:
      'Dropping from poor balance, forcing the attack and failing to cover the reply.',
    difficulty: 'moderate',
    successTarget: 'Make the correct clear-or-drop decision in 8 of 10 reviewed rallies.',
    easierVariation: 'Coach calls the shot after the player prepares.',
    harderProgression: 'Open the full court and allow attacking clears.',
    completionRequirement: 'Explains and demonstrates why the selected shot created pressure.',
  },
  {
    name: 'Net-Lift-Kill Progression',
    skill: 'Creating space',
    level: 'development',
    eventType: 'singles',
    equipment: 'Rackets and shuttles',
    numberOfPlayers: 2,
    durationMinutes: 15,
    instructions:
      'Begin with a net exchange. Lift when under pressure; attack a loose net reply and recover for the next ball.',
    coachingPoints:
      'Keep tight shots at the net, recognise loss of balance and change from neutral to attack quickly.',
    commonMistakes: 'Forcing a net shot too late, lifting flat and admiring the attack.',
    difficulty: 'challenging',
    successTarget: 'Create and finish 6 clear attacking opportunities in 10 rallies.',
    easierVariation: 'Use predictable feeds with no live scoring.',
    harderProgression: 'Play the rally out on the full singles court.',
    completionRequirement: 'Recognises when to persist at the net and when to reset with a lift.',
  },
  {
    name: 'Three-Shot Attack Pattern',
    skill: 'Smash and follow-up',
    level: 'development',
    eventType: 'general',
    equipment: 'Rackets and multi-shuttle basket',
    numberOfPlayers: 2,
    durationMinutes: 12,
    instructions:
      'Play smash, follow-up drive or block, then finish into open space from a three-shuttle feed.',
    coachingPoints:
      'Contact in front, land ready, move forward after the smash and keep the second action compact.',
    commonMistakes:
      'Over-hitting, landing with feet stuck and carrying a full swing into the follow-up.',
    difficulty: 'challenging',
    successTarget: 'Complete 7 of 10 three-shot patterns without losing balance.',
    easierVariation: 'Use a controlled half-smash and predictable follow-up.',
    harderProgression: 'Randomise the defensive reply and play out the rally.',
    completionRequirement: 'Maintains attack across consecutive shots in a conditioned game.',
  },
  {
    name: 'Drive Channel Exchange',
    skill: 'Drive and block',
    level: 'development',
    eventType: 'doubles',
    equipment: 'Rackets and shuttle',
    numberOfPlayers: 2,
    durationMinutes: 12,
    instructions:
      'Exchange flat drives inside a marked channel, then respond to an occasional block by moving forward.',
    coachingPoints:
      'Racket up, compact action, contact in front and recover the racket after every shot.',
    commonMistakes: 'Large swings, dropping the racket and hitting upward under pressure.',
    difficulty: 'moderate',
    successTarget: 'Sustain 20 drives and respond correctly to 4 of 5 blocks.',
    easierVariation: 'Use a wider channel at cooperative pace.',
    harderProgression: 'Add a third player and random body drives.',
    completionRequirement: 'Controls flat exchanges without losing front-court awareness.',
  },
  {
    name: 'Attack-Defence Rotation',
    skill: 'Doubles rotation',
    level: 'development',
    eventType: 'doubles',
    equipment: 'Rackets and shuttle',
    numberOfPlayers: 4,
    durationMinutes: 18,
    instructions:
      'Play conditioned doubles: attacking pair starts front-back, defenders side-side; rotate when attack is gained or lost.',
    coachingPoints:
      'Move as a pair, communicate, protect the middle and transition immediately after the quality of the shot changes.',
    commonMistakes:
      'Watching the shuttle, both players covering the same space and rotating from habit instead of shot outcome.',
    difficulty: 'challenging',
    successTarget: 'Use the correct formation after 8 of 10 transition moments.',
    easierVariation: 'Freeze after each transition for a formation check.',
    harderProgression: 'Play continuous points with bonus scoring for successful rotation.',
    completionRequirement: 'Maintains partner spacing during live doubles rallies.',
  },
  {
    name: 'Defence Choice Under Pressure',
    skill: 'Defending under pressure',
    level: 'competitive',
    eventType: 'doubles',
    equipment: 'Rackets and multi-shuttle basket',
    numberOfPlayers: 3,
    durationMinutes: 15,
    instructions:
      'Two attackers feed or smash at one defender, who chooses a block, drive or lift based on balance and space.',
    coachingPoints:
      'Defend from a stable base, absorb pace, direct away from the front player and recover the racket quickly.',
    commonMistakes:
      'Swinging too hard, blocking cross-court without control and choosing a drive while late.',
    difficulty: 'challenging',
    successTarget: 'Make an effective defensive choice on 12 of 15 attacks.',
    easierVariation: 'Attack at controlled pace into two fixed zones.',
    harderProgression: 'Add a partner and transition into a live rally.',
    completionRequirement:
      'Neutralises or counterattacks without relying on one defensive response.',
  },
  {
    name: 'Pressure Score: 18-All',
    skill: 'Score management',
    level: 'competitive',
    eventType: 'general',
    equipment: 'Rackets, shuttle and scoreboard',
    numberOfPlayers: 2,
    durationMinutes: 18,
    instructions:
      'Play repeated mini-games beginning at 18-all. Before each rally, state the serve/return plan and intended risk level.',
    coachingPoints:
      'Use the between-rally routine, commit to a clear first-three-shot plan and select high-percentage targets.',
    commonMistakes:
      'Rushing after errors, changing tactics without evidence and aiming for lines unnecessarily.',
    difficulty: 'challenging',
    successTarget: 'Follow the stated plan in at least 8 of 10 pressure rallies.',
    easierVariation: 'Start at 15-all with coach prompts between rallies.',
    harderProgression: 'Add consequences or play best-of-five deuce scenarios.',
    completionRequirement: 'Makes composed, explainable decisions at critical scores.',
  },
  {
    name: 'Tournament Interval Simulation',
    skill: 'Between-rally routine',
    level: 'competitive',
    eventType: 'general',
    equipment: 'Rackets, shuttle, timer and notes card',
    numberOfPlayers: 2,
    durationMinutes: 20,
    instructions:
      'Play timed rally blocks with only the regulation-like interval to breathe, review one cue and prepare for the next rally.',
    coachingPoints:
      'Turn away briefly, control breathing, use one useful cue and establish serve/return readiness.',
    commonMistakes:
      'Replaying the previous error, taking too many instructions and returning without a plan.',
    difficulty: 'moderate',
    successTarget: 'Complete the personal reset routine before 9 of 10 rallies.',
    easierVariation: 'Allow coach-led prompts and a longer reset.',
    harderProgression: 'Add score pressure, noise and restricted coaching.',
    completionRequirement: 'Uses the routine independently throughout a full practice game.',
  },
  {
    name: 'Repeat Movement Quality Intervals',
    skill: 'Movement endurance',
    level: 'competitive',
    eventType: 'general',
    equipment: 'Court markers, racket and interval timer',
    numberOfPlayers: 1,
    durationMinutes: 16,
    instructions:
      'Complete six-corner movement intervals while preserving split timing, posture and recovery quality.',
    coachingPoints:
      'Move smoothly before adding speed, breathe continuously and stop a repetition when shape breaks down.',
    commonMistakes:
      'Chasing speed, shortening recovery steps and allowing knees to collapse under fatigue.',
    difficulty: 'challenging',
    successTarget: 'Complete 6 x 40-second intervals with movement quality rated 4/5 or better.',
    easierVariation: 'Use four corners and 25-second intervals.',
    harderProgression: 'Add racket feeds during the final three intervals.',
    completionRequirement: 'Maintains technical movement standards through the final interval.',
  },
]

export const coachingDrills = drills

export const programHomeDrillAssignments: Record<string, Record<number, string[]>> = {
  'Badminton Foundations': {
    1: ['Solo Racket Control Circuit', 'Compact Home Footwork', 'Lunge Balance and Leg Strength'],
    2: ['Solo Racket Control Circuit', 'Low Serve Floor Targets'],
    3: ['Compact Home Footwork', 'Reactive Split-Step Cues', 'Lunge Balance and Leg Strength'],
    4: ['Overhead Shadow Technique', 'Solo Racket Control Circuit'],
    5: ['Compact Home Footwork', 'Overhead Shadow Technique'],
    6: ['Solo Racket Control Circuit', 'Low Serve Floor Targets'],
    7: ['Compact Home Footwork', 'Lunge Balance and Leg Strength'],
    8: ['Compact Home Footwork', 'Reactive Split-Step Cues'],
    9: ['Low Serve Floor Targets', 'Reactive Split-Step Cues'],
    10: ['Solo Racket Control Circuit', 'Overhead Shadow Technique'],
    11: ['Compact Home Footwork', 'Reactive Split-Step Cues'],
    12: ['Low Serve Floor Targets', 'Overhead Shadow Technique', 'Compact Home Footwork'],
  },
  'Player Development': {
    1: ['Compact Home Footwork', 'Reactive Split-Step Cues'],
    2: ['Reactive Split-Step Cues', 'Compact Home Footwork'],
    3: ['Overhead Shadow Technique', 'Compact Home Footwork'],
    4: ['Lunge Balance and Leg Strength', 'Compact Home Footwork'],
    5: ['Overhead Shadow Technique', 'Shoulder and Core Control'],
    6: ['Overhead Shadow Technique', 'Wall Drive and Defence'],
    7: ['Wall Drive and Defence', 'Lunge Balance and Leg Strength'],
    8: ['Reactive Split-Step Cues', 'Overhead Shadow Technique', 'Wall Drive and Defence'],
    9: ['Lunge Balance and Leg Strength', 'Match Visualization and Reset'],
    10: ['Overhead Shadow Technique', 'Match Visualization and Reset'],
    11: ['Wall Drive and Defence', 'Match Visualization and Reset'],
    12: ['Compact Home Footwork', 'Match Visualization and Reset'],
    13: ['Overhead Shadow Technique', 'Compact Home Footwork'],
    14: ['Low Serve Floor Targets', 'Match Visualization and Reset'],
    15: ['Overhead Shadow Technique', 'Match Visualization and Reset'],
    16: ['Reactive Split-Step Cues', 'Overhead Shadow Technique', 'Wall Drive and Defence'],
  },
  'Competitive Performance': {
    1: ['High-Intensity Shadow Intervals', 'Match Visualization and Reset'],
    2: ['High-Intensity Shadow Intervals', 'Badminton Bodyweight Strength Circuit'],
    3: ['Overhead Shadow Technique', 'High-Intensity Shadow Intervals'],
    4: ['Low Serve Floor Targets', 'Wall Drive and Defence'],
    5: ['Match Visualization and Reset', 'Shoulder and Core Control'],
    6: ['Overhead Shadow Technique', 'Shoulder and Core Control'],
    7: ['Overhead Shadow Technique', 'Wall Drive and Defence'],
    8: ['Lunge Balance and Leg Strength', 'Reactive Split-Step Cues'],
    9: ['Wall Drive and Defence', 'Reactive Split-Step Cues'],
    10: ['Overhead Shadow Technique', 'Match Visualization and Reset'],
    11: ['Match Visualization and Reset', 'Shoulder and Core Control'],
    12: ['Low Serve Floor Targets', 'Match Visualization and Reset'],
    13: ['Match Visualization and Reset', 'Shoulder and Core Control'],
    14: ['High-Intensity Shadow Intervals', 'Badminton Bodyweight Strength Circuit'],
    15: ['Wall Drive and Defence', 'Match Visualization and Reset'],
    16: ['High-Intensity Shadow Intervals', 'Match Visualization and Reset'],
    17: ['Overhead Shadow Technique', 'Match Visualization and Reset'],
    18: ['Wall Drive and Defence', 'Match Visualization and Reset'],
    19: ['Low Serve Floor Targets', 'Match Visualization and Reset'],
    20: ['High-Intensity Shadow Intervals', 'Match Visualization and Reset'],
  },
}

export const homeDrillsForLesson = (
  programName: string,
  programLesson: LessonSeed,
  level: Level,
): string[] => {
  const reviewedProgramAssignments = programHomeDrillAssignments[programName]
  if (reviewedProgramAssignments) {
    const explicitDrills = reviewedProgramAssignments[programLesson.week]
    if (!explicitDrills) {
      throw new Error(
        `Missing reviewed home-practice assignment for ${programName}, week ${programLesson.week}`,
      )
    }
    return [...explicitDrills]
  }

  const context =
    `${programLesson.title} ${programLesson.objective} ${programLesson.drills.join(' ')}`.toLowerCase()
  const selected: string[] = []
  const add = (name: string) => {
    if (!selected.includes(name)) selected.push(name)
  }

  if (/\b(serve|serving|service)\b/.test(context)) add('Low Serve Floor Targets')
  if (/(grip|racket readiness|tap-up)/.test(context)) add('Solo Racket Control Circuit')
  if (/(clear|drop|smash|overhead|rear-court|attack)/.test(context))
    add('Overhead Shadow Technique')
  if (/(drive|block|defen|flat exchange|counter)/.test(context)) add('Wall Drive and Defence')
  if (/(net|lift|forecourt|front-court|lunge)/.test(context)) add('Lunge Balance and Leg Strength')
  if (/(split|react)/.test(context)) add('Reactive Split-Step Cues')
  if (/(split|movement|recovery|corner|rally|direction|rotation|formation)/.test(context)) {
    add(level === 'competitive' ? 'High-Intensity Shadow Intervals' : 'Compact Home Footwork')
  }
  if (/(pressure|match|tactical|decision|plan|assessment|tournament|routine|score)/.test(context)) {
    add('Match Visualization and Reset')
  }

  if (!selected.length) add('Solo Racket Control Circuit')
  add(
    level === 'foundations'
      ? 'Lunge Balance and Leg Strength'
      : level === 'development'
        ? 'Badminton Bodyweight Strength Circuit'
        : 'Shoulder and Core Control',
  )

  return selected.slice(0, 3)
}

export async function seedCoachingLibrary(payload: Payload) {
  payload.logger.info('Seeding coaching programs, skills and drills...')

  const skillIDs = new Map<string, string>()
  for (const skill of skills) {
    const existing = await payload.find({
      collection: 'skills',
      depth: 0,
      limit: 1,
      where: { name: { equals: skill.name } },
    })
    const document = existing.docs[0]
      ? await payload.update({
          collection: 'skills',
          id: existing.docs[0].id,
          depth: 0,
          data: skill,
        })
      : await payload.create({ collection: 'skills', depth: 0, data: skill })
    skillIDs.set(skill.name, document.id)
  }

  const drillIDs = new Map<string, string>()
  for (const drill of drills) {
    const skill = skillIDs.get(drill.skill)
    if (!skill) throw new Error(`Missing skill for drill: ${drill.name}`)
    const { skill: _skillName, ...data } = drill
    const existing = await payload.find({
      collection: 'drills',
      depth: 0,
      limit: 1,
      where: { name: { equals: drill.name } },
    })
    const sequence = buildHomePracticeSequence(drill.name, data.instructions)
    const drillData = {
      ...data,
      skill,
      practiceSetting: data.practiceSetting || 'court',
      ...(sequence
        ? {
            practiceSteps: sequence.steps,
            stepIllustrationColumns: sequence.columns,
            stepIllustrationRows: sequence.rows,
            stepIllustrationURL: sequence.sheetURL,
          }
        : {}),
    }
    const document = existing.docs[0]
      ? await payload.update({
          collection: 'drills',
          id: existing.docs[0].id,
          depth: 0,
          data: drillData,
        })
      : await payload.create({ collection: 'drills', depth: 0, data: drillData })
    drillIDs.set(drill.name, document.id)
  }

  const practiceLibraryIDs = new Map<string, string>()
  for (const program of programs) {
    for (const phase of program.phases) {
      for (const programLesson of phase.lessons) {
        const practiceName = homePracticeName(program.name, programLesson.week, programLesson.title)
        const homeDrillNames = homeDrillsForLesson(program.name, programLesson, program.level)
        const practiceDrills = homeDrillNames.map((drillName) => {
          const drillID = drillIDs.get(drillName)
          if (!drillID)
            throw new Error(`Missing drill for independent practice ${practiceName}: ${drillName}`)
          return drillID
        })
        const durationMinutes = homeDrillNames.reduce((total, drillName) => {
          const drill = drills.find((item) => item.name === drillName)
          return total + (drill?.durationMinutes || 0)
        }, 0)
        const practiceData = {
          name: practiceName,
          level: program.level,
          instructions: programHomePracticeInstructions(
            programLesson.objective,
            programLesson.independentPractice,
          ),
          drills: practiceDrills,
          durationMinutes,
          successCriteria: programHomePracticeSuccessCriteria,
        }
        const existing = await payload.find({
          collection: 'practice-library',
          depth: 0,
          limit: 1,
          where: { name: { equals: practiceName } },
        })
        const document = existing.docs[0]
          ? await payload.update({
              collection: 'practice-library',
              id: existing.docs[0].id,
              depth: 0,
              data: practiceData,
            })
          : await payload.create({ collection: 'practice-library', depth: 0, data: practiceData })
        practiceLibraryIDs.set(`${program.name}:${programLesson.week}`, document.id)
      }
    }
  }

  for (const program of programs) {
    const phases = program.phases.map((phase) => ({
      ...phase,
      lessons: phase.lessons.map((programLesson) => {
        const { independentPractice: homePracticeInstructions, ...lessonData } = programLesson
        const practiceID = practiceLibraryIDs.get(`${program.name}:${programLesson.week}`)
        if (!practiceID)
          throw new Error(
            `Missing independent practice for ${program.name}, week ${programLesson.week}`,
          )
        const lessonSkillIDs = Array.from(
          new Set(
            programLesson.drills.map((drillName) => {
              const drill = drills.find((item) => item.name === drillName)
              const skillID = drill ? skillIDs.get(drill.skill) : null
              if (!skillID)
                throw new Error(
                  `Missing skill for ${program.name}, week ${programLesson.week}: ${drillName}`,
                )
              return skillID
            }),
          ),
        )
        return {
          ...lessonData,
          homePracticeInstructions,
          homeDrills: homeDrillsForLesson(program.name, programLesson, program.level).map(
            (drillName) => {
              const drillID = drillIDs.get(drillName)
              if (!drillID)
                throw new Error(
                  `Missing home drill for ${program.name}, week ${programLesson.week}: ${drillName}`,
                )
              return drillID
            },
          ),
          independentPractice: practiceID,
          skills: lessonSkillIDs,
          drills: programLesson.drills.map((drillName) => {
            const drillID = drillIDs.get(drillName)
            if (!drillID)
              throw new Error(
                `Missing drill for ${program.name}, week ${programLesson.week}: ${drillName}`,
              )
            return drillID
          }),
        }
      }),
    }))
    const programData = { ...program, phases }
    const existing = await payload.find({
      collection: 'programs',
      depth: 0,
      limit: 1,
      where: { name: { equals: program.name } },
    })
    if (existing.docs[0])
      await payload.update({
        collection: 'programs',
        id: existing.docs[0].id,
        depth: 0,
        data: programData,
      })
    else await payload.create({ collection: 'programs', depth: 0, data: programData })
  }

  const studentProfiles = await payload.find({
    collection: 'student-profiles',
    depth: 0,
    limit: 1000,
  })
  for (const profile of studentProfiles.docs) {
    if (!profile.program) continue
    await payload.update({
      collection: 'student-profiles',
      id: profile.id,
      depth: 0,
      data: { currentProgramWeek: profile.currentProgramWeek || 1 },
    })
  }

  const independentPractices = await payload.find({
    collection: 'independent-practices',
    depth: 0,
    limit: 1,
  })

  const lessons = programs.reduce(
    (total, program) =>
      total + program.phases.reduce((phaseTotal, phase) => phaseTotal + phase.lessons.length, 0),
    0,
  )
  payload.logger.info(
    `Coaching library ready: ${programs.length} programs, ${lessons} lessons, ${skills.length} skills, ${drills.length} drills, ${practiceLibraryIDs.size} practice templates, ${independentPractices.totalDocs} student practices.`,
  )
  return {
    programs: programs.length,
    lessons,
    skills: skills.length,
    drills: drills.length,
    practiceTemplates: practiceLibraryIDs.size,
    independentPractices: independentPractices.totalDocs,
  }
}
