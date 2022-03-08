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
  const { data, error } = useSWR<FetchResponse<ConceptResponse>>(`/ws/rest/v1/concept/${conceptUuid}`, openmrsFetch);
  return [data?.data?.answers, !data && !error];
}
