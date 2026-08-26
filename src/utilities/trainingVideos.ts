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

const youtubeVideoIDPattern = /^[A-Za-z0-9_-]{11}$/

export const youtubeVideoID = (value: string | null | undefined): string | null => {
  const url = safeTrainingVideoURL(value)
  if (!url) return null
  if (url.username || url.password || url.port) return null

  const hostname = url.hostname.toLowerCase()
  const pathSegments = url.pathname.split('/').filter(Boolean)
  let candidate: string | null = null

  if (hostname === 'youtu.be') {
    candidate = pathSegments.length === 1 ? pathSegments[0] : null
  } else if (
    ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(hostname) &&
    url.pathname === '/watch'
  ) {
    candidate = url.searchParams.get('v')
  } else if (
    [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtube-nocookie.com',
      'www.youtube-nocookie.com',
    ].includes(hostname)
  ) {
    const [format, id] = pathSegments
    if (pathSegments.length === 2 && ['embed', 'shorts', 'live'].includes(format)) {
      candidate = id || null
    }
  }

  return candidate && youtubeVideoIDPattern.test(candidate) ? candidate : null
}

export const youtubeNoCookieEmbedURL = (value: string | null | undefined): string | null => {
  const videoID = youtubeVideoID(value)
  return videoID
    ? `https://www.youtube-nocookie.com/embed/${videoID}?autoplay=1&playsinline=1&rel=0`
    : null
}

export const trainingVideosFromDrills = (drills: DrillReference[]): TrainingVideo[] => {
  const videos = new Map<string, TrainingVideo>()

  for (const drill of drills) {
    if (!drill || typeof drill === 'string') continue

    const parsedURL = safeTrainingVideoURL(drill.videoURL)
    if (!parsedURL) continue

    const url = parsedURL.toString()
    const youtubeID = youtubeVideoID(url)
    const videoKey = youtubeID ? `youtube:${youtubeID}` : url
    if (videos.has(videoKey)) continue

    videos.set(videoKey, {
      title: drill.name,
      url,
      level: drill.level,
      source: youtubeID ? 'YouTube reference' : 'Video reference',
    })
  }

  return Array.from(videos.values())
}
