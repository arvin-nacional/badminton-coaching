export type CoachingPricing = {
  assessmentFeePHP?: number | null
  courtFeeMaxPerHourPHP?: number | null
  courtFeeMinPerHourPHP?: number | null
  courtFeeNote?: string | null
  billingNote?: string | null
  label?: string | null
  session60PHP?: number | null
  session90PHP?: number | null
  session120PHP?: number | null
}

export const defaultCoachingPricing = {
  assessmentFeePHP: 900,
  courtFeeMaxPerHourPHP: 600,
  courtFeeMinPerHourPHP: 275,
  session60PHP: 900,
  session90PHP: 1300,
  session120PHP: 1700,
} as const

const peso = new Intl.NumberFormat('en-PH', {
  currency: 'PHP',
  maximumFractionDigits: 0,
  style: 'currency',
})

const amount = (value: number | null | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const roundEstimate = (value: number) => Math.round(value / 25) * 25

export const formatPeso = (value: number) =>
  peso.format(value).replace('PHP', '₱').replace(/\s/g, '')

export const sessionCoachingFee = (durationMinutes: number, pricing?: CoachingPricing | null) => {
  if (durationMinutes === 90)
    return amount(pricing?.session90PHP, defaultCoachingPricing.session90PHP)
  if (durationMinutes === 120)
    return amount(pricing?.session120PHP, defaultCoachingPricing.session120PHP)
  return amount(pricing?.session60PHP, defaultCoachingPricing.session60PHP)
}

export const assessmentCoachingFee = (pricing?: CoachingPricing | null) =>
  amount(pricing?.assessmentFeePHP, defaultCoachingPricing.assessmentFeePHP)

export const expectedCourtFeeRange = (
  durationMinutes: number,
  pricing?: CoachingPricing | null,
): [number, number] => {
  const hours = Math.max(durationMinutes, 60) / 60
  return [
    roundEstimate(
      amount(pricing?.courtFeeMinPerHourPHP, defaultCoachingPricing.courtFeeMinPerHourPHP) * hours,
    ),
    roundEstimate(
      amount(pricing?.courtFeeMaxPerHourPHP, defaultCoachingPricing.courtFeeMaxPerHourPHP) * hours,
    ),
  ]
}

export const expectedTotalRange = (
  coachingFee: number,
  durationMinutes: number,
  pricing?: CoachingPricing | null,
): [number, number] => {
  const [courtMin, courtMax] = expectedCourtFeeRange(durationMinutes, pricing)
  return [coachingFee + courtMin, coachingFee + courtMax]
}

export const formatPesoRange = ([minimum, maximum]: [number, number]) =>
  minimum === maximum ? formatPeso(minimum) : `${formatPeso(minimum)}–${formatPeso(maximum)}`
