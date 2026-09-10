import type { JobsConfig } from 'payload'

import { adminsOnly } from '@/access/cms'
import { sendAssessmentReminderTask } from './sendAssessmentReminder'

export const jobs: JobsConfig = {
  autoRun: [{ cron: '* * * * *', limit: 50, queue: 'assessment-reminders' }],
  access: {
    cancel: adminsOnly,
    queue: adminsOnly,
    run: ({ req }) => {
      if (adminsOnly({ req })) return true
      const secret = process.env.CRON_SECRET
      return Boolean(secret && req.headers.get('authorization') === `Bearer ${secret}`)
    },
  },
  // The job endpoints and ordinary REST/GraphQL collection operations have
  // separate access checks. Protect both, including job input and error logs.
  jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
    ...defaultJobsCollection,
    access: {
      ...defaultJobsCollection.access,
      admin: adminsOnly,
      create: adminsOnly,
      read: adminsOnly,
      update: adminsOnly,
      delete: adminsOnly,
    },
  }),
  tasks: [sendAssessmentReminderTask],
}
