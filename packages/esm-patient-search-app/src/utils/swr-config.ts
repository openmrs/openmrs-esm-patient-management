import { type SWRConfiguration } from 'swr';

/**
 * SWR settings for the lookups a search result makes on its own behalf, principally the patient
 * photo. Those are keyed by patient and stable while the results are on screen, so caching them
 * stops rows re-requesting on every mount — which virtualized rows do as they scroll back into
 * view. Only automatic revalidation is suppressed; an explicit `mutate()` still fetches.
 */
export const searchResultSwrConfig: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 180_000, // 3 minutes
};
