export type AssessmentStatus = 'required' | 'scheduled' | 'current'

/**
 * A confirmed booking is the source of truth for the scheduled state.
 * This also repairs the rendered state for profiles left as `scheduled`
 * after their booking was deleted before the deletion hook existed.
 */
export function resolveAssessmentStatus(
  profileStatus: AssessmentStatus,
  hasConfirmedBooking: boolean,
): AssessmentStatus {
  if (hasConfirmedBooking) return 'scheduled'
  if (profileStatus === 'scheduled') return 'required'
  return profileStatus
}
