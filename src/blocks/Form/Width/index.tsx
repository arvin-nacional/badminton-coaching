import * as React from 'react'

// Form-builder widths are percentages; map them onto the two-column grid used
// by the styled form so half-width fields sit side by side on larger screens.
export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  const numeric = typeof width === 'string' ? Number(width) : width
  const half = typeof numeric === 'number' && numeric > 0 && numeric <= 50
  return (
    <div className={`${half ? 'sm:col-span-1' : 'sm:col-span-2'} ${className || ''}`}>
      {children}
    </div>
  )
}
