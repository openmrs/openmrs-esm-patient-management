import { APIRequestContext, PlaywrightWorkerArgs, WorkerFixture } from '@playwright/test';

/**
 * A fixture which initializes an [`APIRequestContext`](https://playwright.dev/docs/api/class-apirequestcontext)
 * that is bound to the configured OpenMRS API server. The context is automatically authenticated
 * using the configured admin account.
 *
 * Use the request context like this:
 * ```ts
 * test('your test', async ({ api }) => {
 *   const res = await api.get('rest/v1/patient/1234');
 *   await expect(res.ok()).toBeTruthy();
 * });
 * ```
 */
export const api: WorkerFixture<APIRequestContext, PlaywrightWorkerArgs> = async ({ playwright }, use) => {
  const ctx = await playwright.request.newContext({
    baseURL: process.env.E2E_WS_BASE_URL,
    httpCredentials: {
      username: process.env.E2E_USER_ADMIN_USERNAME,
      password: process.env.E2E_USER_ADMIN_PASSWORD,
    },
  });

  await use(ctx);
};
