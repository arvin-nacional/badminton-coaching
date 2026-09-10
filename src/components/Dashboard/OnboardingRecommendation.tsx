import Link from 'next/link'
import type { ProgramLevel } from '@/utilities/recommendProgram'
import type { AssessmentStatus } from '@/utilities/assessmentStatus'
import { suggestedTrackLabels } from '@/utilities/studentOnboarding'

export function OnboardingRecommendation({
  level,
  hasAssignedProgram = false,
  assessmentStatus = 'required',
  showActions = true,
}: {
  level?: ProgramLevel | null
  hasAssignedProgram?: boolean
  assessmentStatus?: AssessmentStatus
  showActions?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[#092c59]/10 bg-[#f3f7fc] p-5 text-[#092c59]">
      <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">
        {hasAssignedProgram || assessmentStatus === 'current'
          ? 'Questionnaire suggestion'
          : 'Suggested starting track'}
      </p>
      <p className="mt-2 text-2xl font-black">
        {level ? suggestedTrackLabels[level] : 'To be discussed with your coach'}
      </p>
      <p className="mt-3 text-sm font-bold text-[#607286]">
        {hasAssignedProgram
          ? 'Your existing program is unchanged. These answers are for your coach to review.'
          : assessmentStatus === 'current'
            ? 'Your assessment is complete. Your coach will use the findings to confirm and assign your program.'
            : 'Based on your answers — not yet coach-assessed. This is a suggestion, not an assigned training program.'}
      </p>
      {!hasAssignedProgram && assessmentStatus !== 'current' ? (
        <p className="mt-3 text-sm leading-6 text-[#607286]">
          Your assessment gives you a skill baseline, individual priorities, and recommended next
          steps — even if you do not enroll in ongoing coaching.
        </p>
      ) : null}
      {showActions ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {!hasAssignedProgram && assessmentStatus === 'required' ? (
            <Link
              href="/book-assessment"
              className="rounded-full bg-[#092c59] px-5 py-3 text-sm font-black text-white"
            >
              Book an assessment
            </Link>
          ) : null}
          <Link
            href={hasAssignedProgram ? '/dashboard/student' : '/dashboard/student#starter-practice'}
            className="rounded-full border border-[#092c59]/20 bg-white px-5 py-3 text-sm font-black"
          >
            {hasAssignedProgram ? 'Go to dashboard' : 'Try starter practice'}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
