// @vitest-environment node

import type { Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { publicGuardStore } from '../helpers/publicGuardStore'

const mocks = vi.hoisted(() => ({
  db: {} as Payload['db'],
  auth: vi.fn(),
  find: vi.fn(),
  findByID: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  sendEmail: vi.fn(),
  logger: { error: vi.fn(), warn: vi.fn() },
  notifications: vi.fn(),
  reminders: vi.fn(),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => mocks) }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers()) }))
vi.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => async () => ({ privacy: { policyVersion: 'test' } }),
}))
vi.mock('@/utilities/sendAssessmentBookingEmails', () => ({
  sendAssessmentBookingEmails: mocks.notifications,
}))
vi.mock('@/utilities/scheduleAssessmentReminders', () => ({
  scheduleAssessmentReminders: mocks.reminders,
}))

import { POST as verify } from '@/app/(frontend)/api/assessment-bookings/verification/route'
import { POST as book } from '@/app/(frontend)/api/assessment-bookings/route'
import { createAssessmentEmailCode } from '@/utilities/assessmentEmailVerification'
import { limitPublicRequest } from '@/utilities/publicRequestProtection'

const guest = {
  slot: 'slot:one',
  playerName: 'Student',
  email: 'student@example.com',
  playingExperience: 'new',
  preferredEvent: 'both',
  goals: 'Learn footwork',
  trainingAvailability: 'Weekends',
  location: 'Test court',
  healthDataConsent: true,
}
const request = (body: unknown) =>
  new Request('https://example.com/api/assessment-bookings', {
    method: 'POST',
    headers: { origin: 'https://example.com' },
    body: JSON.stringify(body),
  })
const verifiedGuest = () => {
  const { token, code } = createAssessmentEmailCode(guest.email)
  return { ...guest, verificationToken: token, verificationCode: code }
}
beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv('PAYLOAD_SECRET', 'test-booking-secret')
  vi.stubEnv('PUBLIC_REQUEST_IP_HEADER', '')
  mocks.db = publicGuardStore().payload.db
  mocks.auth.mockResolvedValue({ user: null })
  mocks.find.mockResolvedValue({ docs: [] })
  mocks.findByID.mockResolvedValue({
    id: 'one',
    coach: 'coach',
    status: 'open',
    startsAt: '2099-01-01T00:00:00Z',
    durationMinutes: 60,
  })
  mocks.create.mockResolvedValue({ id: 'booking' })
  mocks.notifications.mockResolvedValue(undefined)
  mocks.reminders.mockResolvedValue(undefined)
  mocks.update.mockResolvedValue({})
})
afterEach(() => vi.unstubAllEnvs())

describe('public verification email route', () => {
  it('sends a code without creating a booking and blocks rapid resends', async () => {
    const response = await verify(request({ email: ' Student@Example.com ' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toHaveProperty('token')
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: guest.email, text: expect.stringMatching(/code is \d{6}/) }),
    )
    expect((await verify(request({ email: guest.email }))).status).toBe(429)
    expect(mocks.sendEmail).toHaveBeenCalledOnce()
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.reminders).not.toHaveBeenCalled()
  })

  it.each([{ email: 'invalid' }, { email: guest.email, website: 'bot' }])(
    'rejects invalid input without email: %j',
    async (body) => {
      expect((await verify(request(body))).status).toBe(400)
      expect(mocks.sendEmail).not.toHaveBeenCalled()
    },
  )

  it('returns a generic unavailable response on email failure', async () => {
    mocks.sendEmail.mockRejectedValue(new Error('secret-provider-detail'))
    const response = await verify(request({ email: guest.email }))
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('secret-provider-detail')
  })
})

describe('public assessment booking boundary', () => {
  it('requires proof before any guest booking or notifications', async () => {
    expect((await book(request(guest))).status).toBe(403)
    expect(mocks.findByID).not.toHaveBeenCalled()
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.notifications).not.toHaveBeenCalled()
    expect(mocks.reminders).not.toHaveBeenCalled()
  })

  it('books a verified guest and treats retries as success without duplicate notifications', async () => {
    const body = verifiedGuest()
    expect((await book(request(body))).status).toBe(201)
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: guest.email, status: 'confirmed' }),
      }),
    )
    mocks.find.mockResolvedValue({ docs: [{ id: 'booking' }] })
    const retry = await book(request(body))
    expect(retry.status).toBe(200)
    expect(await retry.json()).toEqual({ id: 'booking' })
    expect(mocks.create).toHaveBeenCalledOnce()
    expect(mocks.notifications).toHaveBeenCalledOnce()
    expect(mocks.reminders).toHaveBeenCalledOnce()
  })

  it('cannot reuse a proof for another email or another slot', async () => {
    const body = verifiedGuest()
    expect((await book(request({ ...body, email: 'other@example.com' }))).status).toBe(403)
    expect((await book(request(body))).status).toBe(201)
    expect((await book(request({ ...body, slot: 'slot:two' }))).status).toBe(403)
    expect(mocks.create).toHaveBeenCalledOnce()
  })

  it('does not allow pending students to bypass verification', async () => {
    mocks.auth.mockResolvedValue({
      user: { id: 'student', roles: ['student'], accountStatus: 'pending' },
    })
    expect((await book(request(guest))).status).toBe(403)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('uses an active student’s account email, never a submitted email', async () => {
    mocks.auth.mockResolvedValue({
      user: { id: 'student', email: guest.email, roles: ['student'], accountStatus: 'active' },
    })
    mocks.find.mockImplementation(async ({ collection }: { collection: string }) => ({
      docs: collection === 'student-profiles' ? [{ id: 'profile', displayName: 'Student' }] : [],
    }))
    expect((await book(request({ ...guest, email: 'victim@example.com' }))).status).toBe(201)
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: guest.email, student: 'profile' }),
      }),
    )
  })

  it('rejects exhausted daily reservation attempts without creating or notifying', async () => {
    for (let i = 0; i < 2; i++)
      await limitPublicRequest(
        mocks as unknown as Payload,
        'assessment-reservations-email',
        guest.email,
        2,
        86400,
      )
    expect((await book(request(verifiedGuest()))).status).toBe(429)
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.notifications).not.toHaveBeenCalled()
  })

  it('fails closed before booking when guard storage is unavailable', async () => {
    mocks.db = {} as Payload['db']
    expect((await book(request(verifiedGuest()))).status).toBe(503)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('does not claim a code for an invalid slot', async () => {
    const body = verifiedGuest()
    mocks.findByID.mockResolvedValueOnce(null)
    expect((await book(request(body))).status).toBe(409)
    expect((await book(request({ ...body, slot: 'slot:two' }))).status).toBe(201)
  })

  it('returns a conflict when a different player wins the unique slot race', async () => {
    mocks.create.mockRejectedValue({ code: 11000 })
    expect((await book(request(verifiedGuest()))).status).toBe(409)
    expect(mocks.notifications).not.toHaveBeenCalled()
    expect(mocks.reminders).not.toHaveBeenCalled()
  })
})
