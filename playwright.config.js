// @ts-check
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir:     './tests/e2e',
  timeout:     30_000,
  retries:     1,
  workers:     1,
  globalSetup: require.resolve('./tests/e2e/helpers/global.setup.js'),
  reporter:    [['html', { open: 'never' }], ['list']],

  use: {
    baseURL:           process.env.BASE_URL || 'https://ai-secretary-web.vercel.app',
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    trace:             'retain-on-failure',
    actionTimeout:     10_000,
    navigationTimeout: 20_000,
  },

  expect: { timeout: 10_000 },

  projects: [
    // Public tests — no saved auth state (tests unauthenticated flows)
    {
      name:      'public',
      testMatch: /auth\.spec\.js/,
      use:       { ...devices['Desktop Chrome'] },
    },
    // Authenticated tests — load saved auth state, no per-test login needed
    {
      name:       'chromium',
      testIgnore: /auth\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: process.env.TEST_USER_PASSWORD
          ? './tests/e2e/auth.json'
          : { cookies: [], origins: [] },
      },
    },
  ],
})
