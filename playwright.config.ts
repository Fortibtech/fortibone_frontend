import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/playwright',
  timeout: 30_000,
  expect: { timeout: 5000 },
  reporter: [ ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }] ],
  use: {
    // use IPv4 loopback to avoid environments where 'localhost' resolves to ::1 (IPv6)
    baseURL: 'http://127.0.0.1:1907',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
};

export default config;
