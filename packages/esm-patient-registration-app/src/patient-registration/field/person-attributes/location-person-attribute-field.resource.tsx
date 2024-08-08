import { useCallback, useMemo } from 'react';
import { type FetchResponse, fhirBaseUrl, openmrsFetch, useDebounce } from '@openmrs/esm-framework';
import { type LocationEntry, type LocationResponse } from '@openmrs/esm-service-queues-app/src/types';
import useSWR from 'swr';
interface IUseLocations {
  locations: Array<LocationEntry>;
  isLoading: boolean;
  loadingNewData: boolean;
  fetchLocationByUuid: (uuid: string) => void;
}

export function useLocations(locationTag: string | null, count: number = 0, searchQuery: string = ''): IUseLocations {
  const debouncedSearchQuery = useDebounce(searchQuery);

  const fetchLocationByUuid = useCallback((uuid: string) => {
    const { data } = useSWR<FetchResponse<LocationResponse>, Error>(`${fhirBaseUrl}/Location/${uuid}`, openmrsFetch);
  }, []);

  const constructUrl = useMemo(() => {
    let url = `${fhirBaseUrl}/Location?`;
    let urlSearchParameters = new URLSearchParams();
    urlSearchParameters.append('_summary', 'data');

    if (count && !debouncedSearchQuery) {
      urlSearchParameters.append('_count', '' + count);
    }

    if (locationTag) {
      urlSearchParameters.append('_tag', locationTag);
    }

    if (typeof debouncedSearchQuery === 'string' && debouncedSearchQuery != '') {
      urlSearchParameters.append('name:contains', debouncedSearchQuery);
    }

    return url + urlSearchParameters.toString();
  }, [count, locationTag, debouncedSearchQuery]);

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<LocationResponse>, Error>(
    constructUrl,
    openmrsFetch,
  );

  return useMemo(
    () => ({
      locations: data?.data?.entry || [],
      isLoading,
      loadingNewData: isValidating,
      error,
      fetchLocationByUuid,
    }),
    [isLoading, data, isValidating, fetchLocationByUuid],
  );
}
