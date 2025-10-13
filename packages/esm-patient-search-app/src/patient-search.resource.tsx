import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, useSession, type FetchResponse, restBaseUrl, fhirBaseUrl } from '@openmrs/esm-framework';
import type { PatientSearchResponse, User, FHIRPatientSearchResponse } from './types';
import { mapSearchedPatientFromFhir } from './utils/fhir-mapper';

/**
 * @param query - The trimmed search query
 * @returns Object with parameter name and value
 */
function getSearchParameter(query: string): { param: string; value: string } {
  const isNumeric = /^\d+$/.test(query);
  const hasAlphanumeric = /(?=.*[a-z])(?=.*\d)/i.test(query);
  const isWithSpecialCharacters = /^[A-Z0-9\-\/_\.#]+$/i.test(query) && /[\-\/_\.#]/.test(query);

  const param = isNumeric || hasAlphanumeric || isWithSpecialCharacters ? 'identifier' : 'name:contains';

  return { param, value: query };
}

/**
 * Builds FHIR search URL parameters for patient search.
 */
function buildSearchParams(searchQuery: string, includeDead: boolean, pageSize: number): URLSearchParams {
  const params = new URLSearchParams();

  if (searchQuery?.trim()) {
    const { param, value } = getSearchParameter(searchQuery.trim());
    params.append(param, value);
  }

  !includeDead && params.append('death-date:missing', 'true');

  params.append('_count', pageSize.toString());
  params.append('_total', 'accurate');

  return params;
}

/**
 * A custom React hook for implementing infinite scrolling patient search using FHIR.
 * searches by name OR identifier based on input pattern.
 *
 * @param searchQuery - The string to search for in patient records.

 * @param includeDead - Whether to include deceased patients in the search results.
 * @param isSearching - Whether the search should be active. Defaults to true.
 * @param pageSize - The number of results to fetch per page. Defaults to 10.
 *
 * @returns An object containing:
 *   - data: Array of patient search results
 *   - isLoading: Boolean indicating if the initial data is loading
 *   - isLoadingMore: Boolean indicating if additional pages are being loaded
 *   - fetchError: Any error that occurred during fetching
 *   - hasMore: Boolean indicating if there are more results to load
 *   - isValidating: Boolean indicating if new data is being loaded
 *   - setPage: Function to load the next page of results
 *   - currentPage: The current page number
 *   - totalResults: The total number of results for the search query
 */
export function useInfinitePatientSearch(
  searchQuery: string,
  includeDead: boolean,
  isSearching: boolean = true,
  pageSize: number = 10,
): PatientSearchResponse {
  const getUrl = useCallback(
    (page: number, prevPageData: FetchResponse<FHIRPatientSearchResponse>) => {
      if (page === 0) {
        const params = buildSearchParams(searchQuery, includeDead, pageSize);
        return `${fhirBaseUrl}/Patient?${params.toString()}`;
      }

      const nextLink = prevPageData?.data?.link?.find((link) => link.relation === 'next');
      return nextLink?.url ?? null;
    },
    [searchQuery, includeDead, pageSize],
  );

  const shouldFetch = isSearching && searchQuery?.trim();

  const { data, isLoading, isValidating, setSize, error, size } = useSWRInfinite<
    FetchResponse<FHIRPatientSearchResponse>,
    Error
  >(shouldFetch ? getUrl : null, openmrsFetch);

  const mappedData = useMemo(
    () => data?.flatMap((res) => res.data?.entry?.map((e) => mapSearchedPatientFromFhir(e.resource)) ?? []) ?? null,
    [data],
  );

  const hasMore = useMemo(() => data?.at(-1)?.data?.link?.some((link) => link.relation === 'next') ?? false, [data]);

  return useMemo(
    () => ({
      data: mappedData,
      isLoading: isLoading && !data,
      isLoadingMore: isLoading && !!data,
      fetchError: error,
      hasMore,
      isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.total ?? 0,
    }),
    [mappedData, isLoading, data, error, hasMore, isValidating, setSize, size],
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
  const shouldFetch = showRecentlySearchedPatients && userUuid;
  const url = `${restBaseUrl}/user/${userUuid}`;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<User>, Error>(shouldFetch ? url : null, openmrsFetch);

  const patientsVisited = useMemo(
    () => data?.data?.userProperties?.patientsVisited?.split(',').filter(Boolean) ?? [],
    [data?.data?.userProperties?.patientsVisited],
  );

  const updateRecentlyViewedPatients = useCallback(
    async (patientUuid: string) => {
      const userProperties = data?.data?.userProperties;

      if (!patientUuid || !userProperties) {
        return;
      }

      const uniquePatients = Array.from(new Set([patientUuid, ...patientsVisited])).slice(0, 10);
      const newUserProperties = {
        ...userProperties,
        patientsVisited: uniquePatients.join(','),
      };

      mutate(
        (current) =>
          current
            ? {
                ...current,
                data: {
                  ...current.data,
                  userProperties: newUserProperties,
                },
              }
            : current,
        false,
      );

      try {
        await openmrsFetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: { userProperties: newUserProperties },
        });
        await mutate();
      } catch (error) {
        await mutate();
        console.error('Failed to update recently viewed patients:', error);
        throw error;
      }
    },
    [data?.data?.userProperties, patientsVisited, url, mutate],
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
 * A custom React hook for fetching patient data from a FHIR API based on a list of patient UUIDs.
 * Optimized to fetch multiple patients in batches rather than one at a time.
 *
 * @param patientUuids - An array of patient UUIDs to fetch data for. If null, no data will be fetched.
 * @param isSearching - A boolean flag to determine if the search should be performed. Defaults to true.
 * @param batchSize - The number of patients to fetch per batch. Defaults to 10.
 *
 * @returns An object containing:
 *   - data: An array of fetched patient data
 *   - isLoading: A boolean indicating if the initial data is being loaded
 *   - isLoadingMore: A boolean indicating if additional batches are being loaded
 *   - fetchError: Any error that occurred during fetching
 *   - hasMore: A boolean indicating if there are more patients to load
 *   - isValidating: A boolean indicating if new data is being loaded
 *   - setPage: A function to load more data
 *   - currentPage: The current page of results
 *   - totalResults: The total number of patients to be fetched
 */
export function useFhirPatients(patientUuids: string[] | null, isSearching: boolean = true, batchSize: number = 10) {
  const getPatientUrl = useCallback(
    (page: number) => {
      if (!patientUuids || page < 0) return null;

      const startIndex = page * batchSize;
      const batchUuids = patientUuids.slice(startIndex, startIndex + batchSize);

      return batchUuids.length === 0 ? null : `${fhirBaseUrl}/Patient?_id=${batchUuids.join(',')}&_count=${batchSize}`;
    },
    [patientUuids, batchSize],
  );

  const shouldFetch = isSearching && patientUuids !== null && patientUuids.length > 0;

  const { data, isLoading, isValidating, setSize, error, size } = useSWRInfinite<
    FetchResponse<FHIRPatientSearchResponse>,
    Error
  >(shouldFetch ? getPatientUrl : null, openmrsFetch, {
    keepPreviousData: true,
    initialSize: 1,
    revalidateFirstPage: false,
  });

  const mappedData = useMemo(
    () => data?.flatMap((res) => res.data?.entry?.map((e) => mapSearchedPatientFromFhir(e.resource)) ?? []) ?? null,
    [data],
  );

  const hasMore = useMemo(
    () => (patientUuids ? (mappedData?.length ?? 0) < patientUuids.length : false),
    [patientUuids, mappedData],
  );

  return useMemo(
    () => ({
      data: mappedData,
      isLoading: isLoading && !data,
      isLoadingMore: isLoading && !!data,
      fetchError: error,
      hasMore,
      isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: patientUuids?.length ?? 0,
    }),
    [mappedData, isLoading, data, error, hasMore, isValidating, setSize, size, patientUuids],
  );
}
