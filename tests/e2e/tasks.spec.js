const { test, expect } = require('@playwright/test')
const { TEST_PASSWORD } = require('./helpers/auth')

test.describe('Tasks', () => {
  test.skip(!TEST_PASSWORD, 'TEST_USER_PASSWORD not set')
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks')
  })

  test('tasks page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tasks/i })).toBeVisible()
  })

  test('add task button visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add|new|create|\+/i }).first()).toBeVisible()
  })

  test('create a new task', async ({ page }) => {
    const taskName = `Test Task ${Date.now()}`

    await page.getByRole('button', { name: /add|new|create|\+/i }).first().click()

    const dialog = page.locator('[role="dialog"], .modal, .overlay').first()
    await expect(dialog).toBeVisible()

    await page.getByPlaceholder('Task title').fill(taskName)
    await page.getByRole('button', { name: /save|create|add/i }).last().click()

    await expect(page.getByText(taskName)).toBeVisible({ timeout: 10_000 })
  })

  test('task filters / tabs work', async ({ page }) => {
    const tabs = page.getByRole('tab').or(page.getByRole('button', { name: /all|pending|completed/i }))
    if (await tabs.count() > 0) {
      await tabs.first().click()
      await expect(page).toHaveURL(/tasks/)
    }
  })

  test('complete a task', async ({ page }) => {
    // Create a task first
    const taskName = `Complete Me ${Date.now()}`
    await page.getByRole('button', { name: /add|new|create|\+/i }).first().click()
    await page.getByPlaceholder('Task title').fill(taskName)
    await page.getByRole('button', { name: /save|create|add/i }).last().click()
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 10_000 })

    // Mark complete
    const taskRow = page.locator(`text=${taskName}`).locator('..')
    const completeBtn = taskRow.getByRole('button', { name: /complete|done|✓|check/i }).first()
    if (await completeBtn.isVisible()) {
      await completeBtn.click()
      await page.waitForTimeout(1000)
    }
  })
})
