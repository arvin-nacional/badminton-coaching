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
  'Match Visualization and Reset': '/images/drills/match-visualization-reset.png',
  'High-Intensity Shadow Intervals': '/images/drills/high-intensity-shadow-intervals.png',
}

export const drillIllustrationFor = (
  drill: Pick<Drill, 'name' | 'illustrationURL'>,
): string | null =>
  drill.name === 'Badminton Bodyweight Strength Circuit'
    ? badmintonBodyweightStrengthContent.illustrationURL
    : drill.name === 'Shoulder and Core Control'
      ? shoulderAndCoreControlContent.illustrationURL
      : drill.illustrationURL || defaultIllustrations[drill.name] || null
