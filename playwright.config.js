// @ts-check
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir:   './tests/e2e',
  timeout:   30_000,
  retries:   1,
  workers:   1,
  reporter:  [['html', { open: 'never' }], ['list']],

  use: {
    baseURL:           process.env.BASE_URL || 'https://ai-secretary-web.vercel.app',
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    trace:             'retain-on-failure',
    actionTimeout:     10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
