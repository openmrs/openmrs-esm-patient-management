import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type QueueServiceInfo } from '../types';

// deprecated. use useQueues from ../hooks
export function useQueues(locationUuid?: string) {
  const customRepresentation =
    'custom:(uuid,display,name,description,service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display),location:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue?v=${customRepresentation}` + (locationUuid ? `&location=${locationUuid}` : '');

  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(apiUrl, openmrsFetch);

  return {
    queues: data?.data?.results ?? [],
  };
}
