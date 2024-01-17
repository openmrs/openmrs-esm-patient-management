import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type QueueServiceInfo } from '../types';

export function useQueues(locationUuid?: string) {
  const customRepresentation =
    'custom:(uuid,display,name,description,allowedPriorities:(uuid,display),allowedStatuses:(uuid,display))';
  const apiUrl = `/ws/rest/v1/queue?v=${customRepresentation}` + (locationUuid ? `&location=${locationUuid}` : '');

  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(apiUrl, openmrsFetch);

  return {
    queues: data?.data?.results ?? [],
  };
}
