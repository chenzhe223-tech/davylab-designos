import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  reporter: 'list',
  use: { headless: true, baseURL: 'http://127.0.0.1:4175' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  // Real http origin is required for reliable localStorage and authenticated registry fetch.
  webServer: {
    command: 'npm run build && python3 -m http.server 4175 --bind 127.0.0.1 --directory dist',
    url: 'http://127.0.0.1:4175/resources/',
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  }
});
