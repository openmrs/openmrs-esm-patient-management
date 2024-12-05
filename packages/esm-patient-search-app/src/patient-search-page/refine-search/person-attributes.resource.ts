import useSWRImmutable from 'swr/immutable';
import {
  type FetchResponse,
  fhirBaseUrl,
  openmrsFetch,
  type OpenmrsResource,
  restBaseUrl,
  useDebounce,
} from '@openmrs/esm-framework';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import {
  type ConceptResponse,
  type LocationEntry,
  type LocationResponse,
  type PersonAttributeTypeResponse,
} from '../../types';

export function useAttributeConceptAnswers(conceptUuid: string | undefined): {
  conceptAnswers: Array<OpenmrsResource>;
  isLoadingConceptAnswers: boolean;
  errorFetchingConceptAnswers: Error | undefined;
} {
  const shouldFetch = Boolean(conceptUuid);

  const { data, error, isLoading } = useSWRImmutable<FetchResponse<ConceptResponse>, Error>(
    shouldFetch ? `${restBaseUrl}/concept/${conceptUuid}` : null,
    openmrsFetch,
  );

  useEffect(() => {
    if (error) {
      console.error(`Error loading concept answers for conceptUuid: ${conceptUuid}`, error);
    }
  }, [conceptUuid, error]);

  const conceptAnswers = useMemo(() => {
    if (!data?.data) {
      return [];
    }
    return data.data.answers?.length > 0 ? data.data.answers : data.data.setMembers ?? [];
  }, [data]);

  return {
    conceptAnswers,
    isLoadingConceptAnswers: isLoading,
    errorFetchingConceptAnswers: error,
  };
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
    [data?.data?.entry, error, isLoading, isValidating],
  );
}

export function usePersonAttributeType(personAttributeTypeUuid: string): {
  data: PersonAttributeTypeResponse | undefined;
  isLoading: boolean;
  error: any;
} {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<PersonAttributeTypeResponse>>(
    `${restBaseUrl}/personattributetype/${personAttributeTypeUuid}`,
    openmrsFetch,
  );

  return useMemo(
    () => ({
      data: data?.data,
      isLoading,
      error,
    }),
    [data, isLoading, error],
  );
}

export function useConfiguredAnswerConcepts(uuids: Array<string>): {
  configuredConceptAnswers: Array<OpenmrsResource>;
  isLoadingConfiguredAnswers: boolean;
} {
  const fetchConcept = async (uuid: string): Promise<OpenmrsResource | null> => {
    try {
      const response = await openmrsFetch(`${restBaseUrl}/concept/${uuid}?v=custom:(uuid,display)`);
      return response?.data;
    } catch (error) {
      console.error(`Error fetching concept for UUID: ${uuid}`, error);
      return null;
    }
  };

  const { data, isLoading } = useSWR(uuids.length > 0 ? ['answer-concepts', uuids] : null, async () => {
    const results = await Promise.all(uuids.map(fetchConcept));
    return results.filter((concept) => concept !== null);
  });

  return useMemo(
    () => ({
      configuredConceptAnswers: data ?? [],
      isLoadingConfiguredAnswers: isLoading,
    }),
    [data, isLoading],
  );
}
