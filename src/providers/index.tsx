import React from 'react'

import { AuthStateProvider, type FrontendAuthUser } from './AuthState'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
  initialAuthUser?: FrontendAuthUser | null
}> = ({ children, initialAuthUser }) => {
  return (
    <ThemeProvider>
      <AuthStateProvider initialUser={initialAuthUser}>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </AuthStateProvider>
    </ThemeProvider>
  )
}
