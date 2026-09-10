import { APIError, type CollectionConfig } from 'payload'

import { adminOrSelf, staffOnly, staffOrSelf } from '../../access/coaching'
import { adminsOnly, cmsStaffOnly } from '@/access/cms'
import { provisionStudentProfile } from './provisionStudentProfile'
import { protectRoles } from './protectRoles'
import { limitPasswordReset } from './limitPasswordReset'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: cmsStaffOnly,
    create: staffOnly,
    delete: adminsOnly,
    read: staffOrSelf,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  endpoints: [
    {
      path: '/first-register',
      method: 'post',
      handler: () =>
        Response.json({ error: 'Web administrator registration is disabled.' }, { status: 403 }),
    },
  ],
  hooks: {
    beforeOperation: [limitPasswordReset],
    beforeChange: [protectRoles],
    beforeLogin: [
      ({ context, user }) => {
        if (user.accountStatus === 'pending' && !context.activatingStudent) {
          throw new APIError('Activate your account from the email we sent before signing in.', 403)
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
        await provisionStudentProfile(user, req)
        if (req.context.activatingStudent && user.accountStatus === 'pending') {
          return req.payload.update({
            collection: 'users',
            id: user.id,
            context: { ...req.context, activatingStudent: false },
            data: {
              accountStatus: 'active',
              invitationAcceptedAt: new Date().toISOString(),
            },
            overrideAccess: true,
            req,
          })
        }
        return user
      },
    ],
  },
  fields: [
    {
      // Until email-change verification exists, a student cannot replace a
      // verified email and keep the verified-booking shortcut.
      name: 'email',
      type: 'email',
      access: { update: adminsOnly },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'googleSubject',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
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
        create: ({ req, data }) =>
          adminsOnly({ req }) ||
          (Array.isArray(data?.roles) && data.roles.every((role: string) => role === 'student')),
        update: adminsOnly,
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
        read: cmsStaffOnly,
        update: adminsOnly,
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
        read: cmsStaffOnly,
        update: adminsOnly,
      },
    },
  ],
  timestamps: true,
}
