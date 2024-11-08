import useSWRImmutable from 'swr/immutable';
import {
  type FetchResponse,
  fhirBaseUrl,
  openmrsFetch,
  restBaseUrl,
  showSnackbar,
  useDebounce,
} from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import {
  type ConceptAnswers,
  type ConceptResponse,
  type LocationEntry,
  type LocationResponse,
  type PersonAttributeTypeResponse,
} from '../../types';

export function useAttributeConceptAnswers(conceptUuid: string): {
  data: Array<ConceptAnswers>;
  isLoading: boolean;
  error: Error;
} {
  const shouldFetch = typeof conceptUuid === 'string' && conceptUuid !== '';
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<ConceptResponse>, Error>(
    shouldFetch ? `${restBaseUrl}/concept/${conceptUuid}` : null,
    openmrsFetch,
  );
  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
    });
  }
  return useMemo(() => ({ data: data?.data?.answers, isLoading, error }), [isLoading, error, data]);
}

export function useLocations(
  locationTag: string | null,
  searchQuery: string = '',
): {
  locations: Array<LocationEntry>;
  isLoading: boolean;
  loadingNewData: boolean;
  error: any;
} {
  const debouncedQuery = useDebounce(searchQuery);

  const constructUrl = useMemo(() => {
    let url = `${fhirBaseUrl}/Location?`;
    let urlSearchParameters = new URLSearchParams();
    urlSearchParameters.append('_summary', 'data');

    if (!debouncedQuery) {
      urlSearchParameters.append('_count', '10');
    }

    if (locationTag) {
      urlSearchParameters.append('_tag', locationTag);
    }

    if (typeof debouncedQuery === 'string' && debouncedQuery != '') {
      urlSearchParameters.append('name:contains', debouncedQuery);
    }

    return url + urlSearchParameters.toString();
  }, [locationTag, debouncedQuery]);

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
    }),
    [data, isLoading, isValidating],
  );
}

export function usePersonAttributeType(personAttributeTypeUuid: string): {
  data: PersonAttributeTypeResponse;
  isLoading: boolean;
  error: any;
} {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<PersonAttributeTypeResponse>>(
    `${restBaseUrl}/personattributetype/${personAttributeTypeUuid}`,
    openmrsFetch,
  );

  return {
    data: data?.data,
    isLoading,
    error,
  };
}
