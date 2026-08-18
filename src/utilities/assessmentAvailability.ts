type Rule = {
  id: string
  coach: string | { id: string; name?: string | null }
  weekday: string
  startTime: string
  endTime: string
  slotDurationMinutes: number
  active?: boolean
}

export type GeneratedAssessmentSlot = {
  id: string
  ruleID: string
  startsAt: string
  durationMinutes: number
  coachID: string
  coachName: string
}

const MANILA_OFFSET_HOURS = 8
const timeParts = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour < 24 && minute < 60 ? { hour, minute } : null
}

export function generateRecurringAssessmentSlots(rules: Rule[], days = 42, now = new Date()) {
  const manilaNow = new Date(now.getTime() + MANILA_OFFSET_HOURS * 60 * 60 * 1000)
  const startDay = Date.UTC(
    manilaNow.getUTCFullYear(),
    manilaNow.getUTCMonth(),
    manilaNow.getUTCDate(),
  )
  const slots: GeneratedAssessmentSlot[] = []

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const localDay = new Date(startDay + dayOffset * 86400000)
    for (const rule of rules) {
      if (rule.active === false || Number(rule.weekday) !== localDay.getUTCDay()) continue
      const start = timeParts(rule.startTime)
      const end = timeParts(rule.endTime)
      if (!start || !end || rule.slotDurationMinutes < 15) continue
      const windowStart = start.hour * 60 + start.minute
      const windowEnd = end.hour * 60 + end.minute
      for (
        let minute = windowStart;
        minute + rule.slotDurationMinutes <= windowEnd;
        minute += rule.slotDurationMinutes
      ) {
        const startsAt = new Date(
          Date.UTC(
            localDay.getUTCFullYear(),
            localDay.getUTCMonth(),
            localDay.getUTCDate(),
            Math.floor(minute / 60) - MANILA_OFFSET_HOURS,
            minute % 60,
          ),
        )
        if (startsAt <= now) continue
        const coachID = typeof rule.coach === 'string' ? rule.coach : rule.coach.id
        const iso = startsAt.toISOString()
        slots.push({
          id: `rule:${rule.id}:${iso}`,
          ruleID: rule.id,
          startsAt: iso,
          durationMinutes: rule.slotDurationMinutes,
          coachID,
          coachName:
            typeof rule.coach === 'object' ? rule.coach.name || 'your coach' : 'your coach',
        })
      }
    }
  }
  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}
