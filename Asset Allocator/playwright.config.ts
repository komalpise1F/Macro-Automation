import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    use: {
        headless: true,
        viewport: { width: 1280, height: 800 },
        actionTimeout: 15_000,
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chrome',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
});
