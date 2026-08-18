import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { defaultHeaderActions, defaultHeaderNavItems } from './defaultNavItems'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Center navigation',
      defaultValue: defaultHeaderNavItems,
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        description: 'Links displayed between the logo and the action buttons.',
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'actions',
      type: 'group',
      label: 'Right-side buttons',
      admin: {
        description:
          'These buttons are shown to signed-out visitors. Signed-in users see My dashboard instead.',
      },
      defaultValue: defaultHeaderActions,
      fields: [
        link({
          appearances: false,
          overrides: {
            name: 'secondaryAction',
            label: 'Secondary button',
          },
        }),
        link({
          appearances: false,
          overrides: {
            name: 'primaryAction',
            label: 'Primary button',
          },
        }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
