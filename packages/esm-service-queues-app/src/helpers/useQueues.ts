import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type QueueServiceInfo } from '../types';

export function useQueues(locationUuid?: string) {
  const apiUrl = `${restBaseUrl}/queue` + (locationUuid ? `?location=${locationUuid}` : '');

  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(apiUrl, openmrsFetch);

  return {
    queues: data?.data?.results ?? [],
  };
}
