const { test, expect } = require('@playwright/test')
const { login, TEST_EMAIL, TEST_PASSWORD } = require('./helpers/auth')

test.describe('Auth — public pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Modev Secretary' })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('login shows error for wrong password', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(TEST_EMAIL)
    await page.locator('input[type="password"]').first().fill('WrongPass999!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    // Error paragraph appears; text varies ("Invalid email" or "Unable to reach server")
    await expect(page.locator('p[class*="error"]').first()).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/login/)
  })

  test('login shows error for empty fields', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText(/required|email|enter/i)).toBeVisible()
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByPlaceholder('John Doe')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
  })

  test('forgot password navigates from login page', async ({ page }) => {
    await page.goto('/login')
    await page.getByText(/forgot password/i).click()
    await expect(page).toHaveURL(/forgot-password/)
  })

  test('create account link navigates to register', async ({ page }) => {
    await page.goto('/login')
    await page.getByText(/create one|sign up|register/i).click()
    await expect(page).toHaveURL(/register/)
  })

  test('unauthenticated /dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 10_000 })
  })

  test('unauthenticated /chat redirects to login', async ({ page }) => {
    await page.goto('/chat')
    await expect(page).toHaveURL(/login/, { timeout: 10_000 })
  })

  test('unauthenticated /tasks redirects to login', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page).toHaveURL(/login/, { timeout: 10_000 })
  })
})

test.describe('Auth — login flow', () => {
  test.skip(!TEST_PASSWORD, 'Set TEST_USER_PASSWORD env var to run authenticated tests')

  test('successful login redirects into the app', async ({ page }) => {
    await login(page)
    await expect(page).not.toHaveURL(/login/)
  })

  test('logout returns to login page', async ({ page }) => {
    await login(page)
    await page.goto('/settings')
    // Two 'sign out' buttons exist (sidebar icon + settings button); last() targets the settings one
    await page.getByRole('button', { name: /sign out/i }).last().click()
    await page.getByRole('button', { name: /sign out/i }).last().click()
    await expect(page).toHaveURL(/login/, { timeout: 10_000 })
  })
})
