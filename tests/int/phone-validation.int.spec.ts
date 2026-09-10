import { describe, expect, it } from 'vitest'

import {
  isValidPhoneNumber,
  normalizePhoneNumber,
  PHONE_VALIDATION_MESSAGE,
  validatePhoneNumber,
} from '@/utilities/validatePhoneNumber'

describe('phone number validation', () => {
  it.each([
    ['09123456789', 'local 11-digit mobile'],
    ['+639123456789', 'international 12-digit with plus'],
    ['639123456789', '12 digits without plus'],
    ['0912 345 6789', 'spaces are ignored'],
    ['0912-345-6789', 'dashes are ignored'],
    ['(0912) 345 6789', 'parentheses are ignored'],
    ['+63 912 345 6789', 'international with spaces'],
  ])('accepts %s (%s)', (value) => {
    expect(isValidPhoneNumber(value)).toBe(true)
    expect(validatePhoneNumber(value)).toBe(true)
  })

  it.each([
    ['0912345678', '10 digits is too short'],
    ['6391234567890', '13 digits is too long'],
    ['09123456789a', 'letters are rejected'],
    ['++639123456789', 'double plus'],
    ['0912345678+9', 'plus in the middle'],
    ['+', 'plus alone'],
    ['abc', 'non-numeric'],
  ])('rejects %s (%s)', (value) => {
    expect(isValidPhoneNumber(value)).toBe(false)
    expect(validatePhoneNumber(value)).toBe(PHONE_VALIDATION_MESSAGE)
  })

  // The rule is "11–12 digits, optionally prefixed with +". It does not check
  // the country code, so "+" followed by 11 digits passes even though it is not
  // a real PH number. Pinned here so tightening it later is a conscious change.
  it('accepts a plus followed by 11 digits because the rule only counts digits', () => {
    expect(isValidPhoneNumber('+63912345678')).toBe(true)
  })

  it('lets `required` decide for empty values', () => {
    expect(validatePhoneNumber('')).toBe(true)
    expect(validatePhoneNumber('   ')).toBe(true)
    expect(validatePhoneNumber(undefined)).toBe(true)
    expect(validatePhoneNumber(null)).toBe(true)
  })

  it('normalizes formatting characters but keeps the plus sign', () => {
    expect(normalizePhoneNumber('+63 (912) 345-6789')).toBe('+639123456789')
  })
})
