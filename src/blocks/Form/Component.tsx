import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import React from 'react'

import { StyledForm } from './StyledForm'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
}

export const FormBlock: React.FC<{ id?: string } & FormBlockType> = ({
  description,
  enableIntro,
  eyebrow,
  form,
  heading,
  introContent,
}) => {
  if (!form || typeof form !== 'object') return null

  return (
    <section className="coach-section bg-[#eaf3ff] text-[#071f42]">
      <div className="mx-auto max-w-[760px]">
        <StyledForm
          description={description}
          eyebrow={eyebrow}
          form={form}
          heading={heading}
          introContent={enableIntro ? introContent : null}
        />
      </div>
    </section>
  )
}
