// @vitest-environment node

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TrainingVideoLinks } from '@/components/Dashboard/TrainingVideoLinks'

describe('training video links', () => {
  it('renders a safe external technique link without loading an embed', () => {
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
    expect(markup).toContain('Watch technique')
    expect(markup).toContain('Grip Change Tap-Ups')
    expect(markup).toContain('YouTube reference')
    expect(markup).not.toContain('<iframe')
  })
})
