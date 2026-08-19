import { LoaderCircle } from 'lucide-react'
import { Suspense } from 'react'

import { LoginForm } from '@/components/Dashboard/LoginForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#1677ff]" />
        </main>
      }
    >
      <LoginForm googleClientID={process.env.GOOGLE_CLIENT_ID?.trim() || ''} />
    </Suspense>
  )
}
