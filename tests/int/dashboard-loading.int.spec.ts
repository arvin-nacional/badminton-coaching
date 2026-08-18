// @vitest-environment node

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import StudentDashboardLoading from '@/app/(dashboard)/dashboard/student/loading'

describe('student dashboard loading state', () => {
  it('renders an accessible dashboard-shaped skeleton', () => {
    const markup = renderToStaticMarkup(createElement(StudentDashboardLoading))

    expect(markup).toContain('aria-label="Loading your dashboard"')
    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('animate-pulse')
    expect(markup).toContain('lg:col-span-8')
    expect(markup).toContain('lg:col-span-12')
    expect(markup).not.toContain('Preparing your dashboard')
  })
})
