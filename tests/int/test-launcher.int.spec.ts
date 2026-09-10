import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { testCommand } from '../helpers/testCommand'

describe('isolated test launchers', () => {
  it('rejects direct fixture startup without a disposable environment', () => {
    const fixture = fileURLToPath(new URL('../fixtures/adminUser.ts', import.meta.url))
    const result = spawnSync(process.execPath, ['--import=tsx', fixture, 'seed'], {
      env: { ...process.env, NODE_OPTIONS: '', TEST_DATABASE_URL: '', APP_TEST_MODE: 'unit' },
      encoding: 'utf8',
      windowsHide: true,
      timeout: 20000,
    })
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Unsafe test database configuration')
  }, 25000)
  it('lets Playwright use its own loader and preserves command arguments', () => {
    const args = testCommand('e2e', ['--list'])
    expect(args).not.toContain('--import=tsx')
    expect(args.slice(1)).toEqual(['test', '--config', 'playwright.config.ts', '--list'])
  })
  it('preserves the working database-test launcher', () => {
    expect(testCommand('db').slice(0, 1)).toEqual(['--import=tsx'])
    expect(testCommand('db').slice(2)).toEqual(['run', '--config', 'vitest.database.config.mts'])
  })
  it('reaches the safety guard rather than crashing in chained ESM loaders', () => {
    // No disposable credentials: list-only must abort at the config guard,
    // before loading tests, starting a web server, or connecting to MongoDB.
    const result = spawnSync(process.execPath, testCommand('e2e', ['--list']), {
      env: { ...process.env, NODE_OPTIONS: '', TEST_DATABASE_URL: '', APP_TEST_MODE: 'unit' },
      encoding: 'utf8',
      windowsHide: true,
      timeout: 20000,
    })
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Unsafe test database configuration')
    expect(result.stderr).not.toContain('ERR_INVALID_URL_SCHEME')
  }, 25000)
})
