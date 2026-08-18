'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type FrontendAuthUser = {
  id: string
  roles?: ('admin' | 'coach' | 'student')[] | null
}

type AuthStateContextValue = {
  isResolved: boolean
  setAuthUser: (user: FrontendAuthUser | null) => void
  user: FrontendAuthUser | null
}

const AuthStateContext = createContext<AuthStateContextValue | null>(null)

export function AuthStateProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser?: FrontendAuthUser | null
}) {
  const [user, setUser] = useState<FrontendAuthUser | null>(initialUser ?? null)
  const [isResolved, setIsResolved] = useState(initialUser !== undefined)

  const setAuthUser = useCallback((nextUser: FrontendAuthUser | null) => {
    setUser(nextUser)
    setIsResolved(true)
  }, [])

  const value = useMemo(() => ({ isResolved, setAuthUser, user }), [isResolved, setAuthUser, user])

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>
}

export function useAuthState() {
  const value = useContext(AuthStateContext)

  if (!value) throw new Error('useAuthState must be used inside AuthStateProvider')

  return value
}
