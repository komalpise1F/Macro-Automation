// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 60000,          // 60s per test (accounts for popup wait)
  expect: { timeout: 10000 },
  retries: 1,              // retry once on flaky network
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'https://indiamacroindicators.co.in',
    headless: false,       // set to true for CI
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Chrome only
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
