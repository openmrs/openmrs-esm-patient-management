import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import {
  openmrsFetch,
  useSession,
  type FetchResponse,
  restBaseUrl,
  fhirBaseUrl,
  useFhirInfinite,
} from '@openmrs/esm-framework';
import type { PatientSearchResponse, User } from './types';
import { mapSearchedPatientFromFhir } from './utils/fhir-mapper';

/**
 * Builds OpenMRS custom search URL parameters for patient search.
 * Uses the custom "openmrsPatients" query name with the 'q' parameter.
 */
function buildOpenmrsSearchParams(searchQuery: string, includeDead: boolean): URLSearchParams {
  const params = new URLSearchParams();

  params.append('_query', 'openmrsPatients');

  if (searchQuery?.trim()) {
    params.append('q', searchQuery.trim());
  }

  if (!includeDead) {
    params.append('deceased', 'false');
  }

  return params;
}

/**
 * Implementing infinite scrolling patient search using OpenMRS custom search.
 * Uses the 'openmrsPatients' query with the 'q' parameter for flexible searching.
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
 *   - totalResults: The total number of results for the search query
 */
export function useInfinitePatientSearch(
  searchQuery: string,
  includeDead: boolean,
  isSearching: boolean = true,
  pageSize: number = 10,
): PatientSearchResponse {
  const shouldFetch = isSearching && !!searchQuery?.trim();

  const url = useMemo(() => {
    if (!shouldFetch) return null;

    const params = buildOpenmrsSearchParams(searchQuery, includeDead);
    return `${fhirBaseUrl}/Patient?${params.toString()}`;
  }, [shouldFetch, searchQuery, includeDead]);

  const { data, error, isLoading, isValidating, hasMore, loadMore, totalCount } = useFhirInfinite<fhir.Patient>(url, {
    immutable: true,
  });

  const mappedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((patient) => patient != null).map((patient) => mapSearchedPatientFromFhir(patient));
  }, [data]);

  const totalResults = useMemo(() => {
    return totalCount ?? mappedData?.length ?? 0;
  }, [totalCount, mappedData]);

  const handleSetPage = useCallback(async () => {
    loadMore();
    return [];
  }, [loadMore]);

  return useMemo(
    () => ({
      data: mappedData,
      isLoading: isLoading,
      isLoadingMore: isValidating && !!data,
      fetchError: error,
      hasMore: hasMore ?? false,
      isValidating: isValidating,
      setPage: handleSetPage,
      totalResults,
    }),
    [mappedData, isLoading, isValidating, data, error, hasMore, handleSetPage, totalResults],
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
 * Uses batch fetching for efficiency with useFhirInfinite.
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
 *   - totalResults: The total number of patients to be fetched
 */
export function useFhirPatients(patientUuids: string[] | null, isSearching: boolean = true, batchSize: number = 10) {
  const shouldFetch = isSearching && patientUuids !== null && patientUuids.length > 0;

  const url = useMemo(() => {
    if (!shouldFetch || !patientUuids) return null;

    return `${fhirBaseUrl}/Patient?_id=${patientUuids.join(',')}&_count=${batchSize}`;
  }, [shouldFetch, patientUuids, batchSize]);

  const { data, error, isLoading, isValidating, hasMore, loadMore } = useFhirInfinite<fhir.Patient>(url, {
    immutable: true,
  });

  const mappedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((patient) => patient != null).map((patient) => mapSearchedPatientFromFhir(patient));
  }, [data]);

  const handleSetPage = useCallback(async () => {
    loadMore();
    return [];
  }, [loadMore]);

  return useMemo(
    () => ({
      data: mappedData,
      isLoading: isLoading,
      isLoadingMore: isValidating && !!data,
      fetchError: error,
      hasMore: hasMore ?? false,
      isValidating: isValidating,
      setPage: handleSetPage,
      totalResults: patientUuids?.length ?? 0,
    }),
    [mappedData, isLoading, isValidating, data, error, hasMore, handleSetPage, patientUuids],
  );
}
