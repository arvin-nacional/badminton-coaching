import type { Header } from '@/payload-types'

export const defaultHeaderNavItems: NonNullable<Header['navItems']> = [
  { link: { label: 'Programs', type: 'custom', url: '/#programs' } },
  { link: { label: 'Pricing', type: 'custom', url: '/#pricing' } },
  { link: { label: 'Assessment', type: 'custom', url: '/#assessment' } },
  { link: { label: 'Contact', type: 'custom', url: '/#contact' } },
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

export const getHeaderNavItems = (data: Header) => {
  const items = data.navItems?.length ? data.navItems : defaultHeaderNavItems
  return items.some((item) => item.link.url === '/#pricing')
    ? items
    : [
        ...items.slice(0, 1),
        { link: { label: 'Pricing', type: 'custom' as const, url: '/#pricing' } },
        ...items.slice(1),
      ]
}

export const getHeaderActions = (data: Header) => ({
  secondaryAction: data.actions?.secondaryAction?.label
    ? data.actions.secondaryAction
    : defaultHeaderActions.secondaryAction,
  primaryAction: data.actions?.primaryAction?.label
    ? data.actions.primaryAction
    : defaultHeaderActions.primaryAction,
})
