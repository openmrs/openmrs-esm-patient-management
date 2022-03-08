import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ConceptAnswers, ConceptResponse, PersonAttributeTypeResponse } from '../../patient-registration-types';

export function usePersonAttributeType(personAttributeTypeUuid: string): [PersonAttributeTypeResponse, boolean] {
  const { data, error } = useSWR<FetchResponse<PersonAttributeTypeResponse>>(
    `/ws/rest/v1/personattributetype/${personAttributeTypeUuid}`,
    openmrsFetch,
  );
  return [data?.data, !data && !error];
}

export function useConceptAnswers(conceptUuid: string): [Array<ConceptAnswers>, boolean] {
  const shouldFetch = typeof conceptUuid === 'string' && conceptUuid !== '';
  const { data, error } = useSWR<FetchResponse<ConceptResponse>>(
    shouldFetch ? `/ws/rest/v1/concept/${conceptUuid}` : null,
    openmrsFetch,
  );
  return [data?.data?.answers, !data && !error];
}
