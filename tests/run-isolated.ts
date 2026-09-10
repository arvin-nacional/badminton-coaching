import { randomBytes } from 'node:crypto'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import {
  assertTestDatabase,
  configureTestEnvironment,
  testMarkerID,
} from '../src/testing/environment'
import { testCommand } from './helpers/testCommand'

const mode = process.argv[2]
if (mode !== 'db' && mode !== 'e2e') throw new Error('Choose db or e2e.')
if (process.env.TEST_DATABASE_URL)
  throw new Error('Do not supply a database URL. This runner creates its own disposable MongoDB.')
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1')
  throw new Error('Tests cannot run in production.')

const runID = randomBytes(12).toString('hex')
const token = randomBytes(32).toString('hex')
const rootPassword = randomBytes(32).toString('hex')
const name = `badminton-tests-${runID}`
const database = `badminton_test_${runID}`
const username = `test_${runID}`
// Inherit only OS essentials, not provider credentials or NODE_OPTIONS preloads.
const env: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  PAYLOAD_SECRET: '',
  DATABASE_URL: '',
  NEXT_PUBLIC_SERVER_URL: '',
  VERCEL_PROJECT_PRODUCTION_URL: '',
}
for (const [key, value] of Object.entries(process.env)) {
  if (
    /^(path|systemroot|windir|comspec|systemdrive|temp|tmp|home|userprofile|appdata|localappdata|programdata|programfiles|programfiles\(x86\)|ci|pathext)$/i.test(
      key,
    )
  )
    env[key] = value
}
const dockerHost =
  process.platform === 'win32' ? 'npipe:////./pipe/docker_engine' : 'unix:///var/run/docker.sock'
function docker(args: string[], required = true) {
  const result = spawnSync('docker', ['--host', dockerHost, ...args], {
    env,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 20000,
  })
  if (required && (result.error || result.status !== 0)) {
    // Never print credential-bearing arguments or the fixture eval script.
    throw new Error(
      `Docker ${args[0]} failed. Start local Docker and install mongo:8.0 (docker pull mongo:8.0).`,
    )
  }
  return result.status === 0 ? result.stdout.trim() : ''
}

let containerID = ''
let child: ChildProcess | undefined
function cleanup() {
  if (!containerID) return
  const label = docker(
    ['inspect', '--format', '{{ index .Config.Labels "badminton.test-run" }}', containerID],
    false,
  )
  if (label === runID) {
    docker(['rm', '--force', containerID])
    containerID = ''
  } else throw new Error(`Cannot verify ownership of test container ${name}; cleanup aborted.`)
}
function interrupt() {
  if (child?.pid) {
    if (process.platform === 'win32')
      spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore',
      })
    else {
      try {
        process.kill(-child.pid, 'SIGTERM')
      } catch {
        /* already exited */
      }
    }
  }
  try {
    cleanup()
  } finally {
    process.exit(130)
  }
}
process.once('SIGINT', interrupt)
process.once('SIGTERM', interrupt)

try {
  docker(['info', '--format', '{{.ServerVersion}}'])
  containerID = docker([
    'run',
    '--detach',
    '--rm',
    '--pull=never',
    '--name',
    name,
    '--label',
    `badminton.test-run=${runID}`,
    '--publish',
    '127.0.0.1::27017',
    '--mount',
    'type=tmpfs,destination=/data/db',
    '--mount',
    'type=tmpfs,destination=/data/configdb',
    '--env',
    'MONGO_INITDB_ROOT_USERNAME=test_root',
    '--env',
    `MONGO_INITDB_ROOT_PASSWORD=${rootPassword}`,
    'mongo:8.0',
  ])
  if (!/^[a-f0-9]{64}$/.test(containerID)) throw new Error('Unexpected Docker container identity.')
  const admin = [
    'exec',
    containerID,
    'mongosh',
    '--quiet',
    '--username',
    'test_root',
    '--password',
    rootPassword,
    '--authenticationDatabase',
    'admin',
  ]
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    // The image briefly runs an unauthenticated bootstrap mongod. Wait for
    // the final authenticated server, not just a successful bootstrap ping.
    if (
      docker(
        [
          ...admin,
          '--eval',
          'db.adminCommand({getCmdLineOpts:1}).parsed.security?.authorization === "enabled" ? 1 : 0',
        ],
        false,
      ) === '1'
    ) {
      ready = true
      break
    }
    await delay(1000)
  }
  if (!ready) throw new Error('Disposable MongoDB did not become ready.')
  const portMatch = docker(['port', containerID, '27017/tcp']).match(/^127\.0\.0\.1:(\d+)$/)
  if (!portMatch) throw new Error('MongoDB must be bound only to loopback.')
  const url = `mongodb://${username}:${token}@127.0.0.1:${portMatch[1]}/${database}?authSource=${database}&directConnection=true`
  Object.assign(env, {
    APP_TEST_MODE: 'database',
    TEST_DATABASE_DISPOSABLE: '1',
    TEST_RUN_ID: runID,
    TEST_DATABASE_TOKEN: token,
    TEST_DATABASE_URL: url,
    DATABASE_URL: url,
    NODE_ENV: 'test',
  })
  assertTestDatabase(env)
  configureTestEnvironment('database', env)
  docker([
    ...admin,
    '--eval',
    `
    const testDB = db.getSiblingDB(${JSON.stringify(database)});
    testDB.createUser({user:${JSON.stringify(username)},pwd:${JSON.stringify(token)},roles:[{role:'readWrite',db:${JSON.stringify(database)}}]});
    testDB.getCollection('_test-isolation').insertOne({_id:${JSON.stringify(testMarkerID)},runID:${JSON.stringify(runID)},token:${JSON.stringify(token)}});
  `,
  ])
  console.log(
    `Running ${mode} tests in disposable MongoDB (${name}). No ordinary .env credentials are used.`,
  )
  child = spawn(process.execPath, testCommand(mode, process.argv.slice(3)), {
    env,
    stdio: 'inherit',
    windowsHide: true,
    detached: process.platform !== 'win32',
  })
  process.exitCode = await new Promise<number>((resolve, reject) => {
    child!.once('error', reject)
    child!.once('exit', (code) => resolve(code ?? 1))
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Isolated test run failed.')
  process.exitCode = 1
} finally {
  cleanup()
}
