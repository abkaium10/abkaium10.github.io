const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}{ext}',
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-visual-report', open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:4173${process.env.NEXT_PUBLIC_BASE_PATH || ''}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'], defaultBrowserType: 'chromium' } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }
  ],
  webServer: { command: 'npm run serve:static', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 30000 }
});
