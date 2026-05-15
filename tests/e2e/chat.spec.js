const { test, expect } = require('@playwright/test')
const { TEST_PASSWORD } = require('./helpers/auth')

test.describe('Chat', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
  })

  test('chat page loads with input', async ({ page }) => {
    await expect(page.getByPlaceholder(/ask|message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
  })

  test('send button disabled when input empty', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send/i })
    await expect(sendBtn).toBeDisabled()
  })

  test('send button enabled when typing', async ({ page }) => {
    await page.getByPlaceholder(/ask|message/i).fill('Hello')
    const sendBtn = page.getByRole('button', { name: /send/i })
    await expect(sendBtn).toBeEnabled()
  })

test('send message and receive response', async ({ page }) => {
    await page.getByPlaceholder(/ask|message/i).fill('Say hello in one word')
    await page.getByRole('button', { name: /send/i }).click()

    // User bubble appears immediately
    await expect(page.getByText('Say hello in one word')).toBeVisible()

    // Typing indicator appears
    await expect(page.locator('.typing-dot').first()).toBeVisible({ timeout: 5_000 })

    // AI response arrives (wait up to 30s for cold Render start)
    await expect(page.locator('.prose-chat, [class*="assistant"]').first()).toBeVisible({ timeout: 30_000 })
  })

  test('clear history button appears after messages', async ({ page }) => {
    // Send a message first
    await page.getByPlaceholder(/ask|message/i).fill('Hi')
    await page.getByRole('button', { name: /send/i }).click()
    await page.waitForTimeout(500)
    await expect(page.getByRole('button', { name: /clear/i })).toBeVisible()
  })

  test('enter key sends message', async ({ page }) => {
    const input = page.getByPlaceholder(/ask|message/i)
    await input.fill('Test')
    await input.press('Enter')
    await expect(page.getByText('Test')).toBeVisible()
  })
})
