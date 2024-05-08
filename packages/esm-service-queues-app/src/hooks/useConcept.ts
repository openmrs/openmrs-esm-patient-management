import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type Concept } from '../types';

export function useConcept(uuid: string) {
  const apiUrl = uuid ? `${restBaseUrl}/concept/${uuid}` : undefined;
  const { data, error, isLoading } = useSWRImmutable<{ data: Concept }, Error>(apiUrl, openmrsFetch);
  return {
    concept: data?.data,
    error: error,
    isLoading: isLoading,
  };
}
