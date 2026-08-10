import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin, isCoach } from '@/utilities/dashboardAuth'

const movementKeys = ['readyPosition', 'fourCornerMovement', 'frontCourtRecovery', 'rearCourtRecovery', 'balanceCoordination'] as const
const technicalKeys = ['gripChanges', 'lowServe', 'overheadClear', 'dropShot', 'netShot', 'lift', 'drive'] as const
const tacticalKeys = ['shotConsistency', 'courtPositioning', 'shotSelection', 'recovery', 'spaceAwareness', 'performanceUnderPressure'] as const
const allKeys = [...movementKeys, ...technicalKeys, ...tacticalKeys]
const idOf = (value: unknown) => typeof value === 'string' ? value : value && typeof value === 'object' && 'id' in value ? String(value.id) : null
const cleanText = (value: unknown, max = 2000) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config })
  const { user: authenticatedUser } = await payload.auth({ headers: await headers() })
  const user = authenticatedUser as User | null
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  if (!isCoach(user)) return Response.json({ error: 'Coach access required.' }, { status: 403 })
  const body = await request.json().catch(() => null) as { scores?: Record<string, unknown>; strengths?: unknown[]; priorities?: unknown[]; firstSessionFocus?: unknown; independentPractice?: unknown; coachSummary?: unknown } | null
  if (!body?.scores) return Response.json({ error: 'Assessment scores are required.' }, { status: 400 })
  const scores: Record<string, number | undefined> = {}
  for (const key of allKeys) {
    const value = body.scores[key]
    if (value == null) continue
    if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 5) return Response.json({ error: `Invalid score for ${key}.` }, { status: 400 })
    scores[key] = Number(value)
  }
  const scoredValues = Object.values(scores).filter((value): value is number => typeof value === 'number')
  if (scoredValues.length < 10) return Response.json({ error: 'Score at least 10 relevant criteria before completing the assessment.' }, { status: 400 })
  const strengths = (body.strengths || []).map((item) => cleanText(item, 300)).filter(Boolean)
  const priorities = (body.priorities || []).map((item) => cleanText(item, 300)).filter(Boolean)
  if (strengths.length !== 3 || priorities.length !== 3) return Response.json({ error: 'Enter exactly three strengths and three training priorities.' }, { status: 400 })
  const firstSessionFocus = cleanText(body.firstSessionFocus)
  const independentPractice = cleanText(body.independentPractice)
  if (!firstSessionFocus || !independentPractice) return Response.json({ error: 'Add the first-session focus and independent practice task.' }, { status: 400 })
  const averageScore = Math.round((scoredValues.reduce((sum, value) => sum + value, 0) / scoredValues.length) * 100) / 100
  const recommendedPackage = averageScore < 2.5 ? 'foundations' : averageScore < 3.5 ? 'development' : 'competitive'
  const developmentStage = (['not-introduced', 'learning', 'controlled', 'game-ready', 'pressure-ready'] as const)[Math.max(1, Math.min(5, Math.round(averageScore))) - 1]
  const group = (keys: readonly string[]) => Object.fromEntries(keys.map((key) => [key, scores[key] ?? null]))
  try {
    const { id } = await params
    const booking = await payload.findByID({ collection: 'assessment-bookings', id, depth: 0, overrideAccess: false, user })
    if (!isAdmin(user) && idOf(booking.coach) !== user.id) return Response.json({ error: 'This assessment is not assigned to you.' }, { status: 403 })
    const completedAt = new Date().toISOString()
    await payload.update({ collection: 'assessment-bookings', id, overrideAccess: false, user, data: { status: 'completed', assessmentResults: { averageScore, developmentStage, recommendedPackage, movement: group(movementKeys), technical: group(technicalKeys), tactical: group(tacticalKeys), strengths: strengths.map((item) => ({ item })), trainingPriorities: priorities.map((item) => ({ item })), firstSessionFocus, independentPractice, coachSummary: cleanText(body.coachSummary, 4000) || undefined, completedAt } } })
    return Response.json({ averageScore, developmentStage, recommendedPackage, completedAt })
  } catch {
    return Response.json({ error: 'The assessment booking was not found.' }, { status: 404 })
  }
}
