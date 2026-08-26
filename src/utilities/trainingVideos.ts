import type { Drill } from '@/payload-types'

export type TrainingVideo = {
  title: string
  url: string
  level: Drill['level']
  source: string
}

type VideoDrill = Pick<Drill, 'name' | 'level' | 'videoURL'>
type DrillReference = VideoDrill | string | null | undefined

export const safeTrainingVideoURL = (value: string | null | undefined): URL | null => {
  if (!value) return null

  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

export const trainingVideosFromDrills = (drills: DrillReference[]): TrainingVideo[] => {
  const videos = new Map<string, TrainingVideo>()

  for (const drill of drills) {
    if (!drill || typeof drill === 'string') continue

    const parsedURL = safeTrainingVideoURL(drill.videoURL)
    if (!parsedURL) continue

    const url = parsedURL.toString()
    if (videos.has(url)) continue

    const isYouTube = ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(parsedURL.hostname)

    videos.set(url, {
      title: drill.name,
      url,
      level: drill.level,
      source: isYouTube ? 'YouTube reference' : 'Video reference',
    })
  }

  return Array.from(videos.values())
}
