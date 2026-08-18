export const sessionDurationOptions = [60, 90, 120] as const

export type SessionDurationMinutes = (typeof sessionDurationOptions)[number]

export const isSessionDuration = (value: unknown): value is SessionDurationMinutes =>
  typeof value === 'number' && sessionDurationOptions.some((option) => option === value)

export const normalizeSessionDuration = (value: unknown): SessionDurationMinutes =>
  isSessionDuration(value) ? value : 60

export const stripSessionTimePrefix = (value: string): string =>
  value.replace(/^\s*\d+\s*(?:min|mins|minute|minutes)\s*[\u2013\u2014-]\s*/i, '')

const splitMinutes = (minutes: number, blocks: number): number[] => {
  const safeBlocks = Math.max(1, blocks)
  const base = Math.floor(minutes / safeBlocks)
  const remainder = minutes % safeBlocks

  return Array.from({ length: safeBlocks }, (_, index) => base + (index < remainder ? 1 : 0))
}

export const buildSessionTiming = (duration: unknown, drillCount: number) => {
  const durationMinutes = normalizeSessionDuration(duration)
  const warmUp = Math.round(durationMinutes * 0.1)
  const movementPreparation = Math.round(durationMinutes * 0.1)
  const conditionedGame = Math.round(durationMinutes * 0.15)
  const matchPlay = Math.round(durationMinutes * 0.2)
  const cooldownAndFeedback = Math.round(durationMinutes * 0.1)
  const fixedMinutes =
    warmUp + movementPreparation + conditionedGame + matchPlay + cooldownAndFeedback
  const drillMinutes = splitMinutes(durationMinutes - fixedMinutes, drillCount)

  return {
    conditionedGame,
    cooldownAndFeedback,
    drillMinutes,
    durationMinutes,
    matchPlay,
    movementPreparation,
    total: fixedMinutes + drillMinutes.reduce((total, blockMinutes) => total + blockMinutes, 0),
    warmUp,
  }
}
