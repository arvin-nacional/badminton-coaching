import type { CollectionConfig } from 'payload'

import { isStaffOrBootstrap, staffOnly, staffOrSelf } from '../../access/coaching'
import { provisionStudentProfile } from './provisionStudentProfile'
import { promoteBootstrapAdmin } from './promoteBootstrapAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => isStaffOrBootstrap(req),
    create: staffOnly,
    delete: staffOnly,
    read: staffOrSelf,
    update: staffOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await provisionStudentProfile(doc, req)
        return doc
      },
    ],
    afterLogin: [
      async ({ req, user }) => {
        const promotedUser = await promoteBootstrapAdmin(user, req)
        await provisionStudentProfile(promotedUser, req)
        return promotedUser
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['student'],
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Coach', value: 'coach' },
        { label: 'Student', value: 'student' },
      ],
      access: {
        update: ({ req }) => isStaffOrBootstrap(req),
      },
    },
  ],
  timestamps: true,
}
