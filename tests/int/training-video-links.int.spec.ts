// @vitest-environment node

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TrainingVideoLinks } from '@/components/Dashboard/TrainingVideoLinks'
import {
  trainingVideoIntroductionsBySession,
  trainingVideosFromDrills,
  youtubeNoCookieEmbedURL,
  youtubeVideoID,
} from '@/utilities/trainingVideos'

describe('training video links', () => {
  it('renders an on-site player control with an external fallback before loading YouTube', () => {
    const markup = renderToStaticMarkup(
      createElement(TrainingVideoLinks, {
        videos: [
          {
            title: 'Grip Change Tap-Ups',
            url: 'https://www.youtube.com/watch?v=toQ7tOx7Tvs',
            level: 'foundations',
            source: 'YouTube reference',
          },
        ],
      }),
    )

    expect(markup).toContain('href="https://www.youtube.com/watch?v=toQ7tOx7Tvs"')
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain('rel="noopener noreferrer"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('Watch here')
    expect(markup).toContain('Grip Change Tap-Ups')
    expect(markup).toContain('YouTube reference')
    expect(markup).toContain('stays on this page')
    expect(markup).not.toContain('<iframe')
    expect(markup).not.toContain('role="dialog"')
  })

  it('creates privacy-enhanced embeds only for exact supported YouTube hosts and IDs', () => {
    expect(youtubeVideoID('https://www.youtube.com/watch?v=toQ7tOx7Tvs')).toBe('toQ7tOx7Tvs')
    expect(youtubeVideoID('https://youtu.be/toQ7tOx7Tvs')).toBe('toQ7tOx7Tvs')
    expect(youtubeVideoID('https://www.youtube.com/shorts/toQ7tOx7Tvs')).toBe('toQ7tOx7Tvs')
    expect(youtubeVideoID('https://youtube.com.evil.example/watch?v=toQ7tOx7Tvs')).toBeNull()
    expect(youtubeVideoID('https://user@www.youtube.com/watch?v=toQ7tOx7Tvs')).toBeNull()
    expect(youtubeVideoID('https://www.youtube.com:444/watch?v=toQ7tOx7Tvs')).toBeNull()
    expect(youtubeVideoID('https://youtu.be/toQ7tOx7Tvs/extra')).toBeNull()
    expect(youtubeVideoID('https://www.youtube.com/watch?v=too-short')).toBeNull()
    expect(youtubeVideoID('javascript:alert(1)')).toBeNull()
    expect(youtubeNoCookieEmbedURL('https://www.youtube.com/watch?v=toQ7tOx7Tvs')).toBe(
      'https://www.youtube-nocookie.com/embed/toQ7tOx7Tvs?autoplay=1&playsinline=1&rel=0',
    )
  })

  it('introduces each tutorial once across sessions without removing the drill reference', () => {
    const gripReference = {
      name: 'Grip reference',
      level: 'foundations' as const,
      videoURL: 'https://www.youtube.com/shorts/toQ7tOx7Tvs',
    }
    const introductions = trainingVideoIntroductionsBySession([
      [
        {
          name: 'Grip first',
          level: 'foundations',
          videoURL: 'https://www.youtube.com/watch?v=toQ7tOx7Tvs',
        },
        {
          name: 'Grip duplicate',
          level: 'foundations',
          videoURL: 'https://youtu.be/toQ7tOx7Tvs',
        },
        {
          name: 'Clear first',
          level: 'foundations',
          videoURL: 'https://www.youtube.com/watch?v=xRv1JLg4NMM',
        },
      ],
      [
        gripReference,
        {
          name: 'Smash first',
          level: 'development',
          videoURL: 'https://www.youtube.com/watch?v=H7kpZ9inc10',
        },
      ],
      [
        {
          name: 'Clear repeated',
          level: 'development',
          videoURL: 'https://www.youtube-nocookie.com/embed/xRv1JLg4NMM',
        },
      ],
    ])

    expect(introductions.map((session) => session.map((video) => video.title))).toEqual([
      ['Grip first', 'Clear first'],
      ['Smash first'],
      [],
    ])
    expect(trainingVideosFromDrills([gripReference])).toHaveLength(1)
  })
})
