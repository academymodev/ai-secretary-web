const TEST_EMAIL    = process.env.TEST_USER_EMAIL    || 'kmohaneesh@gmail.com'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || ''

async function login(page) {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(TEST_EMAIL)
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL(/\/(dashboard|chat|tasks|email|contacts|calendar|reminders|settings)/, { timeout: 20_000 })
}

module.exports = { login, TEST_EMAIL, TEST_PASSWORD }
