import type { Header } from '@/payload-types'

export const defaultHeaderNavItems: NonNullable<Header['navItems']> = [
  { link: { label: 'Programs', type: 'custom', url: '/#programs' } },
  { link: { label: 'Assessment', type: 'custom', url: '/#assessment' } },
  { link: { label: 'How it works', type: 'custom', url: '/#contact' } },
]

export const defaultHeaderActions = {
  secondaryAction: {
    label: 'Student login',
    type: 'custom' as const,
    url: '/login?redirect=/dashboard/student',
  },
  primaryAction: {
    label: 'Get started',
    type: 'custom' as const,
    url: '/signup',
  },
}

export const getHeaderNavItems = (data: Header) =>
  data.navItems?.length ? data.navItems : defaultHeaderNavItems

export const getHeaderActions = (data: Header) => ({
  secondaryAction: data.actions?.secondaryAction?.label
    ? data.actions.secondaryAction
    : defaultHeaderActions.secondaryAction,
  primaryAction: data.actions?.primaryAction?.label
    ? data.actions.primaryAction
    : defaultHeaderActions.primaryAction,
})
