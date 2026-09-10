import { authenticatedCoachingUser, ownStudentData, staffOnly } from '@/access/coaching'

export const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
  return null
}

export const staffManagedAccess = {
  create: staffOnly,
  delete: staffOnly,
  read: authenticatedCoachingUser,
  update: staffOnly,
}

export const studentRecordAccess = {
  create: staffOnly,
  delete: staffOnly,
  read: ownStudentData,
  update: staffOnly,
}

export const validateHTTPSURL = (value: unknown): true | string => {
  if (typeof value !== 'string' || !value.trim()) return 'Enter a video URL.'

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || 'Use a secure URL beginning with https://.'
  } catch {
    return 'Enter a complete video URL beginning with https://.'
  }
}
