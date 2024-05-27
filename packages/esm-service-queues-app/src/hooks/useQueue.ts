import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type Queue } from '../types';

export function useQueue(queueUuid: string) {
  const customRepresentation =
    'custom:(uuid,display,name,description,service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display),location:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue/${queueUuid}?v=${customRepresentation}`;
  const { data, ...rest } = useSWRImmutable<{ data: Queue }, Error>(apiUrl, openmrsFetch);

  return {
    queue: data?.data,
    ...rest,
  };
}
