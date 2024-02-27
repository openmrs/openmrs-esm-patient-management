import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type Queue } from '../types';

export function useQueues(locationUuid?: string) {
  const customRepresentation =
    'custom:(uuid,display,name,description,allowedPriorities:(uuid,display),allowedStatuses:(uuid,display),location:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue?v=${customRepresentation}` + (locationUuid ? `&location=${locationUuid}` : '');

  const { data, ...rest } = useSWRImmutable<{ data: { results: Array<Queue> } }, Error>(apiUrl, openmrsFetch);

  return {
    queues: data?.data?.results ?? [],
    ...rest,
  };
}
