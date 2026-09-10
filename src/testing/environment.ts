type Environment = Record<string, string | undefined>

export const testServerURL = 'http://127.0.0.1:3107'
export const testMarkerID = 'disposable-test-database'

const disabledVariables = [
  'RESEND_API_KEY',
  'RESEND_FROM_ADDRESS',
  'RESEND_FROM_EMAIL',
  'RESEND_FROM_NAME',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET',
  'S3_REGION',
  'GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'COACH_NOTIFICATION_EMAIL',
  'CRON_SECRET',
  'PREVIEW_SECRET',
  'BOOTSTRAP_ADMIN_EMAIL',
  'BOOTSTRAP_ADMIN_NAME',
  'BOOTSTRAP_ADMIN_PASSWORD',
  'VERCEL_PROJECT_PRODUCTION_URL',
  'PUBLIC_REQUEST_IP_HEADER',
  'PAYLOAD_DROP_DATABASE',
] as const

export function assertTestDatabase(env: Environment = process.env) {
  const fail = (): never => {
    throw new Error(
      'Unsafe test database configuration. Use pnpm test:db or pnpm test:e2e with the disposable Docker runner.',
    )
  }
  if (env.APP_TEST_MODE !== 'database' || env.NODE_ENV === 'production' || env.VERCEL === '1')
    fail()
  const runID = env.TEST_RUN_ID || ''
  const token = env.TEST_DATABASE_TOKEN || ''
  if (!/^[a-f0-9]{24}$/.test(runID) || !/^[a-f0-9]{64}$/.test(token)) fail()
  if (env.TEST_DATABASE_DISPOSABLE !== '1' || !env.TEST_DATABASE_URL) fail()
  // Accept only the runner's exact loopback URI shape. No SRV, alternative
  // authSource, replica hosts, options, encoded names, or production credentials.
  const database = `badminton_test_${runID}`
  const username = `test_${runID}`
  const prefix = `mongodb://${username}:${token}@127.0.0.1:`
  const suffix = `/${database}?authSource=${database}&directConnection=true`
  const url = env.TEST_DATABASE_URL!
  if (!url.startsWith(prefix) || !url.endsWith(suffix)) fail()
  const port = url.slice(prefix.length, -suffix.length)
  if (!/^\d{4,5}$/.test(port) || Number(port) < 1024 || Number(port) > 65535 || port === '27017')
    fail()
  if (env.DATABASE_URL !== url) fail()
  if (env.PAYLOAD_DROP_DATABASE === 'true') fail()
  return { database, runID, token, url }
}

export function configureTestEnvironment(
  mode: 'unit' | 'database',
  env: Environment = process.env,
) {
  // Validate inherited database settings BEFORE replacing anything.
  if (mode === 'database') assertTestDatabase(env)
  env.APP_TEST_MODE = mode
  for (const key of disabledVariables) env[key] = ''
  env.NEXT_PUBLIC_SERVER_URL = testServerURL
  env.__NEXT_PRIVATE_ORIGIN = testServerURL
  env.PAYLOAD_SECRET =
    mode === 'database' ? env.TEST_DATABASE_TOKEN : 'unit-tests-only-not-a-deployment-secret'
  if (mode === 'unit') {
    env.DATABASE_URL = ''
    env.TEST_DATABASE_URL = ''
    env.TEST_DATABASE_TOKEN = ''
    env.TEST_DATABASE_DISPOSABLE = ''
    env.TEST_RUN_ID = ''
  }
}

export function isTestRuntime(env: Environment = process.env) {
  if (env.APP_TEST_MODE === 'database') {
    assertTestDatabase(env)
    return true
  }
  if (env.APP_TEST_MODE === 'unit') {
    if (env.VERCEL === '1' || env.NODE_ENV === 'production')
      throw new Error('Test mode cannot run in production.')
    return true
  }
  if (env.APP_TEST_MODE || env.NODE_ENV === 'test' || env.VITEST) {
    throw new Error('Tests must initialize the isolated test environment before loading Payload.')
  }
  return false
}
