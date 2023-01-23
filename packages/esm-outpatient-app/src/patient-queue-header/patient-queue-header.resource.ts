import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';
import { QueueClinic } from '../types';

export function useQueueClinics() {
  const apiUrl = `/ws/rest/v1/queue-clinic`;
  const { data, error } = useSWRImmutable<{ data: { results: Array<QueueClinic> } }, Error>(apiUrl, openmrsFetch);

  return {
    clinics: data ? data.data?.results : [],
    error,
    isLoading: !data && !error,
  };
}
