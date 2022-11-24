import { chromium } from '@playwright/test';
import { LoginPage } from '../pages';

/**
 * This configuration is to reuse the signed-in state in the tests
 * by log in only once and then skip the log in step for all the tests.
 *
 * The state will be saved in the e2e/storageState.json file.
 * Keep in mind that the setup process will not run if this file
 * already generated. If the server requires you to re-authenticate,
 * you can delete the state file and try again.
 *
 * https://playwright.dev/docs/auth#reuse-signed-in-state
 */

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: process.env.E2E_UI_BASE_URL });
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    process.env.E2E_USER_ADMIN_USERNAME ?? '',
    process.env.E2E_USER_ADMIN_PASSWORD ?? '',
    process.env.E2E_LOGIN_DEFAULT_LOCATION_NAME ?? '',
  );
  await page.waitForURL(/home$/);
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'e2e/storageState.json' });
  await browser.close();
}

export default globalSetup;
