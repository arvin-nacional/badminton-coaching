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

const programs: Array<{
  name: string
  level: Level
  description: string
  durationWeeks: number
  phases: Array<{ name: string; description: string; order: number }>
}> = [
  {
    name: 'Badminton Foundations',
    level: 'foundations',
    description: 'Build dependable movement, grips, preparation and core strokes before adding speed and pressure.',
    durationWeeks: 12,
    phases: [
      { name: 'Movement and racket basics', description: 'Athletic posture, grips, split step and safe court movement.', order: 1 },
      { name: 'Core stroke patterns', description: 'Serve, lift, clear, net shot and recovery to base.', order: 2 },
      { name: 'Controlled rallies', description: 'Link movement and strokes with repeatable placement.', order: 3 },
      { name: 'Ready for development', description: 'Apply the foundations in conditioned games and assessment.', order: 4 },
    ],
  },
  {
    name: 'Player Development',
    level: 'development',
    description: 'Improve movement efficiency, shot quality, consistency and tactical choices in realistic rallies.',
    durationWeeks: 16,
    phases: [
      { name: 'Movement efficiency', description: 'Earlier preparation, balanced recovery and efficient court coverage.', order: 1 },
      { name: 'Building pressure', description: 'Use length, pace and the net to create weak replies.', order: 2 },
      { name: 'Rally construction', description: 'Recognise space and select shots with purpose.', order: 3 },
      { name: 'Match transfer', description: 'Apply skills consistently in games, scoring and assessment.', order: 4 },
    ],
  },
  {
    name: 'Competitive Performance',
    level: 'competitive',
    description: 'Develop an individual competition plan, pressure-ready skills and repeatable tournament routines.',
    durationWeeks: 20,
    phases: [
      { name: 'Performance profile', description: 'Assess strengths, limiting factors and match identity.', order: 1 },
      { name: 'Weapon development', description: 'Sharpen high-value patterns for singles or doubles.', order: 2 },
      { name: 'Pressure training', description: 'Execute decisions and techniques under score and time pressure.', order: 3 },
      { name: 'Competition readiness', description: 'Practise tournament routines, review and performance planning.', order: 4 },
    ],
  },
]

const skills: Array<{ name: string; category: SkillCategory; description: string }> = [
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
  { name: 'Grip Change Tap-Ups', skill: 'Forehand overhead clear', level: 'foundations', eventType: 'general', equipment: 'Racket and shuttle', numberOfPlayers: 1, durationMinutes: 8, instructions: 'Alternate forehand and backhand tap-ups while changing grip with the fingers.', coachingPoints: 'Relax the hand, rotate with the fingers and keep the racket in front.', commonMistakes: 'Panhandle grip, tight fist and large arm swings.', difficulty: 'easy', successTarget: 'Three sets of 20 controlled contacts without losing the correct grip.', easierVariation: 'Catch the shuttle after each contact and reset the grip.', harderProgression: 'Move while alternating low and high contacts.', completionRequirement: 'Changes grip automatically while maintaining control.' },
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

  for (const program of programs) {
    const existing = await payload.find({ collection: 'programs', depth: 0, limit: 1, where: { name: { equals: program.name } } })
    if (existing.docs[0]) await payload.update({ collection: 'programs', id: existing.docs[0].id, depth: 0, data: program })
    else await payload.create({ collection: 'programs', depth: 0, data: program })
  }

  const skillIDs = new Map<string, string>()
  for (const skill of skills) {
    const existing = await payload.find({ collection: 'skills', depth: 0, limit: 1, where: { name: { equals: skill.name } } })
    const document = existing.docs[0]
      ? await payload.update({ collection: 'skills', id: existing.docs[0].id, depth: 0, data: skill })
      : await payload.create({ collection: 'skills', depth: 0, data: skill })
    skillIDs.set(skill.name, document.id)
  }

  for (const drill of drills) {
    const skill = skillIDs.get(drill.skill)
    if (!skill) throw new Error(`Missing skill for drill: ${drill.name}`)
    const { skill: _skillName, ...data } = drill
    const existing = await payload.find({ collection: 'drills', depth: 0, limit: 1, where: { name: { equals: drill.name } } })
    const drillData = { ...data, skill }
    if (existing.docs[0]) await payload.update({ collection: 'drills', id: existing.docs[0].id, depth: 0, data: drillData })
    else await payload.create({ collection: 'drills', depth: 0, data: drillData })
  }

  payload.logger.info(`Coaching library ready: ${programs.length} programs, ${skills.length} skills, ${drills.length} drills.`)
  return { programs: programs.length, skills: skills.length, drills: drills.length }
}
