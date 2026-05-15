const { test, expect } = require('@playwright/test')
const { TEST_PASSWORD } = require('./helpers/auth')

test.describe('Settings', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('settings page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })

  test('profile section visible', async ({ page }) => {
    await expect(page.getByText('Profile', { exact: true })).toBeVisible()
    await expect(page.locator('input.input').first()).toBeVisible()
  })

  test('appearance section has theme options', async ({ page }) => {
    await expect(page.getByText(/appearance/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /dark/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /light/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /system/i })).toBeVisible()
  })

  test('theme toggle changes theme', async ({ page }) => {
    await page.getByRole('button', { name: /dark/i }).click()
    await page.waitForTimeout(300)
    const html = page.locator('html, body')
    const cls  = await html.first().getAttribute('class') || ''
    const data = await html.first().getAttribute('data-theme') || ''
    expect(cls + data).toMatch(/dark/i)
  })

  test('integrations section has Google connect', async ({ page }) => {
    await expect(page.getByText(/integrations/i)).toBeVisible()
    await expect(page.getByText(/google/i)).toBeVisible()
  })

  test('active sessions section is NOT present', async ({ page }) => {
    await expect(page.getByText(/active sessions/i)).not.toBeVisible()
  })

  test('sign out button visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign out/i }).first()).toBeVisible()
  })

  test('save profile button works', async ({ page }) => {
    const nameInput = page.locator('input.input').first()
    await nameInput.clear()
    await nameInput.fill('Test Name Updated')
    await page.getByRole('button', { name: /save/i }).first().click()
    await expect(page.getByText(/saved|✓/i)).toBeVisible({ timeout: 10_000 })
  })
})
