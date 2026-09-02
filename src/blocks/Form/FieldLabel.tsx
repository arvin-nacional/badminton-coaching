import * as React from 'react'

// Shared classes so every form-builder field matches the booking, signup and
// onboarding forms (rounded-xl, navy border, blue focus ring).
export const formInputClass =
  'h-auto w-full rounded-xl border border-[#092c59]/20 bg-white px-4 py-3 text-sm font-normal text-[#092c59] shadow-none outline-none transition placeholder:text-[#91a0b1] focus:border-[#1677ff] focus-visible:border-[#1677ff] focus-visible:ring-4 focus-visible:ring-[#1677ff]/10 focus-visible:outline-none'

export const formSelectTriggerClass =
  'h-auto w-full rounded-xl border border-[#092c59]/20 bg-white px-4 py-3 text-sm font-normal text-[#092c59] shadow-none data-[placeholder]:text-[#91a0b1] focus:border-[#1677ff] focus-visible:ring-4 focus-visible:ring-[#1677ff]/10 focus-visible:outline-none'

export const FieldLabel: React.FC<{
  children: React.ReactNode
  htmlFor: string
  required?: boolean
}> = ({ children, htmlFor, required }) => (
  <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-[#092c59]">
    {children}
    {required ? (
      <span className="text-[#1677ff]">
        {' '}
        *<span className="sr-only">(required)</span>
      </span>
    ) : (
      <span className="font-medium text-[#718399]"> (optional)</span>
    )}
  </label>
)
