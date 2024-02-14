import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type QueueServiceInfo } from '../types';

export function useQueues(locationUuid?: string) {
  const apiUrl = '/ws/rest/v1/queue' + (locationUuid ? `?location=${locationUuid}` : '');

  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(apiUrl, openmrsFetch);

  return {
    queues: data?.data?.results ?? [],
  };
}
