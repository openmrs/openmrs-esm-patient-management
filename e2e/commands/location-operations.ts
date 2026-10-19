import { type Page, expect } from '@playwright/test';

/**
 * Logs the page's browser context into its own server session at the given location. Use it with the
 * `wardTest` fixture, which starts the page without the shared storage state.
 */
export const changeLocation = async (page: Page, locationUuid: string) => {
  const token = Buffer.from(`${process.env.E2E_USER_ADMIN_USERNAME}:${process.env.E2E_USER_ADMIN_PASSWORD}`).toString(
    'base64',
  );
  const locationRes = await page.request.post(`${process.env.E2E_BASE_URL}/ws/rest/v1/session`, {
    headers: { Authorization: `Basic ${token}` },
    data: {
      sessionLocation: locationUuid,
      locale: 'en',
    },
  });
  await expect(locationRes.ok()).toBeTruthy();
};

export const changeToWardLocation = async (page: Page) => {
  return changeLocation(page, process.env.E2E_WARD_LOCATION_UUID as string);
};
