import { APIError, type CollectionConfig } from 'payload'

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
    beforeLogin: [
      ({ context, user }) => {
        if (user.accountStatus === 'pending' && !context.activatingStudent) {
          throw new APIError(
            'Activate your account from the invitation email before signing in.',
            403,
          )
        }
        return user
      },
    ],
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
        if (req.context.activatingStudent && promotedUser.accountStatus === 'pending') {
          return req.payload.update({
            collection: 'users',
            id: promotedUser.id,
            context: { ...req.context, activatingStudent: false },
            data: {
              accountStatus: 'active',
              invitationAcceptedAt: new Date().toISOString(),
            },
            overrideAccess: true,
            req,
          })
        }
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
    {
      name: 'accountStatus',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Pending invitation', value: 'pending' },
        { label: 'Active', value: 'active' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        read: ({ req }) => isStaffOrBootstrap(req),
        update: ({ req }) => isStaffOrBootstrap(req),
      },
    },
    {
      name: 'invitationAcceptedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        read: ({ req }) => isStaffOrBootstrap(req),
        update: ({ req }) => isStaffOrBootstrap(req),
      },
    },
  ],
  timestamps: true,
}
