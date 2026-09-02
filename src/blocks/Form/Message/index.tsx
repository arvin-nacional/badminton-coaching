import RichText from '@/components/RichText'
import React from 'react'

import { Width } from '../Width'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export const Message: React.FC<{ message: DefaultTypedEditorState }> = ({ message }) => {
  return (
    <Width
      className="rounded-xl bg-[#eaf3ff] px-4 py-3 text-sm leading-6 text-[#334b65]"
      width="100"
    >
      {message && <RichText data={message} enableGutter={false} enableProse={false} />}
    </Width>
  )
}
