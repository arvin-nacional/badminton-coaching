import {
  badmintonBodyweightStrengthContent,
  shoulderAndCoreControlContent,
} from '@/data/homePracticeSteps'
import type { Drill } from '@/payload-types'

const defaultIllustrations: Record<string, string> = {
  'Solo Racket Control Circuit': '/images/drills/solo-racket-control-circuit.png',
  'Low Serve Floor Targets': '/images/drills/low-serve-floor-targets.png',
  'Overhead Shadow Technique': '/images/drills/overhead-shadow-technique.png',
  'Compact Home Footwork': '/images/drills/compact-home-footwork.png',
  'Lunge Balance and Leg Strength': '/images/drills/lunge-balance-leg-strength.png',
  'Wall Drive and Defence': '/images/drills/wall-drive-defence.png',
  'Reactive Split-Step Cues': '/images/drills/reactive-split-step-cues.png',
  'Badminton Bodyweight Strength Circuit':
    '/images/drills/badminton-bodyweight-strength-circuit.png',
  'Shoulder and Core Control': '/images/drills/shoulder-core-control.png',
  'Reset and Rally Rehearsal': '/images/drills/reset-and-rally-rehearsal.png',
  'Match Visualization and Reset': '/images/drills/match-visualization-reset.png',
  'High-Intensity Shadow Intervals': '/images/drills/high-intensity-shadow-intervals.png',
  'Singles Base Recovery Shadow': '/images/drills/singles-base-recovery-shadow.svg',
  'Doubles First-Four-Shot Shadow': '/images/drills/doubles-first-four-shadow.svg',
  'Grip Change Tap-Ups': '/images/drills/grip-change-tap-ups.png',
  'Clear to Targets': '/images/drills/clear-to-targets.png',
  'Rear-Court Clear and Recovery': '/images/drills/rear-court-clear-and-recovery.png',
  'Four-Corner Shadow Rhythm': '/images/drills/four-corner-shadow-rhythm.png',
  'Lunge, Net and Recover': '/images/drills/lunge-net-and-recover.png',
  'Low Serve Gate': '/images/drills/low-serve-gate.png',
  'Singles High Serve and Base Recovery': '/images/drills/singles-high-serve-base-recovery.svg',
  'Singles Straight Lift Recovery': '/images/drills/singles-straight-lift-recovery.svg',
  'Doubles First Four Shots': '/images/drills/doubles-first-four-shots.svg',
  'Lift for Length': '/images/drills/lift-for-length.png',
  'Twenty-Shot Cooperative Rally': '/images/drills/twenty-shot-cooperative-rally.png',
  'Random Six-Corner Feeding': '/images/drills/random-six-corner-feeding.png',
  'Clear-Drop Decision Rally': '/images/drills/clear-drop-decision-rally.png',
  'Net-Lift-Kill Progression': '/images/drills/net-lift-kill-progression.png',
  'Singles Corner Pressure Rally': '/images/drills/singles-corner-pressure-rally.svg',
  'Three-Shot Attack Pattern': '/images/drills/three-shot-attack-pattern.png',
  'Drive Channel Exchange': '/images/drills/drive-channel-exchange.png',
  'Attack-Defence Rotation': '/images/drills/attack-defence-rotation.png',
  'Doubles Front-Player Interception': '/images/drills/doubles-front-player-interception.svg',
  'Doubles Defence-to-Attack No-Lift': '/images/drills/doubles-defence-to-attack-no-lift.svg',
  'Defence Choice Under Pressure': '/images/drills/defence-choice-under-pressure.png',
  'Progressive Score Scenarios': '/images/drills/pressure-score-18-all.png',
  'Regulation Interval Simulation': '/images/drills/tournament-interval-simulation.png',
  'Repeat Movement Quality Intervals': '/images/drills/repeat-movement-quality-intervals.png',
}

export const drillIllustrationFor = (
  drill: Pick<Drill, 'name' | 'illustrationURL'>,
): string | null =>
  drill.name === 'Badminton Bodyweight Strength Circuit'
    ? badmintonBodyweightStrengthContent.illustrationURL
    : drill.name === 'Shoulder and Core Control'
      ? shoulderAndCoreControlContent.illustrationURL
      : drill.illustrationURL || defaultIllustrations[drill.name] || null
