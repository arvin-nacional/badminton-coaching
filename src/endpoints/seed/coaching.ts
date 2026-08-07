import type { Payload } from 'payload'

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
type LessonSeed = {
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
    assessment: '10 min — Raise body temperature, mobilise ankles, hips and shoulders, then complete familiar racket contacts without corrective coaching so the starting level is observable.',
    technical: '10 min — Use light court movement, shoulder mobility and relaxed racket contacts. Gradually increase range while keeping grip changes and preparation clean.',
    movement: '10 min — Raise body temperature, mobilise ankles and hips, then rehearse split steps, directional pushes and controlled lunges at increasing speed.',
    tactical: '10 min — Combine dynamic movement with cooperative rallying. Call the intended target before each shot to connect preparation with decision-making.',
    'match-play': '10 min — Complete a match-ready dynamic warm-up followed by cooperative length, net and flat exchanges. Finish with serve and return rehearsal.',
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
      matchPlay: lessonType === 'assessment'
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
    description: 'Build dependable movement, grips, preparation and core strokes before adding speed and pressure.',
    durationWeeks: 12,
    phases: [
      {
        name: 'Movement and racket basics', description: 'Athletic posture, grips, split step and safe court movement.', order: 1, startWeek: 1, endWeek: 3,
        lessons: [
          lesson(1, 'Starting profile and court orientation', 'assessment', 'Establish a safe movement and racket-control baseline.', ['Grip Change Tap-Ups', 'Four-Corner Shadow Rhythm'], 'Complete 3 x 20 tap-ups and rehearse each corner slowly.', 'Uses a suitable grip and reaches four corners without losing balance.'),
          lesson(2, 'Grip changes and ready position', 'technical', 'Change grip with the fingers while keeping the racket available for the next shot.', ['Grip Change Tap-Ups', 'Low Serve Gate'], 'Complete 50 alternating contacts and 20 low serves.', 'Changes grip without looking at the handle in 8 of 10 attempts.'),
          lesson(3, 'Split, move and recover', 'movement', 'Introduce a repeatable split-step and recovery rhythm.', ['Four-Corner Shadow Rhythm', 'Lunge, Net and Recover'], 'Perform four controlled 30-second shadow rounds.', 'Returns to a balanced base after 8 of 10 movements.'),
        ],
      },
      {
        name: 'Core stroke patterns', description: 'Serve, lift, clear, net shot and recovery to base.', order: 2, startWeek: 4, endWeek: 7,
        lessons: [
          lesson(4, 'Overhead clear foundations', 'technical', 'Create safe height and length using early preparation and overhead contact.', ['Clear to Targets', 'Grip Change Tap-Ups'], 'Shadow 30 overhead actions, then record 20 target attempts.', 'Places 8 of 10 clears beyond the doubles service line.'),
          lesson(5, 'Clear and rear-court recovery', 'movement', 'Link the overhead clear to an immediate balanced recovery.', ['Rear-Court Clear and Recovery', 'Clear to Targets'], 'Complete 3 x 8 clear-and-recover shadow repetitions.', 'Recovers before the feeder begins the next action in 8 of 10 feeds.'),
          lesson(6, 'Reliable service starts', 'technical', 'Develop a repeatable low serve and understand legal service preparation.', ['Low Serve Gate', 'Twenty-Shot Cooperative Rally'], 'Serve 5 sets of 10 to alternating targets.', 'Achieves at least 80% legal serves with controlled height.'),
          lesson(7, 'Lift for time and length', 'technical', 'Use the lift to move the opponent back and regain court position.', ['Lift for Length', 'Lunge, Net and Recover'], 'Complete 30 shadow lunges and 30 controlled lift actions.', 'Reaches the rear target and recovers on 8 of 10 feeds.'),
        ],
      },
      {
        name: 'Controlled rallies', description: 'Link movement and strokes with repeatable placement.', order: 3, startWeek: 8, endWeek: 10,
        lessons: [
          lesson(8, 'Forecourt control', 'technical', 'Approach, play and recover from the forecourt with a stable lunge.', ['Lunge, Net and Recover', 'Lift for Length'], 'Alternate 20 shadow net shots and lifts from each side.', 'Selects net or lift appropriately and finishes balanced in 8 of 10 feeds.'),
          lesson(9, 'Serve, return and first recovery', 'tactical', 'Start the rally with a clear serve, return and recovery intention.', ['Low Serve Gate', 'Lift for Length'], 'Practise 20 serves and visualise the likely return after each one.', 'Completes the first three actions without an unforced error in 7 of 10 rallies.'),
          lesson(10, 'Build a controlled rally', 'match-play', 'Sustain a rally using safe height, length and recovery.', ['Twenty-Shot Cooperative Rally', 'Rear-Court Clear and Recovery'], 'Record the longest rally from three 10-minute practices.', 'Completes three rallies of at least 20 shots with functional recovery.'),
        ],
      },
      {
        name: 'Ready for development', description: 'Apply the foundations in conditioned games and assessment.', order: 4, startWeek: 11, endWeek: 12,
        lessons: [
          lesson(11, 'Connect the full court', 'match-play', 'Move between forecourt and rear court while selecting a safe response.', ['Four-Corner Shadow Rhythm', 'Rear-Court Clear and Recovery', 'Lunge, Net and Recover'], 'Complete a six-corner shadow sequence twice and note the least stable corner.', 'Maintains balance and returns to a suitable base in 8 of 10 rallies.'),
          lesson(12, 'Foundations progress assessment', 'assessment', 'Demonstrate the core movement, serve, clear, lift and rally standards.', ['Low Serve Gate', 'Clear to Targets', 'Twenty-Shot Cooperative Rally'], 'Review personal targets and complete one short practice for the weakest area.', 'Meets the completion target for at least three drills and identifies the next priority.'),
        ],
      },
    ],
  },
  {
    name: 'Player Development',
    level: 'development',
    description: 'Improve movement efficiency, shot quality, consistency and tactical choices in realistic rallies.',
    durationWeeks: 16,
    phases: [
      {
        name: 'Movement efficiency', description: 'Earlier preparation, balanced recovery and efficient court coverage.', order: 1, startWeek: 1, endWeek: 4,
        lessons: [
          lesson(1, 'Development movement baseline', 'assessment', 'Measure split-step timing, corner efficiency and recovery quality.', ['Random Six-Corner Feeding', 'Twenty-Shot Cooperative Rally'], 'Film one minute of shadow movement and identify one repeated issue.', 'Completes 10 of 12 random feeds with a balanced recovery.'),
          lesson(2, 'Reactive split-step timing', 'movement', 'Time the split from opponent contact rather than guessing direction.', ['Random Six-Corner Feeding', 'Four-Corner Shadow Rhythm'], 'Perform 5 x 30-second reactive split-step rounds with a partner cue.', 'Responds correctly without pre-moving on 10 of 12 feeds.'),
          lesson(3, 'Efficient rear-court recovery', 'movement', 'Use an economical turn, landing and recovery under increasing feed speed.', ['Rear-Court Clear and Recovery', 'Clear to Targets'], 'Complete 3 x 10 shadow recoveries from both rear corners.', 'Maintains clear length and recovers before 8 of 10 follow-up feeds.'),
          lesson(4, 'Forecourt transition and balance', 'movement', 'Move forward quickly, control the lunge and recover for the next direction.', ['Lunge, Net and Recover', 'Net-Lift-Kill Progression'], 'Complete 20 lunges per side with a two-second balance hold.', 'Handles both forecourt corners with correct recovery in 8 of 10 feeds.'),
        ],
      },
      {
        name: 'Building pressure', description: 'Use length, pace and the net to create weak replies.', order: 2, startWeek: 5, endWeek: 8,
        lessons: [
          lesson(5, 'Clear and drop from one preparation', 'technical', 'Disguise clear and drop while preserving balance and recovery.', ['Clear-Drop Decision Rally', 'Clear to Targets'], 'Shadow alternating clears and drops in 5 sets of 8.', 'Uses the same preparation and reaches the intended zone in 8 of 10 shots.'),
          lesson(6, 'Smash and second attack', 'technical', 'Carry attacking pressure from the smash into the next shot.', ['Three-Shot Attack Pattern', 'Rear-Court Clear and Recovery'], 'Perform 4 x 6 controlled smash-and-recover shadows.', 'Completes 7 of 10 three-shot attacks without losing balance.'),
          lesson(7, 'Flat exchanges and front-court follow-up', 'technical', 'Control drives, protect the body and recognise the chance to move forward.', ['Drive Channel Exchange', 'Low Serve Gate'], 'Complete three cooperative sets of 30 compact drives.', 'Sustains 20 drives and responds correctly to 4 of 5 blocks.'),
          lesson(8, 'Mid-program technical review', 'assessment', 'Check whether improved technique remains stable in a rally.', ['Random Six-Corner Feeding', 'Three-Shot Attack Pattern', 'Drive Channel Exchange'], 'Review coach feedback and repeat the lowest-scoring drill once.', 'Improves at least one baseline measure without reducing movement quality.'),
        ],
      },
      {
        name: 'Rally construction', description: 'Recognise space and select shots with purpose.', order: 3, startWeek: 9, endWeek: 12,
        lessons: [
          lesson(9, 'Create space through the forecourt', 'tactical', 'Use net pressure and the lift to change opponent position.', ['Net-Lift-Kill Progression', 'Lunge, Net and Recover'], 'Write one cue for recognising when to stay at the net and when to lift.', 'Creates a clear attacking chance in 6 of 10 rallies.'),
          lesson(10, 'Singles clear-drop construction', 'tactical', 'Move the opponent deep before using the forecourt with purpose.', ['Clear-Drop Decision Rally', 'Twenty-Shot Cooperative Rally'], 'Play three half-court games where every attack must follow a deep shot.', 'Makes the correct clear-or-drop choice in 8 of 10 reviewed rallies.'),
          lesson(11, 'Defend, neutralise and counter', 'tactical', 'Select a block, drive or lift according to balance and available space.', ['Defence Choice Under Pressure', 'Drive Channel Exchange'], 'Shadow 10 blocks, 10 drives and 10 lifts from a defensive base.', 'Chooses an effective defensive response on 12 of 15 attacks.'),
          lesson(12, 'Doubles formation and rotation', 'tactical', 'Transition between front-back and side-side formations as a pair.', ['Attack-Defence Rotation', 'Drive Channel Exchange'], 'Walk through five attack-to-defence transitions with a partner.', 'Uses the correct formation after 8 of 10 transitions.'),
        ],
      },
      {
        name: 'Match transfer', description: 'Apply skills consistently in games, scoring and assessment.', order: 4, startWeek: 13, endWeek: 16,
        lessons: [
          lesson(13, 'Consistency under direction change', 'match-play', 'Maintain shot quality while moving the shuttle between front and rear court.', ['Twenty-Shot Cooperative Rally', 'Clear-Drop Decision Rally'], 'Complete three target rallies and record errors by type.', 'Sustains a 20-shot rally while including four controlled changes of direction.'),
          lesson(14, 'Pressure score decisions', 'match-play', 'Use high-percentage patterns and a reset routine at critical scores.', ['Pressure Score: 18-All', 'Tournament Interval Simulation'], 'Write a serve plan and return plan for 18-all.', 'Follows the stated plan in 8 of 10 pressure rallies.'),
          lesson(15, 'Personal match plan', 'match-play', 'Connect one reliable rally pattern to one attacking pattern.', ['Clear-Drop Decision Rally', 'Three-Shot Attack Pattern', 'Pressure Score: 18-All'], 'Write a three-point match plan and rehearse the opening pattern.', 'Starts at least 7 of 10 rallies with the intended tactical pattern.'),
          lesson(16, 'Development progress assessment', 'assessment', 'Demonstrate technical, movement and tactical progress in match conditions.', ['Random Six-Corner Feeding', 'Net-Lift-Kill Progression', 'Pressure Score: 18-All'], 'Review the full program and identify one independent-practice priority.', 'Meets two drill targets under pressure and explains the next training priority.'),
        ],
      },
    ],
  },
  {
    name: 'Competitive Performance',
    level: 'competitive',
    description: 'Develop an individual competition plan, pressure-ready skills and repeatable tournament routines.',
    durationWeeks: 20,
    phases: [
      {
        name: 'Performance profile', description: 'Assess strengths, limiting factors and match identity.', order: 1, startWeek: 1, endWeek: 5,
        lessons: [
          lesson(1, 'Competition performance profile', 'assessment', 'Establish technical, movement, tactical and pressure baselines.', ['Random Six-Corner Feeding', 'Pressure Score: 18-All', 'Repeat Movement Quality Intervals'], 'Review one recent match and record three recurring rally outcomes.', 'Produces a clear strength, limiting factor and first training priority.'),
          lesson(2, 'Movement quality under load', 'movement', 'Preserve timing, posture and recovery through repeated efforts.', ['Repeat Movement Quality Intervals', 'Random Six-Corner Feeding'], 'Complete 4 x 30-second quality movement intervals.', 'Maintains a 4/5 movement-quality rating through the final interval.'),
          lesson(3, 'Rear-court recovery at match pace', 'movement', 'Recover according to shot quality while feeds become less predictable.', ['Rear-Court Clear and Recovery', 'Random Six-Corner Feeding'], 'Film 20 rear-court recoveries and review the first recovery step.', 'Reaches an effective base before 10 of 12 follow-up shots.'),
          lesson(4, 'Serve and return pressure', 'tactical', 'Use placement and the third shot to gain the first advantage.', ['Low Serve Gate', 'Drive Channel Exchange', 'Pressure Score: 18-All'], 'Complete 30 serves to match-specific targets and note the expected return.', 'Wins or neutralises the first three shots in 7 of 10 rallies.'),
          lesson(5, 'Confirm the performance plan', 'assessment', 'Translate baseline evidence into two measurable competition priorities.', ['Tournament Interval Simulation', 'Twenty-Shot Cooperative Rally'], 'Write two process goals and one result-neutral tournament cue.', 'Can state, demonstrate and measure both selected priorities.'),
        ],
      },
      {
        name: 'Weapon development', description: 'Sharpen high-value patterns for singles or doubles.', order: 2, startWeek: 6, endWeek: 10,
        lessons: [
          lesson(6, 'Primary attacking pattern', 'technical', 'Increase the repeatability of the player’s highest-value attack.', ['Three-Shot Attack Pattern', 'Clear-Drop Decision Rally'], 'Rehearse the first three actions of the attack for 30 quality repetitions.', 'Completes 8 of 10 attack patterns with balance and intended placement.'),
          lesson(7, 'Second-shot continuation', 'technical', 'Maintain pressure when the first attack does not finish the rally.', ['Three-Shot Attack Pattern', 'Drive Channel Exchange'], 'Complete 4 x 8 compact follow-up actions after a shadow smash.', 'Keeps the initiative through three shots in 7 of 10 sequences.'),
          lesson(8, 'Front-court creation and finish', 'tactical', 'Use tight net pressure to force a lift or loose reply.', ['Net-Lift-Kill Progression', 'Lunge, Net and Recover'], 'Practise 20 net approaches with the racket held above net height.', 'Creates or finishes 7 of 10 forecourt attacking opportunities.'),
          lesson(9, 'Counterattack from defence', 'tactical', 'Turn a stable defensive contact into neutral or attacking position.', ['Defence Choice Under Pressure', 'Drive Channel Exchange'], 'Complete three sets of 12 compact defensive contacts.', 'Neutralises or counterattacks 12 of 15 quality attacks.'),
          lesson(10, 'Weapon test in conditioned games', 'assessment', 'Apply the selected weapon without forcing it from poor situations.', ['Pressure Score: 18-All', 'Three-Shot Attack Pattern', 'Net-Lift-Kill Progression'], 'Review video from one conditioned game and tag each attempted pattern.', 'Creates the intended pattern in at least 6 of 10 suitable rallies.'),
        ],
      },
      {
        name: 'Pressure training', description: 'Execute decisions and techniques under score and time pressure.', order: 3, startWeek: 11, endWeek: 15,
        lessons: [
          lesson(11, 'Mid-cycle match review', 'assessment', 'Identify which improvements are transferring into scored games.', ['Tournament Interval Simulation', 'Pressure Score: 18-All'], 'Write what improved, what is limiting performance and what comes next.', 'Supports the next priority with evidence from at least three rallies.'),
          lesson(12, 'Critical-score execution', 'match-play', 'Commit to a clear plan and appropriate risk at deuce scores.', ['Pressure Score: 18-All', 'Low Serve Gate'], 'Rehearse a breathing cue and first-three-shot plan before 20 serves.', 'Follows the plan in 8 of 10 critical-score rallies.'),
          lesson(13, 'Between-rally reset', 'match-play', 'Use a short physical and mental reset after both wins and errors.', ['Tournament Interval Simulation', 'Pressure Score: 18-All'], 'Practise the reset routine between 20 visualised rallies.', 'Completes the routine independently before 9 of 10 rallies.'),
          lesson(14, 'Physical quality under fatigue', 'movement', 'Protect movement mechanics while fatigue and decision demands increase.', ['Repeat Movement Quality Intervals', 'Random Six-Corner Feeding'], 'Complete a short interval set and record when movement quality changes.', 'Maintains technical movement standards through the final interval.'),
          lesson(15, 'Defence under scoreboard pressure', 'match-play', 'Make stable defensive choices when the opponent attacks at a critical score.', ['Defence Choice Under Pressure', 'Pressure Score: 18-All'], 'Rehearse three defensive intentions: neutralise, counter and reset.', 'Makes an effective choice in 12 of 15 pressure attacks.'),
        ],
      },
      {
        name: 'Competition readiness', description: 'Practise tournament routines, review and performance planning.', order: 4, startWeek: 16, endWeek: 20,
        lessons: [
          lesson(16, 'Tournament simulation', 'match-play', 'Rehearse warm-up, intervals, coaching cues and post-match review.', ['Tournament Interval Simulation', 'Pressure Score: 18-All', 'Repeat Movement Quality Intervals'], 'Prepare the exact equipment, warm-up and cue card planned for competition.', 'Completes the simulation using the planned routine without coach reminders.'),
          lesson(17, 'Primary game plan', 'tactical', 'Apply the preferred game plan against a suitable opponent style.', ['Clear-Drop Decision Rally', 'Three-Shot Attack Pattern', 'Pressure Score: 18-All'], 'Write the opening, adjustment and closing pattern for game plan A.', 'Recognises and uses the planned pattern in 7 of 10 suitable rallies.'),
          lesson(18, 'Alternative game plan', 'tactical', 'Adjust when the primary pattern is being neutralised.', ['Defence Choice Under Pressure', 'Attack-Defence Rotation', 'Net-Lift-Kill Progression'], 'Write two match signals that should trigger the alternative plan.', 'Changes plan for a clear reason and improves rally control in conditioned play.'),
          lesson(19, 'Taper and confidence rehearsal', 'match-play', 'Reduce volume while preserving sharpness, confidence and routine quality.', ['Low Serve Gate', 'Three-Shot Attack Pattern', 'Tournament Interval Simulation'], 'Complete a short high-quality rehearsal and stop before technical quality drops.', 'Meets key targets with low volume and finishes physically fresh.'),
          lesson(20, 'Competition readiness assessment', 'assessment', 'Confirm progress, readiness, next priorities and independent practice.', ['Random Six-Corner Feeding', 'Pressure Score: 18-All', 'Tournament Interval Simulation'], 'Complete the written self-review before the final coach conversation.', 'Explains what improved, the current limiter, the next focus and readiness to compete.'),
        ],
      },
    ],
  },
]

const skills: Array<{ name: string; category: SkillCategory; description: string }> = [
  { name: 'Grip changes and racket readiness', category: 'stroke-technique', description: 'Change efficiently between forehand, backhand and thumb grips while keeping the racket available for the next shot.' },
  { name: 'Forehand overhead clear', category: 'stroke-technique', description: 'Create length with early preparation, overhead contact and a relaxed throwing action.' },
  { name: 'Backhand short serve', category: 'stroke-technique', description: 'Deliver a repeatable low serve that crosses tightly and lands near the service line.' },
  { name: 'Forehand high serve', category: 'stroke-technique', description: 'Serve high and deep with balance, control and consistent placement.' },
  { name: 'Net shot', category: 'stroke-technique', description: 'Play a soft, controlled reply that travels close to the tape.' },
  { name: 'Underarm lift', category: 'stroke-technique', description: 'Lift with sufficient height and length from the forecourt under control.' },
  { name: 'Drop shot', category: 'stroke-technique', description: 'Use overhead preparation to play a controlled shot into the forecourt.' },
  { name: 'Smash and follow-up', category: 'stroke-technique', description: 'Attack steeply, land balanced and prepare immediately for the next ball.' },
  { name: 'Drive and block', category: 'stroke-technique', description: 'Exchange flat shots with compact preparation and stable racket control.' },
  { name: 'Split step timing', category: 'footwork', description: 'Time a small directional loading action as the opponent strikes.' },
  { name: 'Rear-court recovery', category: 'footwork', description: 'Recover from an overhead stroke to an effective base before the next reply.' },
  { name: 'Forecourt lunge and recovery', category: 'footwork', description: 'Move into the forecourt with a stable lunge and push back efficiently.' },
  { name: 'Six-corner movement', category: 'footwork', description: 'Move efficiently to all court corners while maintaining posture and rhythm.' },
  { name: 'Rally length and error control', category: 'consistency', description: 'Sustain purposeful rallies while reducing unforced errors.' },
  { name: 'Serve and return consistency', category: 'consistency', description: 'Start rallies reliably with accurate serves and controlled returns.' },
  { name: 'Change of direction control', category: 'consistency', description: 'Redirect the shuttle without losing balance, height or accuracy.' },
  { name: 'Creating space', category: 'tactical-decisions', description: 'Move the opponent before attacking the available space.' },
  { name: 'Defending under pressure', category: 'tactical-decisions', description: 'Choose blocks, lifts and drives that neutralise an opponent’s attack.' },
  { name: 'Singles rally construction', category: 'tactical-decisions', description: 'Use length, movement and changes of pace to build a scoring opportunity.' },
  { name: 'Doubles rotation', category: 'tactical-decisions', description: 'Move between attacking and defensive formations with clear partner responsibility.' },
  { name: 'Score management', category: 'match-performance', description: 'Use routines and sensible risk choices at different stages of a game.' },
  { name: 'Between-rally routine', category: 'match-performance', description: 'Reset physically and mentally, then commit to a clear next-rally intention.' },
  { name: 'Movement endurance', category: 'physical-readiness', description: 'Maintain quality court movement through repeated efforts.' },
  { name: 'Landing and lunge stability', category: 'physical-readiness', description: 'Control deceleration, landing and lunging positions safely.' },
  { name: 'Independent practice quality', category: 'training-habits', description: 'Practise with a measurable target, deliberate repetitions and honest review.' },
  { name: 'Session preparation and reflection', category: 'training-habits', description: 'Arrive ready, record learning and act on coach feedback.' },
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
  successTarget: string
  easierVariation: string
  harderProgression: string
  completionRequirement: string
}

const drills: DrillSeed[] = [
  { name: 'Grip Change Tap-Ups', skill: 'Grip changes and racket readiness', level: 'foundations', eventType: 'general', equipment: 'Racket and shuttle', numberOfPlayers: 1, durationMinutes: 8, instructions: 'Alternate forehand and backhand tap-ups while changing grip with the fingers.', coachingPoints: 'Relax the hand, rotate with the fingers and keep the racket in front.', commonMistakes: 'Panhandle grip, tight fist and large arm swings.', difficulty: 'easy', successTarget: 'Three sets of 20 controlled contacts without losing the correct grip.', easierVariation: 'Catch the shuttle after each contact and reset the grip.', harderProgression: 'Move while alternating low and high contacts.', completionRequirement: 'Changes grip automatically while maintaining control.' },
  { name: 'Clear to Targets', skill: 'Forehand overhead clear', level: 'foundations', eventType: 'general', equipment: 'Rackets, shuttles and two rear-court targets', numberOfPlayers: 2, durationMinutes: 12, instructions: 'A feeder sends comfortable shuttles to the rear court. The player clears toward alternating deep targets.', coachingPoints: 'Turn side-on, prepare early, contact overhead and finish balanced.', commonMistakes: 'Contact behind the body, excessive force and falling sideways.', difficulty: 'moderate', successTarget: '8 of 10 clears land beyond the doubles service line.', easierVariation: 'Use hand feeds and one large central target.', harderProgression: 'Randomise feeds between the two rear corners.', completionRequirement: 'Maintains length and balance in a cooperative rally.' },
  { name: 'Rear-Court Clear and Recovery', skill: 'Rear-court recovery', level: 'foundations', eventType: 'general', equipment: 'Rackets, shuttles and a base marker', numberOfPlayers: 2, durationMinutes: 12, instructions: 'Move from base to a fed rear-court shuttle, clear, land balanced and recover to the marker immediately.', coachingPoints: 'Split as the feeder strikes, turn early, contact overhead, land balanced and recover immediately.', commonMistakes: 'Waiting flat-footed, crossing under the shuttle and watching the shot before recovering.', difficulty: 'moderate', successTarget: '8 successful clear-and-recovery repetitions out of 10.', easierVariation: 'Shadow the pattern without a shuttle.', harderProgression: 'Use a random clear or drop feed after the recovery.', completionRequirement: 'Applies the correct recovery in a conditioned rally.' },
  { name: 'Four-Corner Shadow Rhythm', skill: 'Six-corner movement', level: 'foundations', eventType: 'general', equipment: 'Four court markers', numberOfPlayers: 1, durationMinutes: 10, instructions: 'Move from base to four called corners, shadow the appropriate stroke and recover with steady rhythm.', coachingPoints: 'Stay tall, use a split step, lead with the correct leg and return under control.', commonMistakes: 'Rushing, clicking heels together and standing upright during direction changes.', difficulty: 'easy', successTarget: 'Complete 4 rounds of 45 seconds with correct movement shape.', easierVariation: 'Walk each pattern before increasing speed.', harderProgression: 'Use six corners with unpredictable calls.', completionRequirement: 'Maintains balance and a consistent base throughout the sequence.' },
  { name: 'Lunge, Net and Recover', skill: 'Forecourt lunge and recovery', level: 'foundations', eventType: 'general', equipment: 'Rackets, shuttles and a base marker', numberOfPlayers: 2, durationMinutes: 10, instructions: 'The feeder sends to one forecourt corner. Play a net shot, stabilise the lunge and push back to base.', coachingPoints: 'Racket leads, heel lands first, knee tracks over toes and the front leg pushes recovery.', commonMistakes: 'Reaching with the trunk, collapsing the knee and turning away from the shuttle.', difficulty: 'moderate', successTarget: '8 of 10 repetitions finish balanced back at base.', easierVariation: 'Shadow the lunge with a suspended shuttle.', harderProgression: 'Randomise between both forecourt corners.', completionRequirement: 'Recovers in time for a follow-up lift or net feed.' },
  { name: 'Low Serve Gate', skill: 'Backhand short serve', level: 'foundations', eventType: 'doubles', equipment: 'Racket, 20 shuttles and a tape or gate above the net', numberOfPlayers: 1, durationMinutes: 10, instructions: 'Serve through the gate so the shuttle crosses low and lands inside a marked front service target.', coachingPoints: 'Stable setup, relaxed thumb grip, small push and consistent contact point.', commonMistakes: 'Large backswing, slicing excessively and changing the starting position.', difficulty: 'easy', successTarget: '16 of 20 legal serves land in the target area.', easierVariation: 'Increase the target size and net clearance.', harderProgression: 'Alternate wide, body and T targets under a time limit.', completionRequirement: 'Starts a conditioned service game with 80% target accuracy.' },
  { name: 'Lift for Length', skill: 'Underarm lift', level: 'foundations', eventType: 'general', equipment: 'Rackets, shuttles and rear-court targets', numberOfPlayers: 2, durationMinutes: 10, instructions: 'Feed to the forecourt and lift high toward a marked rear-court target before recovering.', coachingPoints: 'Approach with racket prepared, contact in front and use a smooth accelerating action.', commonMistakes: 'Scooping from below, hitting too flat and remaining at the net.', difficulty: 'easy', successTarget: '8 of 10 lifts reach the rear target with enough height.', easierVariation: 'Feed to the racket side only.', harderProgression: 'Randomise forehand and backhand forecourt feeds.', completionRequirement: 'Uses the lift to reset a rally and recovers to base.' },
  { name: 'Twenty-Shot Cooperative Rally', skill: 'Rally length and error control', level: 'foundations', eventType: 'general', equipment: 'Rackets and shuttle', numberOfPlayers: 2, durationMinutes: 12, instructions: 'Rally cooperatively using clears and lifts, counting consecutive legal shots.', coachingPoints: 'Use safe height, recover after every shot and choose control before speed.', commonMistakes: 'Trying to win the rally, standing still and aiming too close to lines.', difficulty: 'moderate', successTarget: 'Complete three rallies of at least 20 shots.', easierVariation: 'Use half court and allow catches between sequences.', harderProgression: 'Add one controlled drop shot every five contacts.', completionRequirement: 'Sustains a controlled rally while keeping a functional base.' },
  { name: 'Random Six-Corner Feeding', skill: 'Split step timing', level: 'development', eventType: 'singles', equipment: 'Racket and multi-shuttle basket', numberOfPlayers: 2, durationMinutes: 15, instructions: 'The feeder sends randomly to six areas. The player splits on contact, moves, returns safely and recovers.', coachingPoints: 'Watch the feeder, time the split, take an efficient first step and regain base according to the reply.', commonMistakes: 'Splitting too early, guessing and using the same base after every shot.', difficulty: 'challenging', successTarget: 'Complete 3 sets of 12 feeds with at least 10 balanced recoveries.', easierVariation: 'Limit feeds to four known corners.', harderProgression: 'Add deception and require specified target returns.', completionRequirement: 'Responds to random feeds without pre-empting movement.' },
  { name: 'Clear-Drop Decision Rally', skill: 'Singles rally construction', level: 'development', eventType: 'singles', equipment: 'Rackets and shuttle', numberOfPlayers: 2, durationMinutes: 15, instructions: 'Play half-court singles. Use clears to create space and select a drop only when the opponent is displaced.', coachingPoints: 'Read opponent position, show the same preparation and recover according to shot quality.', commonMistakes: 'Dropping from poor balance, forcing the attack and failing to cover the reply.', difficulty: 'moderate', successTarget: 'Make the correct clear-or-drop decision in 8 of 10 reviewed rallies.', easierVariation: 'Coach calls the shot after the player prepares.', harderProgression: 'Open the full court and allow attacking clears.', completionRequirement: 'Explains and demonstrates why the selected shot created pressure.' },
  { name: 'Net-Lift-Kill Progression', skill: 'Creating space', level: 'development', eventType: 'singles', equipment: 'Rackets and shuttles', numberOfPlayers: 2, durationMinutes: 15, instructions: 'Begin with a net exchange. Lift when under pressure; attack a loose net reply and recover for the next ball.', coachingPoints: 'Keep tight shots at the net, recognise loss of balance and change from neutral to attack quickly.', commonMistakes: 'Forcing a net shot too late, lifting flat and admiring the attack.', difficulty: 'challenging', successTarget: 'Create and finish 6 clear attacking opportunities in 10 rallies.', easierVariation: 'Use predictable feeds with no live scoring.', harderProgression: 'Play the rally out on the full singles court.', completionRequirement: 'Recognises when to persist at the net and when to reset with a lift.' },
  { name: 'Three-Shot Attack Pattern', skill: 'Smash and follow-up', level: 'development', eventType: 'general', equipment: 'Rackets and multi-shuttle basket', numberOfPlayers: 2, durationMinutes: 12, instructions: 'Play smash, follow-up drive or block, then finish into open space from a three-shuttle feed.', coachingPoints: 'Contact in front, land ready, move forward after the smash and keep the second action compact.', commonMistakes: 'Over-hitting, landing with feet stuck and carrying a full swing into the follow-up.', difficulty: 'challenging', successTarget: 'Complete 7 of 10 three-shot patterns without losing balance.', easierVariation: 'Use a controlled half-smash and predictable follow-up.', harderProgression: 'Randomise the defensive reply and play out the rally.', completionRequirement: 'Maintains attack across consecutive shots in a conditioned game.' },
  { name: 'Drive Channel Exchange', skill: 'Drive and block', level: 'development', eventType: 'doubles', equipment: 'Rackets and shuttle', numberOfPlayers: 2, durationMinutes: 12, instructions: 'Exchange flat drives inside a marked channel, then respond to an occasional block by moving forward.', coachingPoints: 'Racket up, compact action, contact in front and recover the racket after every shot.', commonMistakes: 'Large swings, dropping the racket and hitting upward under pressure.', difficulty: 'moderate', successTarget: 'Sustain 20 drives and respond correctly to 4 of 5 blocks.', easierVariation: 'Use a wider channel at cooperative pace.', harderProgression: 'Add a third player and random body drives.', completionRequirement: 'Controls flat exchanges without losing front-court awareness.' },
  { name: 'Attack-Defence Rotation', skill: 'Doubles rotation', level: 'development', eventType: 'doubles', equipment: 'Rackets and shuttle', numberOfPlayers: 4, durationMinutes: 18, instructions: 'Play conditioned doubles: attacking pair starts front-back, defenders side-side; rotate when attack is gained or lost.', coachingPoints: 'Move as a pair, communicate, protect the middle and transition immediately after the quality of the shot changes.', commonMistakes: 'Watching the shuttle, both players covering the same space and rotating from habit instead of shot outcome.', difficulty: 'challenging', successTarget: 'Use the correct formation after 8 of 10 transition moments.', easierVariation: 'Freeze after each transition for a formation check.', harderProgression: 'Play continuous points with bonus scoring for successful rotation.', completionRequirement: 'Maintains partner spacing during live doubles rallies.' },
  { name: 'Defence Choice Under Pressure', skill: 'Defending under pressure', level: 'competitive', eventType: 'doubles', equipment: 'Rackets and multi-shuttle basket', numberOfPlayers: 3, durationMinutes: 15, instructions: 'Two attackers feed or smash at one defender, who chooses a block, drive or lift based on balance and space.', coachingPoints: 'Defend from a stable base, absorb pace, direct away from the front player and recover the racket quickly.', commonMistakes: 'Swinging too hard, blocking cross-court without control and choosing a drive while late.', difficulty: 'challenging', successTarget: 'Make an effective defensive choice on 12 of 15 attacks.', easierVariation: 'Attack at controlled pace into two fixed zones.', harderProgression: 'Add a partner and transition into a live rally.', completionRequirement: 'Neutralises or counterattacks without relying on one defensive response.' },
  { name: 'Pressure Score: 18-All', skill: 'Score management', level: 'competitive', eventType: 'general', equipment: 'Rackets, shuttle and scoreboard', numberOfPlayers: 2, durationMinutes: 18, instructions: 'Play repeated mini-games beginning at 18-all. Before each rally, state the serve/return plan and intended risk level.', coachingPoints: 'Use the between-rally routine, commit to a clear first-three-shot plan and select high-percentage targets.', commonMistakes: 'Rushing after errors, changing tactics without evidence and aiming for lines unnecessarily.', difficulty: 'challenging', successTarget: 'Follow the stated plan in at least 8 of 10 pressure rallies.', easierVariation: 'Start at 15-all with coach prompts between rallies.', harderProgression: 'Add consequences or play best-of-five deuce scenarios.', completionRequirement: 'Makes composed, explainable decisions at critical scores.' },
  { name: 'Tournament Interval Simulation', skill: 'Between-rally routine', level: 'competitive', eventType: 'general', equipment: 'Rackets, shuttle, timer and notes card', numberOfPlayers: 2, durationMinutes: 20, instructions: 'Play timed rally blocks with only the regulation-like interval to breathe, review one cue and prepare for the next rally.', coachingPoints: 'Turn away briefly, control breathing, use one useful cue and establish serve/return readiness.', commonMistakes: 'Replaying the previous error, taking too many instructions and returning without a plan.', difficulty: 'moderate', successTarget: 'Complete the personal reset routine before 9 of 10 rallies.', easierVariation: 'Allow coach-led prompts and a longer reset.', harderProgression: 'Add score pressure, noise and restricted coaching.', completionRequirement: 'Uses the routine independently throughout a full practice game.' },
  { name: 'Repeat Movement Quality Intervals', skill: 'Movement endurance', level: 'competitive', eventType: 'general', equipment: 'Court markers, racket and interval timer', numberOfPlayers: 1, durationMinutes: 16, instructions: 'Complete six-corner movement intervals while preserving split timing, posture and recovery quality.', coachingPoints: 'Move smoothly before adding speed, breathe continuously and stop a repetition when shape breaks down.', commonMistakes: 'Chasing speed, shortening recovery steps and allowing knees to collapse under fatigue.', difficulty: 'challenging', successTarget: 'Complete 6 x 40-second intervals with movement quality rated 4/5 or better.', easierVariation: 'Use four corners and 25-second intervals.', harderProgression: 'Add racket feeds during the final three intervals.', completionRequirement: 'Maintains technical movement standards through the final interval.' },
]

export async function seedCoachingLibrary(payload: Payload) {
  payload.logger.info('Seeding coaching programs, skills and drills...')

  const skillIDs = new Map<string, string>()
  for (const skill of skills) {
    const existing = await payload.find({ collection: 'skills', depth: 0, limit: 1, where: { name: { equals: skill.name } } })
    const document = existing.docs[0]
      ? await payload.update({ collection: 'skills', id: existing.docs[0].id, depth: 0, data: skill })
      : await payload.create({ collection: 'skills', depth: 0, data: skill })
    skillIDs.set(skill.name, document.id)
  }

  const drillIDs = new Map<string, string>()
  for (const drill of drills) {
    const skill = skillIDs.get(drill.skill)
    if (!skill) throw new Error(`Missing skill for drill: ${drill.name}`)
    const { skill: _skillName, ...data } = drill
    const existing = await payload.find({ collection: 'drills', depth: 0, limit: 1, where: { name: { equals: drill.name } } })
    const drillData = { ...data, skill }
    const document = existing.docs[0]
      ? await payload.update({ collection: 'drills', id: existing.docs[0].id, depth: 0, data: drillData })
      : await payload.create({ collection: 'drills', depth: 0, data: drillData })
    drillIDs.set(drill.name, document.id)
  }

  const practiceLibraryIDs = new Map<string, string>()
  for (const program of programs) {
    for (const phase of program.phases) {
      for (const programLesson of phase.lessons) {
        const practiceName = `${program.name} · Week ${programLesson.week}: ${programLesson.title}`
        const practiceDrills = programLesson.drills.map((drillName) => {
          const drillID = drillIDs.get(drillName)
          if (!drillID) throw new Error(`Missing drill for independent practice ${practiceName}: ${drillName}`)
          return drillID
        })
        const practiceData = {
          name: practiceName,
          level: program.level,
          instructions: programLesson.independentPractice,
          drills: practiceDrills,
          durationMinutes: programLesson.durationMinutes,
          successCriteria: programLesson.successCriteria,
        }
        const existing = await payload.find({ collection: 'practice-library', depth: 0, limit: 1, where: { name: { equals: practiceName } } })
        const document = existing.docs[0]
          ? await payload.update({ collection: 'practice-library', id: existing.docs[0].id, depth: 0, data: practiceData })
          : await payload.create({ collection: 'practice-library', depth: 0, data: practiceData })
        practiceLibraryIDs.set(`${program.name}:${programLesson.week}`, document.id)
      }
    }
  }

  for (const program of programs) {
    const phases = program.phases.map((phase) => ({
      ...phase,
      lessons: phase.lessons.map((programLesson) => {
        const practiceID = practiceLibraryIDs.get(`${program.name}:${programLesson.week}`)
        if (!practiceID) throw new Error(`Missing independent practice for ${program.name}, week ${programLesson.week}`)
        const lessonSkillIDs = Array.from(new Set(programLesson.drills.map((drillName) => {
          const drill = drills.find((item) => item.name === drillName)
          const skillID = drill ? skillIDs.get(drill.skill) : null
          if (!skillID) throw new Error(`Missing skill for ${program.name}, week ${programLesson.week}: ${drillName}`)
          return skillID
        })))
        return {
          ...programLesson,
          independentPractice: practiceID,
          skills: lessonSkillIDs,
          drills: programLesson.drills.map((drillName) => {
          const drillID = drillIDs.get(drillName)
          if (!drillID) throw new Error(`Missing drill for ${program.name}, week ${programLesson.week}: ${drillName}`)
          return drillID
        }),
        }
      }),
    }))
    const programData = { ...program, phases }
    const existing = await payload.find({ collection: 'programs', depth: 0, limit: 1, where: { name: { equals: program.name } } })
    if (existing.docs[0]) await payload.update({ collection: 'programs', id: existing.docs[0].id, depth: 0, data: programData })
    else await payload.create({ collection: 'programs', depth: 0, data: programData })
  }

  const studentProfiles = await payload.find({ collection: 'student-profiles', depth: 0, limit: 1000 })
  for (const profile of studentProfiles.docs) {
    if (!profile.program) continue
    await payload.update({
      collection: 'student-profiles',
      id: profile.id,
      depth: 0,
      data: { currentProgramWeek: profile.currentProgramWeek || 1 },
    })
  }

  const independentPractices = await payload.find({ collection: 'independent-practices', depth: 0, limit: 1 })

  const lessons = programs.reduce((total, program) => total + program.phases.reduce((phaseTotal, phase) => phaseTotal + phase.lessons.length, 0), 0)
  payload.logger.info(`Coaching library ready: ${programs.length} programs, ${lessons} lessons, ${skills.length} skills, ${drills.length} drills, ${practiceLibraryIDs.size} practice templates, ${independentPractices.totalDocs} student practices.`)
  return { programs: programs.length, lessons, skills: skills.length, drills: drills.length, practiceTemplates: practiceLibraryIDs.size, independentPractices: independentPractices.totalDocs }
}
