import { FetchResponse, openmrsFetch, showToast } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ConceptAnswers, ConceptResponse, PersonAttributeTypeResponse } from '../../patient-registration-types';

export function usePersonAttributeType(personAttributeTypeUuid: string): {
  data: PersonAttributeTypeResponse;
  isLoading: boolean;
} {
  const { data, error } = useSWR<FetchResponse<PersonAttributeTypeResponse>>(
    `/ws/rest/v1/personattributetype/${personAttributeTypeUuid}`,
    openmrsFetch,
  );
  if (error) {
    showToast({
      title: error.name,
      description: error.message,
      kind: 'error',
    });
  }
  return {
    data: data?.data,
    isLoading: !data && !error,
  };
}

export function useConceptAnswers(conceptUuid: string): { data: Array<ConceptAnswers>; isLoading: boolean } {
  const shouldFetch = typeof conceptUuid === 'string' && conceptUuid !== '';
  const { data, error } = useSWR<FetchResponse<ConceptResponse>, Error>(
    shouldFetch ? `/ws/rest/v1/concept/${conceptUuid}` : null,
    openmrsFetch,
  );
  if (error) {
    showToast({
      title: error.name,
      description: error.message,
      kind: 'error',
    });
  }
  return { data: data?.data?.answers, isLoading: !data && !error };
}
