const { test, expect } = require('@playwright/test')
const { login, TEST_PASSWORD } = require('./helpers/auth')

test.describe('Contacts', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/contacts')
  })

  test('contacts page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /contacts/i })).toBeVisible()
  })

  test('add contact button visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add|new|create|\+/i }).first()).toBeVisible()
  })

  test('search input visible', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible()
  })

  test('create a contact', async ({ page }) => {
    const name = `Test Contact ${Date.now()}`

    await page.getByRole('button', { name: /add|new|create|\+/i }).first().click()

    const dialog = page.locator('[role="dialog"], .modal, .overlay').first()
    await expect(dialog).toBeVisible()

    await page.getByLabel(/name/i).first().fill(name)
    await page.getByRole('button', { name: /save|create|add/i }).last().click()

    await expect(page.getByText(name)).toBeVisible({ timeout: 8_000 })
  })

  test('search filters contacts', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('zzznomatch999')
    await page.waitForTimeout(500)
    await expect(page.getByText(/no contacts|no results|empty/i)).toBeVisible()
  })
})
