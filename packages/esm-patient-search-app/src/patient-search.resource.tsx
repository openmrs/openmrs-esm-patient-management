import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, useSession, type FetchResponse, restBaseUrl } from '@openmrs/esm-framework';
import type { PatientSearchResponse, SearchedPatient, User } from './types';

type InfinitePatientSearchResponse = FetchResponse<{
  results: Array<SearchedPatient>;
  links: Array<{ rel: 'prev' | 'next' }>;
  totalCount: number;
}>;

const patientProperties = [
  'patientId',
  'uuid',
  'identifiers',
  'display',
  'patientIdentifier:(uuid,identifier)',
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate)',
  'attributes:(value,attributeType:(uuid,display))',
];

const patientSearchCustomRepresentation = `custom:(${patientProperties.join(',')})`;

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
 *   - totalResults: The total number of results for the search query
 */
export function useInfinitePatientSearch(
  searchQuery: string,
  includeDead: boolean,
  isSearching: boolean = true,
  resultsToFetch: number = 10,
  customRepresentation: string = patientSearchCustomRepresentation,
): PatientSearchResponse {
  const getUrl = useCallback(
    (
      page: number,
      prevPageData: FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }> }>,
    ) => {
      if (prevPageData && !prevPageData?.data?.links.some((link) => link.rel === 'next')) {
        return null;
      }

      const baseUrl = `${restBaseUrl}/patient`;
      const params = new URLSearchParams({
        q: searchQuery,
        v: customRepresentation,
        includeDead: includeDead.toString(),
        limit: resultsToFetch.toString(),
        totalCount: 'true',
        ...(page ? { startIndex: (page * resultsToFetch).toString() } : {}),
      });

      return `${baseUrl}?${params.toString()}`;
    },
    [searchQuery, customRepresentation, includeDead, resultsToFetch],
  );

  const shouldFetch = isSearching && searchQuery;

  const { data, isLoading, isValidating, setSize, error, size } = useSWRInfinite<InfinitePatientSearchResponse, Error>(
    shouldFetch ? getUrl : null,
    openmrsFetch,
  );

  const mappedData = data?.flatMap((res) => res.data?.results ?? []) ?? null;

  return useMemo(
    () => ({
      data: mappedData,
      isLoading,
      fetchError: error,
      hasMore: data?.at(-1)?.data?.links?.some((link) => link.rel === 'next') ?? false,
      isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.totalCount ?? 0,
    }),
    [mappedData, isLoading, error, data, isValidating, setSize, size],
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
  const url = `${restBaseUrl}/user/${userUuid}`;

  // This request will be loaded from the SWR cache as a preload request happens ahead  when the user hovers over the search icon.
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<User>, Error>(
    shouldFetchRecentlyViewedPatients ? url : null,
    openmrsFetch,
  );

  const userProperties = data?.data?.userProperties;
  const patientsVisited = useMemo(
    () => userProperties?.patientsVisited?.split(',').filter(Boolean) ?? [],
    [userProperties],
  );

  const updateRecentlyViewedPatients = useCallback(
    (patientUuid: string) => {
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

  const { data, isLoading, isValidating, setSize, error, size } = useSWRInfinite<FetchResponse<SearchedPatient>, Error>(
    shouldFetch ? getPatientUrl : null,
    openmrsFetch,
    {
      keepPreviousData: true,
      initialSize: patientUuids ? Math.min(resultsToFetch, patientUuids.length) : 0,
    },
  );

  const mappedData = data?.flatMap((res) => res.data) ?? null;

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
    }),
    [mappedData, isLoading, error, patientUuids, size, isValidating, setSize],
  );
}
