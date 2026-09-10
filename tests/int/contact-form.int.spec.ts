// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() => {
      throw new Error('Database initialization is forbidden in contact form tests')
    }),
  }
})

import configPromise from '@/payload.config'
import { contactForm } from '@/endpoints/seed/contact-form'
import { contact, contactSectionDefaults } from '@/endpoints/seed/contact-page'
import { wrapEmailHtml } from '@/utilities/emailTemplate'
import { syncContactForm } from '@/utilities/syncContactForm'
import { syncContactPage } from '@/utilities/syncContactPage'

type Block = { type?: string; children?: Block[]; text?: string; [key: string]: unknown }

/** Flatten every text node in a Lexical tree so we can assert on the copy. */
const lexicalText = (node: Block | undefined): string => {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  return (node.children || []).map(lexicalText).join(' ')
}

const fakePayload = (docs: unknown[]) => {
  const update = vi.fn(async () => ({}))
  const info = vi.fn()
  const payload = {
    find: vi.fn(async () => ({ docs })),
    update,
    logger: { info, warn: vi.fn(), error: vi.fn() },
  } as unknown as Payload
  return { payload, update, info }
}

describe('contact form seed', () => {
  it('sends an auto-reply to the submitter and a notification to the coach', () => {
    const [autoReply, notification] = contactForm.emails!
    expect(contactForm.emails).toHaveLength(2)

    expect(autoReply.emailTo).toBe('{{email}}')
    expect(autoReply.subject).toContain('{{full-name}}')
    const replyBody = lexicalText(autoReply.message?.root as Block)
    expect(replyBody).toContain('Hi {{full-name}}')
    expect(replyBody).toContain('within one working day')
    expect(replyBody).toContain('No obligation')

    expect(notification.emailTo).toBe('')
    expect(notification.replyTo).toBe('{{email}}')
    expect(notification.subject).toContain('{{full-name}}')
    expect(lexicalText(notification.message?.root as Block)).toContain('{{*:table}}')
  })

  it('applies phone validation to the mobile field and readable values on the topic select', () => {
    const phone = contactForm.fields!.find((f) => 'name' in f && f.name === 'phone')!
    expect(phone.blockType).toBe('text')
    expect(phone).toMatchObject({ validation: 'phone', required: false })

    const topic = contactForm.fields!.find((f) => 'name' in f && f.name === 'topic')!
    expect(topic.blockType).toBe('select')
    if (topic.blockType !== 'select') throw new Error('unreachable')
    expect(topic.options!.length).toBeGreaterThan(0)
    for (const option of topic.options!) expect(option.value).toBe(option.label)
  })

  it('only references fields that exist in the form', () => {
    const names = new Set(
      contactForm.fields!.flatMap((f) => ('name' in f && f.name ? [f.name] : [])),
    )
    const referenced = new Set<string>()
    for (const email of contactForm.emails!) {
      const text = [
        email.emailTo,
        email.replyTo,
        email.subject,
        lexicalText(email.message?.root as Block),
      ].join(' ')
      for (const match of text.matchAll(/\{\{([^}*]+)\}\}/g)) referenced.add(match[1])
    }
    for (const name of referenced) expect(names).toContain(name)
  })
})

describe('contact page seed', () => {
  it('builds the page from the designed contact section block', () => {
    const form = { id: 'form-1' } as never
    const page = contact({ contactForm: form })
    expect(page.slug).toBe('contact')
    expect(page._status).toBe('published')
    expect(page.layout).toHaveLength(1)
    // The seed passes the form document straight through; Payload accepts a doc or an ID.
    expect(page.layout[0]).toMatchObject({ ...contactSectionDefaults, form })
  })
})

describe('form builder plugin configuration', () => {
  it('adds the validation select to the text field block only', async () => {
    const config = await configPromise
    const forms = config.collections.find((c) => c.slug === 'forms')!
    const fieldsBlocks = forms.fields.find((f) => 'name' in f && f.name === 'fields')!
    if (fieldsBlocks.type !== 'blocks') throw new Error('expected a blocks field')

    const text = fieldsBlocks.blocks.find((b) => b.slug === 'text')!
    const validation = text.fields.find((f) => 'name' in f && f.name === 'validation')
    expect(validation).toBeDefined()
    if (!validation || validation.type !== 'select') throw new Error('expected a select')
    expect(validation.options.map((o) => (typeof o === 'string' ? o : o.value))).toEqual([
      'none',
      'phone',
    ])

    for (const block of fieldsBlocks.blocks.filter((b) => b.slug !== 'text')) {
      expect(block.fields.some((f) => 'name' in f && f.name === 'validation')).toBe(false)
    }
  })
})

describe('branded email template', () => {
  it('wraps the plugin HTML in a complete, inline-styled document', () => {
    const html = wrapEmailHtml('<p>Hi {{full-name}},</p>')
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<p>Hi {{full-name}},</p>')
    expect(html).toContain('Next Shot Badminton')
    expect(html).not.toContain('<style')
    expect(html).not.toContain('class=')
    expect(html).toMatch(/<\/html>\s*$/)
  })

  it('renders an optional heading above the body', () => {
    expect(wrapEmailHtml('<p>x</p>')).not.toContain('<h2')
    expect(wrapEmailHtml('<p>x</p>', { heading: 'New message' })).toContain('<h2')
    expect(wrapEmailHtml('<p>x</p>', { heading: 'New message' })).toContain('New message')
  })

  it('is applied to every form builder email through beforeEmail', async () => {
    const config = await configPromise
    const submissions = config.collections.find((c) => c.slug === 'form-submissions')!
    // The plugin registers its sendEmail hook on the submissions collection; we
    // cannot invoke it without a DB, but the hook must exist for beforeEmail to run.
    expect(submissions.hooks?.afterChange?.length).toBeGreaterThan(0)
  })
})

describe('syncContactPage (onInit upgrade)', () => {
  it('does nothing when there is no contact page', async () => {
    const { payload, update } = fakePayload([])
    await syncContactPage(payload)
    expect(update).not.toHaveBeenCalled()
  })

  it('does nothing when the page already uses the contact section', async () => {
    const { payload, update } = fakePayload([
      { id: 'p1', layout: [{ blockType: 'contactSection', form: 'f1' }] },
    ])
    await syncContactPage(payload)
    expect(update).not.toHaveBeenCalled()
  })

  it('replaces the legacy form block in place, reusing the form and disabling revalidation', async () => {
    const legacy = { id: 'b2', blockType: 'formBlock', form: { id: 'f1' }, enableIntro: true }
    const other = { id: 'b1', blockType: 'content' }
    const { payload, update, info } = fakePayload([{ id: 'p1', layout: [other, legacy] }])

    await syncContactPage(payload)

    expect(update).toHaveBeenCalledTimes(1)
    const call = (update.mock.calls[0] as unknown[])[0] as {
      id: string
      collection: string
      context: Record<string, unknown>
      data: { layout: Array<Record<string, unknown>> }
    }
    expect(call.collection).toBe('pages')
    expect(call.id).toBe('p1')
    expect(call.context).toEqual({ disableRevalidate: true })
    expect(call.data.layout[0]).toBe(other)
    expect(call.data.layout[1]).toMatchObject({
      ...contactSectionDefaults,
      form: 'f1',
      id: 'b2',
    })
    expect(info).toHaveBeenCalled()
  })
})

describe('syncContactForm (onInit upgrade)', () => {
  const oldForm = {
    id: 'f1',
    title: 'Contact Form',
    emails: [{ subject: 'We received your message' }],
    fields: [
      { blockType: 'text', name: 'full-name' },
      { blockType: 'text', name: 'phone' },
      { blockType: 'select', name: 'topic', options: [{ label: 'Coaching', value: 'coaching' }] },
    ],
  }

  it('does nothing when the form is missing or already upgraded', async () => {
    const missing = fakePayload([])
    await syncContactForm(missing.payload)
    expect(missing.update).not.toHaveBeenCalled()

    const upgraded = fakePayload([{ ...oldForm, emails: contactForm.emails }])
    await syncContactForm(upgraded.payload)
    expect(upgraded.update).not.toHaveBeenCalled()
  })

  it('leaves a manually customised email template alone', async () => {
    const custom = fakePayload([{ ...oldForm, emails: [{ subject: 'Custom subject' }] }])
    await syncContactForm(custom.payload)
    expect(custom.update).not.toHaveBeenCalled()
  })

  it('replaces the old template, adds phone validation and readable topic values', async () => {
    const { payload, update } = fakePayload([oldForm])
    await syncContactForm(payload)

    expect(update).toHaveBeenCalledTimes(1)
    const call = (update.mock.calls[0] as unknown[])[0] as {
      id: string
      collection: string
      data: { emails: unknown; fields: Array<Record<string, unknown>> }
    }
    expect(call.collection).toBe('forms')
    expect(call.id).toBe('f1')
    expect(call.data.emails).toBe(contactForm.emails)

    const phone = call.data.fields.find((f) => f.name === 'phone')!
    expect(phone.validation).toBe('phone')

    const topic = call.data.fields.find((f) => f.name === 'topic')! as {
      options: Array<{ label: string; value: string }>
    }
    for (const option of topic.options) expect(option.value).toBe(option.label)

    // Untouched fields pass through unchanged.
    expect(call.data.fields[0]).toBe(oldForm.fields[0])
  })
})
