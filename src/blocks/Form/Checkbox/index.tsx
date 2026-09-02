import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  return (
    <Width width={width}>
      <label
        htmlFor={name}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#092c59]/15 bg-[#f6f9fd] px-4 py-3 text-sm font-bold text-[#092c59]"
      >
        <input
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#1677ff]"
          defaultChecked={defaultValue}
          id={name}
          type="checkbox"
          {...register(name, { required })}
        />
        <span>
          {label}
          {required ? (
            <span className="text-[#1677ff]">
              {' '}
              *<span className="sr-only">(required)</span>
            </span>
          ) : null}
        </span>
      </label>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
