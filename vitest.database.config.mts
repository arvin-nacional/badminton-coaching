import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { configureTestEnvironment } from './src/testing/environment'

configureTestEnvironment('database')

export default defineConfig({
  envFile: false,
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/database/**/*.db.spec.ts'],
    setupFiles: ['./tests/database/setup.ts'],
    fileParallelism: false,
    hookTimeout: 60000,
  },
})
