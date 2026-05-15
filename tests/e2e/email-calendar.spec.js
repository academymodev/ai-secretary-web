const { test, expect } = require('@playwright/test')
const { TEST_PASSWORD } = require('./helpers/auth')

test.describe('Email', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')
  test.beforeEach(async ({ page }) => {
    await page.goto('/email')
  })

  test('email page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /email|inbox/i })).toBeVisible()
  })

  test('shows connect gmail prompt or email list', async ({ page }) => {
    const hasEmails   = await page.locator('[class*="email"], [class*="message"]').count() > 0
    const hasConnect  = await page.getByText(/connect|gmail|google/i).isVisible()
    expect(hasEmails || hasConnect).toBeTruthy()
  })
})

test.describe('Calendar', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar')
  })

  test('calendar page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /calendar|meetings/i })).toBeVisible()
  })

  test('shows calendar or connect prompt', async ({ page }) => {
    await expect(
      page.locator('[class*="meeting"], [class*="event"]').or(page.getByText(/connect google/i).first())
    ).toBeVisible()
  })
})

test.describe('Reminders', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')

  test('reminders page loads', async ({ page }) => {
    await page.goto('/reminders')
    await expect(page.getByRole('heading', { name: /reminder/i })).toBeVisible()
  })
})
