// @vitest-environment node

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import RoadmapLoading from '@/app/(dashboard)/dashboard/student/roadmap/loading'

describe('student roadmap loading state', () => {
  it('renders an accessible roadmap skeleton for route transitions', () => {
    const markup = renderToStaticMarkup(createElement(RoadmapLoading))

    expect(markup).toContain('aria-label="Loading your roadmap"')
    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('animate-pulse')
    expect(markup).toContain('lg:col-span-5')
    expect(markup).not.toContain('Preparing your dashboard')
  })
})
