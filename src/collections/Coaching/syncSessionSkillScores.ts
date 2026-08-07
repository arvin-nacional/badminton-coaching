import type { CollectionAfterChangeHook } from 'payload'

import type { Skill, StudentProfile, TrainingSession } from '@/payload-types'

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

export const syncSessionSkillScores: CollectionAfterChangeHook<TrainingSession> = async ({ doc, req }) => {
  const studentID = relationshipID(doc.student)
  if (!studentID) return doc

  const skillIDs = (doc.skills || []).map(relationshipID).filter((id): id is string => Boolean(id))
  const profile = typeof doc.student === 'object'
    ? doc.student as StudentProfile
    : await req.payload.findByID({ collection: 'student-profiles', id: studentID, depth: 1, overrideAccess: true, req })
  const coachID = relationshipID(doc.coach) || relationshipID(profile.coach)
  const programID = relationshipID(doc.program) || relationshipID(profile.program)
  const skillResult = skillIDs.length
    ? await req.payload.find({ collection: 'skills', depth: 0, limit: skillIDs.length, overrideAccess: true, req, where: { id: { in: skillIDs } } })
    : null
  const skillsByID = new Map((skillResult?.docs || []).map((skill) => [skill.id, skill as Skill]))
  const existingScores = await req.payload.find({
    collection: 'session-skill-scores',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    req,
    where: { session: { equals: doc.id } },
  })

  for (const skillID of skillIDs) {
    const skill = skillsByID.get(skillID)
    const scoreKey = `${doc.id}:${skillID}`
    const scoreData = {
      coach: coachID || undefined,
      label: `${profile.displayName} · ${skill?.name || 'Skill'} · ${doc.title}`,
      lessonWeek: doc.lessonWeek || undefined,
      program: programID || undefined,
      scoreKey,
      session: doc.id,
      skill: skillID,
      student: studentID,
    }
    const existingScore = existingScores.docs.find((score) => score.scoreKey === scoreKey)

    if (existingScore) {
      await req.payload.update({
        collection: 'session-skill-scores',
        id: existingScore.id,
        data: { ...scoreData, ...(existingScore.status === 'not-assessed' ? { status: 'pending' as const } : {}) },
        depth: 0,
        overrideAccess: true,
        req,
      })
    } else {
      await req.payload.create({
        collection: 'session-skill-scores',
        data: { ...scoreData, status: 'pending' },
        depth: 0,
        overrideAccess: true,
        req,
      })
    }

    const progressKey = `${studentID}:${skillID}`
    const existingProgress = await req.payload.find({
      collection: 'skill-progress',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: { and: [{ student: { equals: studentID } }, { skill: { equals: skillID } }] },
    })
    if (!existingProgress.docs[0]) {
      await req.payload.create({
        collection: 'skill-progress',
        data: {
          label: `${profile.displayName} · ${skill?.name || 'Skill'}`,
          progress: 0,
          progressKey,
          previousProgress: 0,
          skill: skillID,
          stage: 'not-introduced',
          student: studentID,
        },
        depth: 0,
        overrideAccess: true,
        req,
      })
    } else if (!existingProgress.docs[0].progressKey) {
      await req.payload.update({
        collection: 'skill-progress',
        id: existingProgress.docs[0].id,
        data: { progressKey },
        depth: 0,
        overrideAccess: true,
        req,
      })
    }
  }

  for (const score of existingScores.docs) {
    const scoreSkillID = relationshipID(score.skill)
    if (score.status !== 'not-assessed' && scoreSkillID && !skillIDs.includes(scoreSkillID)) {
      await req.payload.update({
        collection: 'session-skill-scores',
        id: score.id,
        data: { status: 'not-assessed' },
        depth: 0,
        overrideAccess: true,
        req,
      })
    }
  }

  return doc
}
