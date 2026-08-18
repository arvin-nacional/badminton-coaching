import { describe, expect, it, vi } from 'vitest'

import { syncStudentProfileAfterAssessmentDelete } from '@/collections/Coaching/syncStudentProfileAfterAssessmentDelete'
import { resolveAssessmentStatus } from '@/utilities/assessmentStatus'

describe('assessment status', () => {
  it('treats a confirmed booking as the source of truth for scheduled assessments', () => {
    expect(resolveAssessmentStatus('required', true)).toBe('scheduled')
    expect(resolveAssessmentStatus('scheduled', true)).toBe('scheduled')
  })

  it('repairs a stale scheduled status when no confirmed booking remains', () => {
    expect(resolveAssessmentStatus('scheduled', false)).toBe('required')
  })

  it('does not reopen an assessment that is already current', () => {
    expect(resolveAssessmentStatus('current', false)).toBe('current')
  })

  it('resets the stored profile when its final confirmed booking is deleted', async () => {
    const findByID = vi.fn().mockResolvedValue({ assessmentStatus: 'scheduled' })
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const update = vi.fn().mockResolvedValue({ assessmentStatus: 'required' })
    const req = { payload: { find, findByID, update } }

    await syncStudentProfileAfterAssessmentDelete({
      doc: { student: 'student-1' },
      req,
    } as never)

    expect(find).toHaveBeenCalledOnce()
    expect(find.mock.calls[0][0].req).toBe(req)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'student-profiles',
        data: { assessmentStatus: 'required' },
        id: 'student-1',
        req,
      }),
    )
  })

  it('keeps the profile scheduled when another confirmed booking remains', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 'booking-2' }] })
    const update = vi.fn()

    await syncStudentProfileAfterAssessmentDelete({
      doc: { student: 'student-1' },
      req: {
        payload: {
          find,
          findByID: vi.fn().mockResolvedValue({ assessmentStatus: 'scheduled' }),
          update,
        },
      },
    } as never)

    expect(update).not.toHaveBeenCalled()
  })
})
