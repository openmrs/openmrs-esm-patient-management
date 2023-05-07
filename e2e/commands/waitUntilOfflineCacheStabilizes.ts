import { Page } from '@playwright/test';

/**
 * Periodically polls the number of items in the SPA's offline cache and waits until that number
 * hasn't changed since the last check.
 *
 * This is a dirty and potentially flaky way to wait until resources are either added or removed
 * from the app's cache. It can, for example, be used to wait until the app has precached its
 * resources when loading for the first time.
 *
 * Depending on the use case, this approach could be replaced with a better solution.
 * For example, when waiting for the app to become offline-ready, it would be much better to
 * wait for a UI element showing that the app is ready now (which, at the time of writing this
 * comment, does not exist, hence the creation of this function).
 */
export async function waitUntilOfflineCacheStabilizes(page: Page, pollingIntervalMs = 10_000) {
  await page.evaluate(
    async ({ pollingIntervalMs }) => {
      const cache = await caches.open('omrs-spa-cache-v1');
      let previousEntries = -1;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const currentEntries = (await cache.keys()).length;

        if (currentEntries === previousEntries) {
          // The cache hasn't changed since the last time.
          // Assume that everything is ready.
          break;
        } else {
          // The cache changed. Give it more time to populate and then try again.
          previousEntries = currentEntries;
          await new Promise((res) => setTimeout(res, pollingIntervalMs));
        }
      }
    },
    { pollingIntervalMs },
  );
}
