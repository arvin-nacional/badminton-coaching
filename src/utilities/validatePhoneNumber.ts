/**
 * Philippine mobile numbers: 11 digits in local format (09123456789) or 12
 * digits in international format (+639123456789). Spaces, dashes and
 * parentheses are ignored so "0912 345 6789" is accepted.
 */
const PHONE_REGEX = /^\+?\d{11,12}$/

export const PHONE_VALIDATION_MESSAGE = 'Enter 11–12 digits, e.g. 09123456789 or +639123456789.'

export const normalizePhoneNumber = (value: string) => value.replace(/[\s\-()]/g, '')

export const isValidPhoneNumber = (value: string) => PHONE_REGEX.test(normalizePhoneNumber(value))

/** react-hook-form `validate` rule. Empty values pass so `required` decides. */
export const validatePhoneNumber = (value: unknown): true | string => {
  if (typeof value !== 'string' || !value.trim()) return true
  return isValidPhoneNumber(value) || PHONE_VALIDATION_MESSAGE
}
