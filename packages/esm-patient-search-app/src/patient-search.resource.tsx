import { useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite';
import {
  omrsOfflineCachingStrategyHttpHeaderName,
  openmrsFetch,
  useSession,
  type FetchResponse,
  type OmrsOfflineHttpHeaders,
  restBaseUrl,
} from '@openmrs/esm-framework';
import type { PatientSearchResponse, SearchedPatient, User } from './types';

const cachingStrategyHeaders: OmrsOfflineHttpHeaders = {
  [omrsOfflineCachingStrategyHttpHeaderName]: 'network-only-or-cache-only',
};

function fetcher<T>(url: string) {
  return openmrsFetch<T>(url, { headers: cachingStrategyHeaders });
}

type InfinitePatientSearchResponse = FetchResponse<{
  results: Array<SearchedPatient>;
  links: Array<{ rel: 'prev' | 'next' }>;
  totalCount: number;
}>;

const patientProperties = [
  'patientId',
  'uuid',
  'voided',
  'identifiers',
  'display',
  'patientIdentifier:(uuid,identifier)',
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate)',
  'attributes:(value,attributeType:(uuid,display))',
];

const patientSearchCustomRepresentation = `custom:(${patientProperties.join(',')})`;

export const userPropertiesRepresentation = 'custom:(userProperties)';

export const getUserPropertiesUrl = (userUuid: string) =>
  `${restBaseUrl}/user/${userUuid}?v=${encodeURIComponent(userPropertiesRepresentation)}`;

/**
 * Refreshes page 1 of an infinite search the first time a given query becomes active.
 *
 * The searches in this module set `revalidateFirstPage: false` so that appending a page does not
 * re-fetch page 1. SWR has no notion of cache expiry, so that flag alone would pin a query's
 * results — including an empty result — for as long as the SPA stays loaded: neither remounting
 * the search UI nor refocusing the window causes `useSWRInfinite` to re-fetch a page it already
 * holds. A clerk who searches for a patient, registers them, and searches again would keep seeing
 * the cached "no results".
 *
 * Passing a per-page predicate to `mutate` revalidates page 1 alone, leaving the already-loaded
 * pages (and their object identities) untouched, so the append optimization is preserved. This
 * fires once per query: a query is "reopened" when its key changes, or when the search is cleared
 * and the same term is entered again.
 *
 * @param firstPageUrl The page 1 URL of the active query, or null when the search is inactive
 * @param mutate The `mutate` returned by the `useSWRInfinite` call being bounded
 */
function useRevalidateFirstPageOnce<T>(firstPageUrl: string | null, mutate: SWRInfiniteResponse<T>['mutate']) {
  const { cache } = useSWRConfig();
  const revalidatedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Closing the search resets this, so re-entering the same term revalidates again.
    if (!firstPageUrl) {
      revalidatedUrlRef.current = null;
      return;
    }

    if (revalidatedUrlRef.current === firstPageUrl) {
      return;
    }

    revalidatedUrlRef.current = firstPageUrl;

    // An uncached page 1 is fetched by SWR regardless, so mutating would only duplicate it. Note
    // that `data` cannot stand in for this check: `keepPreviousData` leaves the outgoing query's
    // results in place while a new query has nothing cached.
    if (cache.get(firstPageUrl)?.data === undefined) {
      return;
    }

    // The pages are written back unchanged rather than passing `undefined`, which would clear the
    // cache entry and put the hook back into its loading state, flashing a skeleton over results
    // that are already on screen.
    void mutate((currentPages) => currentPages, {
      revalidate: (_pageData, pageKey) => pageKey === firstPageUrl,
    });
  }, [cache, firstPageUrl, mutate]);
}

/**
 * A custom React hook for implementing infinite scrolling patient search.
 *
 * @param searchQuery - The string to search for in patient records.
 * @param includeDead - Whether to include deceased patients in the search results.
 * @param isSearching - Whether the search should be active. Defaults to true.
 * @param resultsToFetch - The number of results to fetch per page. Defaults to 10.
 * @param customRepresentation - Custom representation string for the patient data. Defaults to patientSearchCustomRepresentation.
 *
 * @returns An object containing:
 *   - data: Array of patient search results
 *   - isLoading: Boolean indicating if the initial data is loading
 *   - fetchError: Any error that occurred during fetching
 *   - hasMore: Boolean indicating if there are more results to load
 *   - isValidating: Boolean indicating if new data is being loaded
 *   - setPage: Function to load the next page of results
 *   - currentPage: The current page number
 *   - totalResults: The number of results for the query the returned `data` belongs to
 *   - totalResultsForQuery: The number of results for the query currently being searched for
 */
export function useInfinitePatientSearch(
  searchQuery: string,
  includeDead: boolean,
  isSearching: boolean = true,
  resultsToFetch: number = 10,
  customRepresentation: string = patientSearchCustomRepresentation,
): PatientSearchResponse {
  const { cache } = useSWRConfig();

  const buildUrl = useCallback(
    (page: number) => {
      const baseUrl = `${restBaseUrl}/patient`;
      const params = new URLSearchParams({
        q: searchQuery,
        v: customRepresentation,
        includeDead: includeDead.toString(),
        limit: resultsToFetch.toString(),
        // Only page 1's count is ever read (see below), so only page 1 asks for it. This is about
        // asking for what we use rather than about backend cost: the patient search handler hands
        // back a `NeedsPaging`, whose count is the size of the list it has already built in memory,
        // so `totalCount=true` does not make the REST module run a separate count query here.
        ...(page ? { startIndex: (page * resultsToFetch).toString() } : { totalCount: 'true' }),
      });

      return `${baseUrl}?${params.toString()}`;
    },
    [searchQuery, customRepresentation, includeDead, resultsToFetch],
  );

  const shouldFetch = isSearching && Boolean(searchQuery);
  const firstPageUrl = shouldFetch ? buildUrl(0) : null;

  // The count for the query being fetched, read through the cache rather than off `data`:
  // `keepPreviousData` leaves the outgoing query's pages in `data` while a new query loads, so
  // `data[0]` would report the wrong query's total — and callers size their page requests from it.
  const totalCount = firstPageUrl ? cache.get(firstPageUrl)?.data?.data?.totalCount : undefined;

  // Pages are fetched in parallel, so appending one costs a round trip rather than a round trip per
  // page walked. The trade-off is that SWR no longer passes the previous page to `getKey`, so the
  // end of the result set is recognised from the total page 1 reports instead of its `next` link.
  // Until that total is known there is nothing to page through, so only page 1 is requested.
  const getUrl = useCallback(
    (page: number) => {
      if (page > 0) {
        const total = cache.get(buildUrl(0))?.data?.data?.totalCount;
        if (total === undefined || page * resultsToFetch >= total) {
          return null;
        }
      }

      return buildUrl(page);
    },
    [buildUrl, cache, resultsToFetch],
  );

  // Re-fetching page 1 on every page load would cost a round trip and replace the rendered rows'
  // objects, breaking the identity they memoize on. See `useRevalidateFirstPageOnce` for how the
  // resulting staleness is bounded.
  const { data, isLoading, isValidating, setSize, error, size, mutate } = useSWRInfinite<
    InfinitePatientSearchResponse,
    Error
  >(shouldFetch ? getUrl : null, fetcher, { keepPreviousData: true, revalidateFirstPage: false, parallel: true });

  useRevalidateFirstPageOnce(firstPageUrl, mutate);

  // Filter out null patients and patients with null person property to prevent errors
  // when components access patient.person properties. This filtering happens at the source
  // (in the hook) to ensure all consumers receive clean, valid data. Memoized because consumers
  // key their own memos off this array's identity.
  const mappedData = useMemo(
    () =>
      shouldFetch
        ? (data
            ?.flatMap((res) => res.data?.results ?? [])
            ?.filter((patient): patient is SearchedPatient => patient !== null && patient.person !== null) ?? null)
        : null,
    [shouldFetch, data],
  );

  return useMemo(
    () => ({
      data: mappedData,
      isLoading,
      fetchError: error,
      hasMore: shouldFetch ? (data?.at(-1)?.data?.links?.some((link) => link.rel === 'next') ?? false) : false,
      isValidating,
      setPage: setSize,
      currentPage: size,
      // Describes the rows in `data`, which under `keepPreviousData` are the outgoing query's until
      // the new first page lands — so a view can print this above the rows it is rendering without
      // the count and the list disagreeing mid-query.
      totalResults: shouldFetch ? (data?.[0]?.data?.totalCount ?? 0) : 0,
      totalResultsForQuery: totalCount ?? 0,
    }),
    [shouldFetch, mappedData, isLoading, error, data, isValidating, setSize, size, totalCount],
  );
}

/**
 * A custom React hook for managing and retrieving the list of recently viewed patients.
 *
 * @param showRecentlySearchedPatients - A boolean flag to enable/disable the feature. Defaults to false.
 * @returns An object containing:
 *   - error: Any error that occurred during fetching
 *   - isLoadingPatients: Boolean indicating if the data is being loaded
 *   - recentlyViewedPatientUuids: Array of UUIDs of recently viewed patients
 *   - updateRecentlyViewedPatients: Function to update the list with a new patient UUID
 *   - mutateUserProperties: Function to trigger a re-fetch of user properties
 */
export function useRecentlyViewedPatients(showRecentlySearchedPatients: boolean = false) {
  const { user } = useSession();
  const userUuid = user?.uuid;
  const shouldFetchRecentlyViewedPatients = showRecentlySearchedPatients && userUuid;
  const url = userUuid ? getUserPropertiesUrl(userUuid) : null;

  // This request will be loaded from the SWR cache as a preload request happens ahead  when the user hovers over the search icon.
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<User>, Error>(
    shouldFetchRecentlyViewedPatients ? url : null,
    fetcher,
  );

  const userProperties = data?.data?.userProperties;
  const patientsVisited = useMemo(
    () => userProperties?.patientsVisited?.split(',').filter(Boolean) ?? [],
    [userProperties],
  );

  const updateRecentlyViewedPatients = useCallback(
    (patientUuid: string) => {
      if (!url) {
        return Promise.resolve();
      }

      const uniquePatients = Array.from(new Set([patientUuid, ...patientsVisited]));
      const mostRecentPatients = uniquePatients.slice(0, 10);
      const newUserProperties = { ...userProperties, patientsVisited: mostRecentPatients.join(',') };

      return openmrsFetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          userProperties: newUserProperties,
        },
      });
    },
    [patientsVisited, url, userProperties],
  );

  return useMemo(
    () => ({
      error,
      isLoadingPatients: isLoading,
      recentlyViewedPatientUuids: patientsVisited,
      updateRecentlyViewedPatients,
      mutateUserProperties: mutate,
    }),
    [error, isLoading, mutate, patientsVisited, updateRecentlyViewedPatients],
  );
}

/**
 * A custom React hook for fetching patient data from a REST API based on a list of patient UUIDs.
 *
 * @param patientUuids - An array of patient UUIDs to fetch data for. If null, no data will be fetched.
 * @param isSearching - A boolean flag to determine if the search should be performed. Defaults to true.
 * @param resultsToFetch - The number of results to fetch at a time. Defaults to 10.
 * @param customRepresentation - A string representing the custom representation of patient data to fetch. Defaults to a predefined value 'v'.
 *
 * @returns An object containing:
 *   - data: An array of fetched patient data
 *   - isLoading: A boolean indicating if the initial data is being loaded
 *   - fetchError: Any error that occurred during fetching
 *   - hasMore: A boolean indicating if there are more patients to load
 *   - isValidating: A boolean indicating if new data is being loaded
 *   - setPage: A function to load more data
 *   - currentPage: The current page of results
 *   - totalResults: The total number of patients to be fetched
 */

export function useRestPatients(
  patientUuids: string[] | null,
  isSearching: boolean = true,
  resultsToFetch: number = 10,
  customRepresentation: string = patientSearchCustomRepresentation,
) {
  const getPatientUrl = useCallback(
    (index: number) => {
      if (patientUuids && index < patientUuids.length) {
        return `${restBaseUrl}/patient/${patientUuids[index]}?v=${customRepresentation}`;
      } else {
        return null;
      }
    },
    [patientUuids, customRepresentation],
  );

  const shouldFetch = isSearching && patientUuids !== null && patientUuids.length > 0;

  // One patient per page, so fetch them in parallel; safe because the page URLs depend only on the
  // index, never on the previous page.
  const { data, isLoading, isValidating, setSize, error, size } = useSWRInfinite<FetchResponse<SearchedPatient>, Error>(
    shouldFetch ? getPatientUrl : null,
    fetcher,
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      revalidateOnMount: true,
      parallel: true,
      initialSize: patientUuids ? Math.min(resultsToFetch, patientUuids.length) : 0,
    },
  );

  // Filter out null, voided, and patients with null person property to prevent errors
  // when components access patient.person properties. This filtering happens at the source
  // (in the hook) to ensure all consumers receive clean, valid data. Memoized because consumers
  // key their own memos off this array's identity.
  const mappedData = useMemo(
    () =>
      data
        ?.flatMap((res) => res.data)
        ?.filter(
          (patient): patient is SearchedPatient => patient !== null && !patient.voided && patient.person !== null,
        ) ?? null,
    [data],
  );

  return useMemo(
    () => ({
      data: mappedData,
      isLoading,
      fetchError: error,
      hasMore: patientUuids ? size < patientUuids.length : false,
      isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: patientUuids?.length ?? 0,
      // This hook pages a list it already holds, so there is no in-flight query for the count to
      // lag behind.
      totalResultsForQuery: patientUuids?.length ?? 0,
    }),
    [mappedData, isLoading, error, patientUuids, size, isValidating, setSize],
  );
}
