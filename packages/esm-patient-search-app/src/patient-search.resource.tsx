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

/**
 * Builds FHIR-compatible search parameters for patient search.
 * Uses the FHIR Patient resource and OpenMRS _query parameter.
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
 *
 * Returns FHIR Patient objects directly.
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
    params.append('_count', pageSize.toString());
    return `${fhirBaseUrl}/Patient?${params.toString()}`;
  }, [shouldFetch, searchQuery, includeDead, pageSize]);

  const { data, error, isLoading, isValidating, hasMore, loadMore, totalCount } =
    useFhirInfinite<fhir.Patient>(url);

  const totalResults = useMemo(() => totalCount ?? data?.length ?? 0, [totalCount, data]);

  const handleSetPage = useCallback(async () => {
    loadMore();
    return [];
  }, [loadMore]);

  return useMemo(
    () => ({
      data: data ?? [],
      isLoading,
      isLoadingMore: isValidating && !!data,
      fetchError: error,
      hasMore: hasMore ?? false,
      isValidating,
      setPage: handleSetPage,
      totalResults,
    }),
    [data, isLoading, isValidating, error, hasMore, handleSetPage, totalResults],
  );
}

/**
 * Retrieves and updates recently viewed patients for the logged-in user.
 */
export function useRecentlyViewedPatients(showRecentlySearchedPatients: boolean = false) {
  const { user } = useSession();
  const userUuid = user?.uuid;
  const shouldFetch = showRecentlySearchedPatients && userUuid;
  const url = `${restBaseUrl}/user/${userUuid}`;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<User>, Error>(
    shouldFetch ? url : null,
    openmrsFetch,
  );

  const patientsVisited = useMemo(
    () => data?.data?.userProperties?.patientsVisited?.split(',').filter(Boolean) ?? [],
    [data?.data?.userProperties?.patientsVisited],
  );

  const updateRecentlyViewedPatients = useCallback(
    async (patientUuid: string) => {
      const userProperties = data?.data?.userProperties;

      if (!patientUuid || !userProperties) return;

      const uniquePatients = Array.from(new Set([patientUuid, ...patientsVisited])).slice(0, 10);
      const newUserProperties = { ...userProperties, patientsVisited: uniquePatients.join(',') };

      mutate(
        (current) =>
          current
            ? {
                ...current,
                data: { ...current.data, userProperties: newUserProperties },
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
 * Fetches multiple FHIR Patient resources by ID.
 */
export function useFhirPatients(patientUuids: string[] | null) {
  const shouldFetch = !!patientUuids?.length;

  const url = useMemo(() => {
    if (!shouldFetch || !patientUuids) return null;
    return `${fhirBaseUrl}/Patient?_id=${patientUuids.join(',')}`;
  }, [shouldFetch, patientUuids]);

  const { data, error, isLoading, isValidating, hasMore, loadMore } = useFhirInfinite<fhir.Patient>(url);

  const totalResults = patientUuids?.length ?? 0;

  const handleSetPage = useCallback(async () => {
    loadMore();
    return [];
  }, [loadMore]);

  return useMemo(
    () => ({
      data: data ?? [],
      isLoading,
      fetchError: error,
      isValidating: isValidating ?? false,
      hasMore: hasMore ?? false,
      setPage: handleSetPage,
      totalResults,
    }),
    [data, isLoading, error, isValidating, hasMore, handleSetPage, totalResults],
  );
}
