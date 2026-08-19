import { SignupForm } from '@/components/Dashboard/SignupForm'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return <SignupForm googleClientID={process.env.GOOGLE_CLIENT_ID?.trim() || ''} />
}
