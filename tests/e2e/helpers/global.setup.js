const { chromium } = require('@playwright/test')
const path = require('path')

const AUTH_FILE = path.join(__dirname, '../auth.json')

module.exports = async function globalSetup(config) {
  const password = process.env.TEST_USER_PASSWORD
  if (!password) return

  const email   = process.env.TEST_USER_EMAIL || 'kmohaneesh@gmail.com'
  const baseURL = process.env.BASE_URL || 'https://ai-secretary-web.vercel.app'

  const browser = await chromium.launch()
  const ctx     = await browser.newContext({ baseURL })
  const page    = await ctx.newPage()

  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').first().fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL(/\/(dashboard|chat|tasks|email|contacts|calendar|reminders|settings)/, { timeout: 20_000 })

  await ctx.storageState({ path: AUTH_FILE })
  await browser.close()
}
