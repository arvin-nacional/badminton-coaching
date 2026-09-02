import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Textarea as TextAreaComponent } from '@/components/ui/textarea'
import React from 'react'

import { Error } from '../Error'
import { FieldLabel, formInputClass } from '../FieldLabel'
import { Width } from '../Width'

export const Textarea: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, errors, label, register, required, rows = 4, width }) => {
  return (
    <Width width={width}>
      <FieldLabel htmlFor={name} required={required}>
        {label}
      </FieldLabel>
      <TextAreaComponent
        className={`${formInputClass} min-h-28 leading-6`}
        defaultValue={defaultValue}
        id={name}
        rows={rows}
        {...register(name, { required })}
      />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
