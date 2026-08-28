'use client'

import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  ShieldCheck,
  Target,
} from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

import type { StudentProfile } from '@/payload-types'

type Recommendation = {
  level: 'foundations' | 'development' | 'competitive'
  rationale: string
}

const programLabels: Record<Recommendation['level'], { name: string; weeks: number }> = {
  foundations: { name: 'Badminton Foundations', weeks: 12 },
  development: { name: 'Player Development', weeks: 16 },
  competitive: { name: 'Competitive Performance', weeks: 20 },
}

type OnboardingFormProps = {
  healthDataNotice: string
  privacyURL: string
  profile: StudentProfile
}

const selectedClass = 'border-[#1677ff] bg-[#eaf3ff] text-[#0b5fc7]'
const unselectedClass = 'border-[#092c59]/10 hover:border-[#1677ff]/40'

const goalsOptions = [
  'Improve technique',
  'Get fitter',
  'Play socially',
  'Win matches',
  'Compete in tournaments',
] as const

const availabilityOptions = [
  'Weekday evenings',
  'Weekday mornings',
  'Weekend mornings',
  'Weekend afternoons',
  'Flexible',
] as const

const injuryOptions = ['None', 'Knee', 'Shoulder', 'Back', 'Ankle', 'Wrist'] as const

export function StudentOnboardingForm({
  healthDataNotice,
  privacyURL,
  profile,
}: OnboardingFormProps) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)

  // Radio-group state (controlled)
  const [playingExperience, setPlayingExperience] = useState(profile.playingExperience ?? '')
  const [skillSelfRating, setSkillSelfRating] = useState<number | null>(
    profile.skillSelfRating ?? null,
  )
  const [competitionGoal, setCompetitionGoal] = useState(profile.competitionGoal ?? '')
  const [preferredEvent, setPreferredEvent] = useState(profile.preferredEvent ?? '')
  const [trainingFrequencyPerWeek, setTrainingFrequencyPerWeek] = useState(
    profile.trainingFrequencyPerWeek ?? '',
  )

  // Option + "Other" state for goals
  const [goalsChoice, setGoalsChoice] = useState(
    goalsOptions.includes(profile.goals as (typeof goalsOptions)[number])
      ? (profile.goals as string)
      : profile.goals
        ? 'Other'
        : '',
  )
  const [goalsCustom, setGoalsCustom] = useState(
    goalsOptions.includes(profile.goals as (typeof goalsOptions)[number])
      ? ''
      : (profile.goals ?? ''),
  )

  // Option + "Other" state for training availability
  const [availabilityChoice, setAvailabilityChoice] = useState(
    availabilityOptions.includes(
      profile.trainingAvailability as (typeof availabilityOptions)[number],
    )
      ? (profile.trainingAvailability as string)
      : profile.trainingAvailability
        ? 'Other'
        : '',
  )
  const [availabilityCustom, setAvailabilityCustom] = useState(
    availabilityOptions.includes(
      profile.trainingAvailability as (typeof availabilityOptions)[number],
    )
      ? ''
      : (profile.trainingAvailability ?? ''),
  )

  // Option + "Other" state for injury considerations
  const [injuryChoice, setInjuryChoice] = useState(
    injuryOptions.includes(profile.injuryConsiderations as (typeof injuryOptions)[number])
      ? (profile.injuryConsiderations as string)
      : profile.injuryConsiderations
        ? 'Other'
        : '',
  )
  const [injuryCustom, setInjuryCustom] = useState(
    injuryOptions.includes(profile.injuryConsiderations as (typeof injuryOptions)[number])
      ? ''
      : (profile.injuryConsiderations ?? ''),
  )

  const goalsValue = goalsChoice === 'Other' ? goalsCustom : goalsChoice
  const availabilityValue = availabilityChoice === 'Other' ? availabilityCustom : availabilityChoice
  const injuryValue = injuryChoice === 'Other' ? injuryCustom : injuryChoice

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const data = new FormData(event.currentTarget)
    const finalGoals = goalsChoice === 'Other' ? goalsCustom : goalsChoice
    const finalAvailability =
      availabilityChoice === 'Other' ? availabilityCustom : availabilityChoice
    const finalInjury = injuryChoice === 'Other' ? injuryCustom : injuryChoice

    setPending(true)
    const response = await fetch('/api/student-onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitionGoal: data.get('competitionGoal'),
        displayName: data.get('displayName'),
        goals: finalGoals,
        healthDataConsent: data.get('healthDataConsent') === 'true',
        injuryConsiderations: finalInjury || undefined,
        playingExperience: data.get('playingExperience'),
        preferredEvent: data.get('preferredEvent'),
        skillSelfRating: Number(data.get('skillSelfRating')),
        trainingAvailability: finalAvailability,
        trainingFrequencyPerWeek: data.get('trainingFrequencyPerWeek'),
      }),
    }).catch(() => null)
    const result = (await response?.json().catch(() => null)) as {
      error?: string
      message?: string
      recommendation?: Recommendation
    } | null
    if (!response?.ok) {
      setError(result?.error || 'We could not save your onboarding details.')
      setPending(false)
      return
    }
    if (result?.recommendation) setRecommendation(result.recommendation)
    setPending(false)
  }

  if (recommendation) {
    const program = programLabels[recommendation.level]
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-xl rounded-[2rem] border border-[#092c59]/10 bg-white p-7 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef9f3] text-[#157347]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mt-7 text-3xl font-black tracking-[-.04em]">You&apos;re all set</h1>
          <p className="mt-3 text-sm leading-6 text-[#607286]">
            Your onboarding details have been saved. Based on your answers, here&apos;s the program
            we recommend for you.
          </p>

          <div className="mt-6 rounded-2xl border border-[#092c59]/10 bg-[#f3f7fc] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#092c59] text-[#4cc9ff]">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">
                  Recommended program
                </p>
                <p className="text-lg font-black text-[#092c59]">{program.name}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#607286]">{recommendation.rationale}</p>
            <p className="mt-3 text-xs font-bold text-[#718399]">
              {program.weeks} weeks · Your coach will confirm this after your initial assessment.
            </p>
          </div>

          <Link
            href="/dashboard/student"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white"
          >
            Go to dashboard <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-start justify-center px-5 py-12">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#092c59]/10 bg-white p-7 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#1677ff]">
          <ClipboardList className="h-6 w-6" />
        </div>
        <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#1677ff]">
          Student onboarding
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Tell us about your game</h1>
        <p className="mt-3 text-sm leading-6 text-[#607286]">
          These questions help your coach understand your level and recommend the right training
          program. Answer honestly — there are no wrong answers.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-bold">
            Display name
            <input
              name="displayName"
              type="text"
              defaultValue={profile.displayName ?? ''}
              maxLength={120}
              required
              className="mt-2 w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 outline-none focus:border-[#1677ff]"
            />
          </label>

          {/* Playing experience */}
          <div className="space-y-3">
            <p className="text-sm font-bold">How long have you been playing badminton?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: 'new', label: 'New to badminton' },
                { value: 'under-1-year', label: 'Less than 1 year' },
                { value: '1-3-years', label: '1–3 years' },
                { value: 'over-3-years', label: 'More than 3 years' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                    playingExperience === option.value ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="playingExperience"
                    value={option.value}
                    checked={playingExperience === option.value}
                    onChange={() => setPlayingExperience(option.value)}
                    required
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Skill self-rating */}
          <div className="space-y-3">
            <p className="text-sm font-bold">
              Rate your current skill level (1 = beginner, 10 = advanced)
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                <label
                  key={value}
                  className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-2 text-sm font-black transition ${
                    skillSelfRating === value ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="skillSelfRating"
                    value={value}
                    checked={skillSelfRating === value}
                    onChange={() => setSkillSelfRating(value)}
                    required
                    className="sr-only"
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>

          {/* Competition goal */}
          <div className="space-y-3">
            <p className="text-sm font-bold">What type of play are you aiming for?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: 'casual', label: 'Casual / fitness' },
                { value: 'club', label: 'Club-level play' },
                { value: 'tournament', label: 'Local tournaments' },
                { value: 'national', label: 'National / high-performance' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                    competitionGoal === option.value ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="competitionGoal"
                    value={option.value}
                    checked={competitionGoal === option.value}
                    onChange={() => setCompetitionGoal(option.value)}
                    required
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Preferred event */}
          <div className="space-y-3">
            <p className="text-sm font-bold">Preferred event</p>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { value: 'singles', label: 'Singles' },
                { value: 'doubles', label: 'Doubles' },
                { value: 'both', label: 'Both' },
                { value: 'not-sure', label: 'Not sure yet' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-bold transition ${
                    preferredEvent === option.value ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredEvent"
                    value={option.value}
                    checked={preferredEvent === option.value}
                    onChange={() => setPreferredEvent(option.value)}
                    required
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Training frequency */}
          <div className="space-y-3">
            <p className="text-sm font-bold">
              How many sessions per week can you commit to training?
            </p>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { value: '1', label: '1 / week' },
                { value: '2', label: '2 / week' },
                { value: '3', label: '3 / week' },
                { value: '4+', label: '4+ / week' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-bold transition ${
                    trainingFrequencyPerWeek === option.value ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="trainingFrequencyPerWeek"
                    value={option.value}
                    checked={trainingFrequencyPerWeek === option.value}
                    onChange={() => setTrainingFrequencyPerWeek(option.value)}
                    required
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Main goals — option chips + Other */}
          <div className="space-y-3">
            <p className="text-sm font-bold">Main goals</p>
            <div className="flex flex-wrap gap-2">
              {goalsOptions.map((option) => (
                <label
                  key={option}
                  className={`relative cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                    goalsChoice === option ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="goalsChoice"
                    value={option}
                    checked={goalsChoice === option}
                    onChange={() => setGoalsChoice(option)}
                    required
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
              <label
                className={`relative cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                  goalsChoice === 'Other' ? selectedClass : unselectedClass
                }`}
              >
                <input
                  type="radio"
                  name="goalsChoice"
                  value="Other"
                  checked={goalsChoice === 'Other'}
                  onChange={() => setGoalsChoice('Other')}
                  className="sr-only"
                />
                Other
              </label>
            </div>
            {goalsChoice === 'Other' && (
              <input
                type="text"
                value={goalsCustom}
                onChange={(e) => setGoalsCustom(e.target.value)}
                maxLength={1000}
                required
                placeholder="Describe your main goals…"
                className="w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 text-sm outline-none focus:border-[#1677ff]"
              />
            )}
            <input type="hidden" name="goals" value={goalsValue} />
          </div>

          {/* Training availability — option chips + Other */}
          <div className="space-y-3">
            <p className="text-sm font-bold">Training availability</p>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((option) => (
                <label
                  key={option}
                  className={`relative cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                    availabilityChoice === option ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="availabilityChoice"
                    value={option}
                    checked={availabilityChoice === option}
                    onChange={() => setAvailabilityChoice(option)}
                    required
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
              <label
                className={`relative cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                  availabilityChoice === 'Other' ? selectedClass : unselectedClass
                }`}
              >
                <input
                  type="radio"
                  name="availabilityChoice"
                  value="Other"
                  checked={availabilityChoice === 'Other'}
                  onChange={() => setAvailabilityChoice('Other')}
                  className="sr-only"
                />
                Other
              </label>
            </div>
            {availabilityChoice === 'Other' && (
              <input
                type="text"
                value={availabilityCustom}
                onChange={(e) => setAvailabilityCustom(e.target.value)}
                maxLength={500}
                required
                placeholder="When are you usually free to train?"
                className="w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 text-sm outline-none focus:border-[#1677ff]"
              />
            )}
            <input type="hidden" name="trainingAvailability" value={availabilityValue} />
          </div>

          {/* Injury considerations — option chips + Other (optional) */}
          <div className="space-y-3">
            <p className="text-sm font-bold">Injury considerations (optional)</p>
            <div className="flex flex-wrap gap-2">
              {injuryOptions.map((option) => (
                <label
                  key={option}
                  className={`relative cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                    injuryChoice === option ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="radio"
                    name="injuryChoice"
                    value={option}
                    checked={injuryChoice === option}
                    onChange={() => setInjuryChoice(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
              <label
                className={`relative cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                  injuryChoice === 'Other' ? selectedClass : unselectedClass
                }`}
              >
                <input
                  type="radio"
                  name="injuryChoice"
                  value="Other"
                  checked={injuryChoice === 'Other'}
                  onChange={() => setInjuryChoice('Other')}
                  className="sr-only"
                />
                Other
              </label>
            </div>
            {injuryChoice === 'Other' && (
              <input
                type="text"
                value={injuryCustom}
                onChange={(e) => setInjuryCustom(e.target.value)}
                maxLength={1000}
                placeholder="Describe the injury or health note…"
                className="w-full rounded-xl border border-[#9db1c8] bg-white px-4 py-3 text-sm outline-none focus:border-[#1677ff]"
              />
            )}
            <input type="hidden" name="injuryConsiderations" value={injuryValue} />
            <div className="rounded-xl border border-[#1677ff]/15 bg-[#eaf3ff] p-4 text-xs leading-5 text-[#334b65]">
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1677ff]" />
                <span>
                  {healthDataNotice}{' '}
                  <Link
                    href={privacyURL}
                    className="font-black text-[#1677ff] underline underline-offset-2"
                  >
                    Read the privacy notice
                  </Link>
                  .
                </span>
              </p>
              <label className="mt-3 flex cursor-pointer items-start gap-2 font-bold text-[#092c59]">
                <input
                  required
                  type="checkbox"
                  name="healthDataConsent"
                  value="true"
                  className="mt-0.5 h-4 w-4 accent-[#1677ff]"
                />
                <span>I understand and consent to this use of my injury and health notes.</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-[#fff0f0] p-3 text-sm font-semibold text-[#a53d3d]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white disabled:opacity-60"
          >
            {pending ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                Complete onboarding <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
