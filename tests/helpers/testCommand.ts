import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export function testCommand(mode: 'db' | 'e2e', extraArgs: string[] = []) {
  if (mode === 'db') {
    const bin = require.resolve('vitest/package.json').replace(/package\.json$/, 'vitest.mjs')
    return ['--import=tsx', bin, 'run', '--config', 'vitest.database.config.mts', ...extraArgs]
  }
  // Playwright registers its own TypeScript/ESM loader. Preloading tsx here
  // chains two loaders and breaks file-URL resolution on Windows/Node 20.9.
  return [
    require.resolve('@playwright/test/cli'),
    'test',
    '--config',
    'playwright.config.ts',
    ...extraArgs,
  ]
}
