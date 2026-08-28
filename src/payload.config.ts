import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { coachingCollections } from './collections/Coaching'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { CoachingSettings } from './CoachingSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { dropLegacyBookingSlotIndex } from './utilities/dropLegacyBookingSlotIndex'
import { syncFoundationsHomepage } from './utilities/syncFoundationsHomepage'
import { sendAssessmentReminderTask } from './jobs/sendAssessmentReminder'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const resendFrom = process.env.RESEND_FROM_EMAIL || ''
const resendFromMatch = resendFrom.match(/^(.+?)\s*<([^>]+)>$/)
const defaultFromName =
  process.env.RESEND_FROM_NAME || resendFromMatch?.[1]?.trim() || 'Next Shot Badminton'
const defaultFromAddress =
  process.env.RESEND_FROM_ADDRESS || resendFromMatch?.[2]?.trim() || resendFrom

export default buildConfig({
  onInit: async (payload) => {
    await dropLegacyBookingSlotIndex(payload)
    await syncFoundationsHomepage(payload)
  },
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress,
    defaultFromName,
  }),
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  collections: [Pages, Posts, Media, Categories, Users, ...coachingCollections],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, CoachingSettings],
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: {
          // Enable direct uploads to S3
          // This bypasses the Vercel serverless function size limits
          disableLocalStorage: true,
          // Enable signed downloads for better performance with large files
          signedDownloads: true,
        },
      },
      // Enable client uploads directly to S3
      // This is configured at the plugin level
      clientUploads: true,
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        forcePathStyle: true,
      },
    }),
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    autoRun: [{ cron: '* * * * *', limit: 50, queue: 'assessment-reminders' }],
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [sendAssessmentReminderTask],
  },
})
