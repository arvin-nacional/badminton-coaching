import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import React from 'react'

import { Error } from '../Error'
import { FieldLabel, formInputClass } from '../FieldLabel'
import { Width } from '../Width'

// Extends the plugin's TextField with our custom `validation` select added
// via formOverrides in src/plugins/index.ts.
type ValidatedTextField = TextField & { validation?: 'none' | 'phone' | null }

const PHONE_REGEX = /^\+?\d{11,12}$/

const phoneValidator = (value: string | undefined) => {
  if (!value) return true
  const digits = value.replace(/[\s\-()]/g, '')
  if (!PHONE_REGEX.test(digits)) {
    return 'Enter 11–12 digits, e.g. 09123456789 or +639123456789.'
  }
  return true
}

export const Text: React.FC<
  ValidatedTextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, validation, width }) => {
  const hasPhoneValidation = validation === 'phone'

  return (
    <Width width={width}>
      <FieldLabel htmlFor={name} required={required}>
        {label}
      </FieldLabel>
      <Input
        className={formInputClass}
        defaultValue={defaultValue}
        id={name}
        inputMode={hasPhoneValidation ? 'tel' : 'text'}
        placeholder={hasPhoneValidation ? '' : undefined}
        type="text"
        {...register(name, {
          required,
          ...(hasPhoneValidation ? { validate: phoneValidator } : {}),
        })}
      />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
