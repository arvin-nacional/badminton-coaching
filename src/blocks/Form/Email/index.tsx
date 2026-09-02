import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import React from 'react'

import { Error } from '../Error'
import { FieldLabel, formInputClass } from '../FieldLabel'
import { Width } from '../Width'

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  return (
    <Width width={width}>
      <FieldLabel htmlFor={name} required={required}>
        {label}
      </FieldLabel>
      <Input
        autoComplete="email"
        className={formInputClass}
        defaultValue={defaultValue}
        id={name}
        type="email"
        {...register(name, {
          pattern: { message: 'Enter a valid email address.', value: /^\S[^\s@]*@\S+$/ },
          required,
        })}
      />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
