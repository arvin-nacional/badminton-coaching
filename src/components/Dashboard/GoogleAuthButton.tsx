'use client'

import { LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleAccounts = {
  id: {
    initialize(options: {
      callback: (response: GoogleCredentialResponse) => void
      client_id: string
    }): void
    renderButton(
      parent: HTMLElement,
      options: {
        shape: 'pill'
        size: 'large'
        text: 'signin_with' | 'signup_with'
        theme: 'outline'
        type: 'standard'
        width: number
      },
    ): void
  }
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts }
  }
}

let googleScriptPromise: Promise<void> | null = null

function loadGoogleIdentityServices() {
  if (window.google?.accounts) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    const script = existing || document.createElement('script')

    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), {
      once: true,
    })

    if (!existing) {
      script.async = true
      script.defer = true
      script.dataset.googleIdentity = 'true'
      script.src = 'https://accounts.google.com/gsi/client'
      document.head.appendChild(script)
    }
  }).catch((error) => {
    googleScriptPromise = null
    throw error
  })

  return googleScriptPromise
}

export function GoogleAuthButton({
  clientID,
  intent,
  onAuthenticated,
}: {
  clientID: string
  intent: 'signin' | 'signup'
  onAuthenticated: (user: { roles?: string[] }) => void
}) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const onAuthenticatedRef = useRef(onAuthenticated)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated
  }, [onAuthenticated])

  useEffect(() => {
    let active = true

    void loadGoogleIdentityServices()
      .then(() => {
        if (!active || !buttonRef.current || !window.google) return
        const button = buttonRef.current

        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: async ({ credential }) => {
            if (!credential) {
              setError('Google did not return a credential. Please try again.')
              return
            }

            setError('')
            setPending(true)

            try {
              const response = await fetch('/api/auth/google', {
                body: JSON.stringify({ credential, intent }),
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
              })
              const result = (await response.json().catch(() => null)) as {
                error?: string
                user?: { roles?: string[] }
              } | null

              if (!response.ok || !result?.user) {
                throw new Error(result?.error || 'Unable to continue with Google.')
              }

              onAuthenticatedRef.current(result.user)
            } catch (authError) {
              if (active) {
                setError(
                  authError instanceof Error ? authError.message : 'Unable to continue with Google.',
                )
                setPending(false)
              }
            }
          },
        })

        button.replaceChildren()
        window.google.accounts.id.renderButton(button, {
          shape: 'pill',
          size: 'large',
          text: intent === 'signup' ? 'signup_with' : 'signin_with',
          theme: 'outline',
          type: 'standard',
          width: Math.min(336, button.clientWidth || 336),
        })
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load Google sign-in.')
        }
      })

    return () => {
      active = false
    }
  }, [clientID, intent])

  return (
    <div>
      <div className="relative flex min-h-11 justify-center" aria-busy={pending}>
        <div
          ref={buttonRef}
          className={`flex w-full justify-center ${pending ? 'pointer-events-none opacity-50' : ''}`}
        />
        {pending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#1677ff]" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-3 rounded-xl bg-[#fff0f0] p-3 text-sm font-semibold text-[#a53d3d]">
          {error}
        </p>
      )}
    </div>
  )
}
