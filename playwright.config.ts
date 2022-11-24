import { devices, PlaywrightTestConfig } from '@playwright/test';

export const playwrightVariables = {
  UI_BASE_URL: 'http://localhost:8080/openmrs/spa/',
  WS_BASE_URL: 'http://localhost:8080/openmrs/ws/',
  USER_ADMIN_USERNAME: 'Admin',
  USER_ADMIN_PASSWORD: 'Admin123',
  LOGIN_DEFAULT_LOCATION_NAME: 'Outpatient Clinic',
};

// See https://playwright.dev/docs/test-configuration.
const config: PlaywrightTestConfig = {
  testDir: './e2e/specs',
  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 40 * 1000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: playwrightVariables.UI_BASE_URL,
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
};

export default config;
