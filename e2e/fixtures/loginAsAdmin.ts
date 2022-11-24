import { Page, PlaywrightTestArgs, TestFixture } from '@playwright/test';
import { LoginPage } from '../pages';
import { playwrightVariables } from '../../playwright.config';

/**
 * A fixture which automatically logs in as the configured admin.
 *
 * You can use the fixture as a substitute for the default playwright `page`:
 * ```ts
 * test('your test', async ({ loginAsAdmin: page }) => {
 *   // `page` starts at the OpenMRS SPA's home page.
 *   // The configured admin user is already logged in.
 *   await page.foo(); // Your code here.
 * });
 * ```
 */
export const loginAsAdmin: TestFixture<Page, PlaywrightTestArgs> = async ({ page }, use) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    playwrightVariables.USER_ADMIN_USERNAME ?? '',
    playwrightVariables.USER_ADMIN_PASSWORD ?? '',
    playwrightVariables.LOGIN_DEFAULT_LOCATION_NAME ?? '',
  );
  await page.waitForURL(/home$/);
  await use(page);
};
