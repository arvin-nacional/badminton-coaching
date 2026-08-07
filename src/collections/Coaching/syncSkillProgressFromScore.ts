import type { CollectionAfterChangeHook } from 'payload'

import type { SessionSkillScore, Skill, StudentProfile } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

const scoreStage = (score: number) => {
  if (score === 0) return 'not-introduced' as const
  if (score >= 5) return 'pressure-ready' as const
  if (score >= 4) return 'game-ready' as const
  if (score >= 3) return 'controlled' as const
  return 'learning' as const
}

export const syncSkillProgressFromScore: CollectionAfterChangeHook<SessionSkillScore> = async ({ doc, req }) => {
  const studentID = relationshipID(doc.student)
  const skillID = relationshipID(doc.skill)
  const sessionID = relationshipID(doc.session)
  if (!studentID || !skillID) return doc

  if (doc.status === 'not-assessed') {
    const [remainingScores, existingProgress] = await Promise.all([
      req.payload.find({
        collection: 'session-skill-scores',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        req,
        sort: '-scoredAt',
        where: {
          and: [
            { student: { equals: studentID } },
            { skill: { equals: skillID } },
            { status: { equals: 'scored' } },
          ],
        },
      }),
      req.payload.find({ collection: 'skill-progress', depth: 0, limit: 1, overrideAccess: true, req, where: { and: [{ student: { equals: studentID } }, { skill: { equals: skillID } }] } }),
    ])
    const latestScore = remainingScores.docs[0]
    const existing = existingProgress.docs[0]

    if (existing && (!latestScore || typeof latestScore.score !== 'number')) {
      await req.payload.update({
        collection: 'skill-progress',
        id: existing.id,
        data: {
          coachFeedback: null,
          latestScore: null,
          latestSession: null,
          previousProgress: existing.progress,
          progress: 0,
          stage: 'not-introduced',
          updatedAtAssessment: null,
        },
        depth: 0,
        overrideAccess: true,
        req,
      })
    } else if (existing && latestScore && typeof latestScore.score === 'number') {
      await req.payload.update({
        collection: 'skill-progress',
        id: existing.id,
        data: {
          coachFeedback: [
            latestScore.evidence ? `Evidence: ${latestScore.evidence}` : '',
            latestScore.nextFocus ? `Next focus: ${latestScore.nextFocus}` : '',
          ].filter(Boolean).join('\n') || null,
          latestScore: latestScore.score,
          latestSession: relationshipID(latestScore.session),
          previousProgress: existing.progress,
          progress: latestScore.score * 20,
          stage: scoreStage(latestScore.score),
          updatedAtAssessment: latestScore.scoredAt,
        },
        depth: 0,
        overrideAccess: true,
        req,
      })
    }

    return doc
  }

  if (doc.status !== 'scored' || typeof doc.score !== 'number') return doc

  const [profile, skill, existingProgress] = await Promise.all([
    typeof doc.student === 'object'
      ? Promise.resolve(doc.student as StudentProfile)
      : req.payload.findByID({ collection: 'student-profiles', id: studentID, depth: 0, overrideAccess: true, req }),
    typeof doc.skill === 'object'
      ? Promise.resolve(doc.skill as Skill)
      : req.payload.findByID({ collection: 'skills', id: skillID, depth: 0, overrideAccess: true, req }),
    req.payload.find({ collection: 'skill-progress', depth: 0, limit: 1, overrideAccess: true, req, where: { and: [{ student: { equals: studentID } }, { skill: { equals: skillID } }] } }),
  ])
  const existing = existingProgress.docs[0]
  const feedback = [
    doc.evidence ? `Evidence: ${doc.evidence}` : '',
    doc.nextFocus ? `Next focus: ${doc.nextFocus}` : '',
  ].filter(Boolean).join('\n')
  const progressData = {
    coachFeedback: feedback || undefined,
    label: `${profile.displayName} · ${skill.name}`,
    latestScore: doc.score,
    latestSession: sessionID || undefined,
    progress: doc.score * 20,
    progressKey: `${studentID}:${skillID}`,
    previousProgress: existing?.progress || 0,
    skill: skillID,
    stage: scoreStage(doc.score),
    student: studentID,
    updatedAtAssessment: doc.scoredAt || new Date().toISOString(),
  }

  if (existing) {
    await req.payload.update({ collection: 'skill-progress', id: existing.id, data: progressData, depth: 0, overrideAccess: true, req })
  } else {
    await req.payload.create({ collection: 'skill-progress', data: progressData, depth: 0, overrideAccess: true, req })
  }

  return doc
}
