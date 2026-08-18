// @vitest-environment node

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HeaderActions } from '@/Header/Actions'
import type { Header } from '@/payload-types'
import { AuthStateProvider, useAuthState } from '@/providers/AuthState'

function AuthStateProbe() {
  const { isResolved, user } = useAuthState()

  return createElement(
    'span',
    null,
    `${isResolved ? 'resolved' : 'pending'}:${user?.roles?.join(',') || 'signed-out'}`,
  )
}

function renderAuthState(initialUser?: Parameters<typeof AuthStateProvider>[0]['initialUser']) {
  return renderToStaticMarkup(
    createElement(AuthStateProvider, {
      children: createElement(AuthStateProbe),
      initialUser,
    }),
  )
}

describe('frontend auth state', () => {
  it('renders a server-provided dashboard user as resolved immediately', () => {
    const markup = renderAuthState({ id: 'student-1', roles: ['student'] })

    expect(markup).toContain('resolved:student')
  })

  it('shows the student dashboard action in the first header render', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthStateProvider, {
        children: createElement(HeaderActions, { data: {} as Header }),
        initialUser: { id: 'student-1', roles: ['student'] },
      }),
    )

    expect(markup).toContain('My dashboard')
    expect(markup).toContain('href="/dashboard/student"')
    expect(markup).not.toContain('Checking account')
    expect(markup).not.toContain('Student login')
  })

  it('renders a server-confirmed signed-out state as resolved immediately', () => {
    const markup = renderAuthState(null)

    expect(markup).toContain('resolved:signed-out')
  })

  it('preserves the pending state when no server auth result is supplied', () => {
    const markup = renderAuthState()

    expect(markup).toContain('pending:signed-out')
  })
})
