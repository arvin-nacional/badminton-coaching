import type { CollectionBeforeChangeHook } from 'payload'

import type { SkillProgress } from '@/payload-types'

export const stageFromProgress = (progress: number): SkillProgress['stage'] => {
  if (progress <= 0) return 'not-introduced'
  if (progress <= 40) return 'learning'
  if (progress <= 60) return 'controlled'
  if (progress <= 80) return 'game-ready'
  return 'pressure-ready'
}

export const normalizeSkillProgressStage: CollectionBeforeChangeHook<SkillProgress> = ({ data, originalDoc }) => {
  const progress = typeof data.progress === 'number' ? data.progress : originalDoc?.progress
  if (typeof progress === 'number') data.stage = stageFromProgress(progress)
  return data
}
