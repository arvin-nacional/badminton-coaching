import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { cmsWriteAccess } from '@/access/cms'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    ...cmsWriteAccess,
    read: anyone,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
