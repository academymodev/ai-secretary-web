const { test, expect } = require('@playwright/test')
const { TEST_PASSWORD } = require('./helpers/auth')

test.describe('Dashboard', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')
  test.beforeEach(async ({ page }) => { await page.goto('/dashboard') })

  test('dashboard page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /daily briefing/i })).toBeVisible()
  })

  test('briefing section visible', async ({ page }) => {
    await expect(page.getByText('Daily Briefing')).toBeVisible()
  })

  test('navigation sidebar has all main links', async ({ page }) => {
    await page.goto('/dashboard')
    const navItems = ['Chat', 'Tasks', 'Contacts', 'Email', 'Calendar', 'Settings']
    for (const item of navItems) {
      await expect(page.getByRole('link', { name: item }).first()).toBeVisible()
    }
  })

  test('nav links navigate correctly', async ({ page }) => {
    const routes = [
      { name: 'Chat',     url: /chat/     },
      { name: 'Tasks',    url: /tasks/    },
      { name: 'Contacts', url: /contacts/ },
    ]
    for (const { name, url } of routes) {
      await page.goto('/dashboard')
      await page.getByRole('link', { name }).first().click()
      await expect(page).toHaveURL(url, { timeout: 10_000 })
    }
  })
})
