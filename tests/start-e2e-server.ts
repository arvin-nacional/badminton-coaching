import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { configureTestEnvironment } from '../src/testing/environment'

configureTestEnvironment('database')
const require = createRequire(import.meta.url)
const child = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', '3107'],
  {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit',
    windowsHide: true,
  },
)
child.once('error', () => {
  process.exitCode = 1
})
child.once('exit', (code) => {
  process.exitCode = code ?? 1
})
process.once('SIGTERM', () => child.kill('SIGTERM'))
process.once('SIGINT', () => child.kill('SIGINT'))
