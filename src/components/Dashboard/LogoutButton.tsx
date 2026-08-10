'use client'

import { useState } from 'react'

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false)

  async function logout() {
    setIsPending(true)

    try {
      const response = await fetch('/api/users/logout', { method: 'POST' })

      if (!response.ok) throw new Error('Logout failed')

      window.location.assign('/login')
    } catch {
      setIsPending(false)
    }
  }

  return (
    <button disabled={isPending} onClick={logout} type="button">
      {isPending ? 'Logging out…' : 'Logout'}
    </button>
  )
}
