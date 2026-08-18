import React from 'react'

import { AuthStateProvider } from './AuthState'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthStateProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </AuthStateProvider>
    </ThemeProvider>
  )
}
