import { test, expect } from '@playwright/test'

test('can load the public sign-in page without production content fixtures', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Sign in to your dashboard' })).toBeVisible()
})
