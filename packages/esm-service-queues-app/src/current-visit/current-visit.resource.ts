import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import { visitCustomRepresentation } from '../constants';

export function useVisit(visitUuid?: string) {
  const apiUrl = `${restBaseUrl}/visit/${visitUuid}?v=${visitCustomRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Visit }, Error>(
    visitUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    visit: data ? data.data : null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
