import { type SWRConfiguration } from 'swr';

/**
 * SWR settings for the lookups the patient banner rows make on their own (photo, active visit).
 * Keyed by patient and stable while results are on screen, so caching them stops rows re-requesting
 * on every mount — which virtualized rows do as they scroll back into view. Only automatic
 * revalidation is suppressed; an explicit `mutate()` still fetches.
 */
export const patientBannerSwrConfig: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 180_000, // 3 minutes
};
