'use client'

import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import RichText from '@/components/RichText'
import { getClientSideURL } from '@/utilities/getURL'

import { fields } from './fields'

export type StyledFormProps = {
  form: FormType
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  introContent?: DefaultTypedEditorState | null
  footnote?: string | null
}

/**
 * Renders a Payload form-builder form using the same visual language as the
 * booking, signup and onboarding forms (white rounded card, navy labels, blue
 * focus ring, pill submit button). Shared by the generic Form block and the
 * Contact section block.
 */
export function StyledForm({
  form,
  eyebrow,
  heading,
  description,
  introContent,
  footnote,
}: StyledFormProps) {
  const { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = form
  const formMethods = useForm({ defaultValues: form.fields })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      const submitForm = async () => {
        setError(undefined)
        setIsLoading(true)

        const submissionData = Object.entries(data).map(([field, value]) => ({ field, value }))

        try {
          const request = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({ form: formID, submissionData }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          const result = await request.json().catch(() => ({}))

          if (request.status >= 400) {
            setError(
              result.errors?.[0]?.message || 'We could not send your message. Please try again.',
            )
            return
          }

          setHasSubmitted(true)
          if (confirmationType === 'redirect' && redirect?.url) router.push(redirect.url)
        } catch {
          setError('Something went wrong while sending your message. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }

      void submitForm()
    },
    [confirmationType, formID, redirect, router],
  )

  return (
    <div className="rounded-[2rem] border border-[#092c59]/10 bg-white p-6 shadow-[0_30px_80px_-45px_rgba(9,44,89,.5)] md:p-8">
      {hasSubmitted && confirmationType === 'message' ? (
        <div aria-live="polite">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef9f3] text-[#157347]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="mt-5 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:tracking-[-.03em] [&_h3]:text-2xl [&_h3]:font-black [&_p]:mt-3 [&_p]:leading-7 [&_p]:text-[#586d84]">
            {confirmationMessage ? (
              <RichText data={confirmationMessage} enableGutter={false} enableProse={false} />
            ) : (
              <h2 className="text-3xl font-black">Thanks, your message has been sent.</h2>
            )}
          </div>
        </div>
      ) : (
        <FormProvider {...formMethods}>
          {eyebrow ? <p className="coach-eyebrow">{eyebrow}</p> : null}
          {heading ? (
            <h2 className="mt-2 text-2xl font-black tracking-[-.03em] md:text-3xl">{heading}</h2>
          ) : null}
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[#718399]">{description}</p>
          ) : null}
          {introContent ? (
            <div className="mt-4 text-sm leading-6 text-[#586d84] [&_h2]:text-2xl [&_h2]:font-black [&_h3]:text-xl [&_h3]:font-black">
              <RichText data={introContent} enableGutter={false} enableProse={false} />
            </div>
          ) : null}

          <form
            id={formID}
            onSubmit={handleSubmit(onSubmit)}
            className={eyebrow || heading || description || introContent ? 'mt-6' : ''}
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {form.fields?.map((field, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                if (!Field) return null
                return (
                  <Field
                    key={index}
                    form={form}
                    {...field}
                    {...formMethods}
                    control={control}
                    errors={errors}
                    register={register}
                  />
                )
              })}
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-[#fff0f0] px-4 py-3 text-sm font-semibold text-[#a53d3d]"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#092c59] px-6 py-3.5 font-bold text-white transition hover:bg-[#1677ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  {submitButtonLabel || 'Send message'} <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            {footnote ? (
              <p className="mt-4 text-center text-xs leading-5 text-[#718399]">{footnote}</p>
            ) : null}
          </form>
        </FormProvider>
      )}
    </div>
  )
}
