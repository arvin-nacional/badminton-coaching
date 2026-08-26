// @vitest-environment node

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TrainingVideoLinks } from '@/components/Dashboard/TrainingVideoLinks'
import { youtubeNoCookieEmbedURL, youtubeVideoID } from '@/utilities/trainingVideos'

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
})
