const { defineConfig } = require('@playwright/test');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, 'edTechTestFiles', '.env'),
});

module.exports = defineConfig({
  testDir: './edTechTestFiles',
  timeout: 30000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/qtest-login-results.xml' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_FE_TEST_URL || 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
