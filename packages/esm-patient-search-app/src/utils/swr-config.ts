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

/**
 * SWR settings for the active visit lookup each search result makes. A visit can start while a
 * result set is on screen, so unlike {@link searchResultSwrConfig} every revalidation trigger stays
 * on and `dedupingInterval` acts as a TTL instead: mount, focus and reconnect all fire, but SWR
 * serves them from the cached entry until the interval lapses. An explicit `mutate()` — what the
 * visit store fans out when a visit starts — is never deduped and always fetches.
 */
export const activeVisitSwrConfig: SWRConfiguration = {
  dedupingInterval: 180_000, // 3 minutes
};
