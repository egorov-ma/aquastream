import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  webServer: {
    command: 'NEXT_PUBLIC_USE_MOCKS=true NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3101 PORT=3101 pnpm exec next dev --hostname 127.0.0.1 --port 3101',
    url: 'http://127.0.0.1:3101',
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      HOST: '127.0.0.1',
      HOSTNAME: '127.0.0.1',
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
