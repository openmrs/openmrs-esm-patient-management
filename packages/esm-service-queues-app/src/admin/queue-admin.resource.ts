import { useMemo } from 'react';
import useSWR from 'swr';
import { getLocale, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type QueueRoom, type Queue } from '../types';

export function useQueuesMutable() {
  const customRepresentation =
    'custom:(uuid,display,name,description,service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display),location:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue?v=${customRepresentation}`;

  const { data, ...rest } = useSWR<{ data: { results: Array<Queue> } }, Error>(apiUrl, openmrsFetch);

  const queues = useMemo(
    () => data?.data?.results.sort((a, b) => a.display.localeCompare(b.display, getLocale())) ?? [],
    [data?.data?.results],
  );

  return {
    queues,
    ...rest,
  };
}

export function useQueueRooms() {
  const customRepresentation = 'custom:(uuid,display,name,description,queue:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue-room?v=${customRepresentation}`;

  const { data, ...rest } = useSWR<{ data: { results: Array<QueueRoom> } }, Error>(apiUrl, openmrsFetch);

  const queueRooms = useMemo(
    () => data?.data?.results.sort((a, b) => a.display.localeCompare(b.display, getLocale())) ?? [],
    [data?.data?.results],
  );

  return {
    queueRooms,
    ...rest,
  };
}
