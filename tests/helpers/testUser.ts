export const testUser = {
  email: `e2e-${process.env.TEST_RUN_ID || 'unconfigured'}@example.invalid`,
  password: 'isolated-e2e-password-only',
  roles: ['admin'] as ('admin' | 'coach' | 'student')[],
}
