export type PlayingExperience = 'new' | 'under-1-year' | '1-3-years' | 'over-3-years'
export type CompetitionGoal = 'casual' | 'club' | 'tournament' | 'national'
export type ProgramLevel = 'foundations' | 'development' | 'competitive'

export type RecommendationInput = {
  playingExperience: PlayingExperience
  skillSelfRating: number
  competitionGoal: CompetitionGoal
  trainingFrequencyPerWeek: '1' | '2' | '3' | '4+'
}

export type Recommendation = {
  level: ProgramLevel
  rationale: string
}

const experienceScores: Record<PlayingExperience, number> = {
  new: 1,
  'under-1-year': 2,
  '1-3-years': 5,
  'over-3-years': 8,
}

const competitionScores: Record<CompetitionGoal, number> = {
  casual: 1,
  club: 4,
  tournament: 7,
  national: 10,
}

/**
 * Recommends a program level from onboarding answers using a weighted score.
 *
 * The score blends four signals:
 *  - Playing experience (how long the student has been playing)
 *  - Skill self-rating (1–10, the student's own assessment)
 *  - Competition goal (casual → national)
 *  - Training frequency (sessions per week — capacity to handle longer programs)
 *
 * Each signal is normalised to a 1–10 scale, then weighted:
 *  skill 35%, experience 25%, competition 25%, frequency 15%.
 *
 * Thresholds:
 *  - 0–3.9  → Foundations
 *  - 4–6.9  → Development
 *  - 7–10   → Competitive
 *
 * Competition goal acts as a floor: tournament/national always pushes to
 * at least Development, national always pushes to at least Competitive.
 * Casual always caps at Development (a casual player is not ready for the
 * competitive program's pressure routines regardless of self-rating).
 */
export function recommendProgram(input: RecommendationInput): Recommendation {
  const experienceScore = experienceScores[input.playingExperience] ?? 1
  const skillScore = Math.max(1, Math.min(10, input.skillSelfRating))
  const competitionScore = competitionScores[input.competitionGoal] ?? 1

  const frequencyScores: Record<RecommendationInput['trainingFrequencyPerWeek'], number> = {
    '1': 2,
    '2': 5,
    '3': 8,
    '4+': 10,
  }
  const frequencyScore = frequencyScores[input.trainingFrequencyPerWeek] ?? 2

  const weighted =
    skillScore * 0.35 + experienceScore * 0.25 + competitionScore * 0.25 + frequencyScore * 0.15

  let level: ProgramLevel
  if (weighted < 4) level = 'foundations'
  else if (weighted < 7) level = 'development'
  else level = 'competitive'

  // Floor: competition ambition overrides downward signals.
  if (input.competitionGoal === 'national') level = 'competitive'
  else if (input.competitionGoal === 'tournament' && level === 'foundations') level = 'development'

  // Cap: casual players are not ready for the competitive program.
  if (input.competitionGoal === 'casual' && level === 'competitive') level = 'development'

  const rationale = buildRationale(level, input, weighted)

  return { level, rationale }
}

function buildRationale(level: ProgramLevel, input: RecommendationInput, score: number): string {
  const scoreLabel = `${score.toFixed(1)}/10`
  const experienceLabel: Record<PlayingExperience, string> = {
    new: 'new to badminton',
    'under-1-year': 'less than 1 year of experience',
    '1-3-years': '1–3 years of experience',
    'over-3-years': 'over 3 years of experience',
  }
  const competitionLabel: Record<CompetitionGoal, string> = {
    casual: 'casual / fitness goals',
    club: 'club-level ambitions',
    tournament: 'local tournament ambitions',
    national: 'national / high-performance ambitions',
  }

  if (level === 'foundations') {
    return `Recommended Foundations (score ${scoreLabel}). The student is ${experienceLabel[input.playingExperience]} with a self-rating of ${input.skillSelfRating}/10 and ${competitionLabel[input.competitionGoal]}. Foundations builds dependable movement, grips and core strokes before adding speed and pressure.`
  }
  if (level === 'development') {
    return `Recommended Player Development (score ${scoreLabel}). The student has ${experienceLabel[input.playingExperience]}, a self-rating of ${input.skillSelfRating}/10, and ${competitionLabel[input.competitionGoal]}. Development improves movement efficiency, shot quality, consistency and tactical choices in realistic rallies.`
  }
  return `Recommended Competitive Performance (score ${scoreLabel}). The student has ${experienceLabel[input.playingExperience]}, a self-rating of ${input.skillSelfRating}/10, and ${competitionLabel[input.competitionGoal]}. Competitive develops an individual competition plan, pressure-ready skills and repeatable tournament routines.`
}
