import { describe, expect, it } from 'vitest'

import { homePracticeName } from '@/collections/Coaching/syncProgramHomePractices'

describe('program home-practice integration', () => {
  it('uses a stable program/week lesson name for generated home-practice plans', () => {
    expect(homePracticeName('Foundations', 3, 'Split, move and recover')).toBe(
      'Foundations - Week 3: Split, move and recover',
    )
  })
})
