import { FetchResponse, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { ConceptAnswers, ConceptResponse } from '../patient-registration.types';

export function useConcept(conceptUuid: string): { data: ConceptResponse; isLoading: boolean } {
  const shouldFetch = typeof conceptUuid === 'string' && conceptUuid !== '';
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<ConceptResponse>, Error>(
    shouldFetch ? `/ws/rest/v1/concept/${conceptUuid}` : null,
    openmrsFetch,
  );
  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
    });
  }
  return { data: data?.data, isLoading };
}

export function useConceptAnswers(conceptUuid: string): { data: Array<ConceptAnswers>; isLoading: boolean } {
  const shouldFetch = typeof conceptUuid === 'string' && conceptUuid !== '';
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<ConceptResponse>, Error>(
    shouldFetch ? `/ws/rest/v1/concept/${conceptUuid}` : null,
    openmrsFetch,
  );
  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
    });
  }
  return { data: data?.data?.answers, isLoading };
}
