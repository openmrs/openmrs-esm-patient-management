import { useMemo } from 'react';
import useSWR from 'swr';
import { getLocale, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type QueueRoom, type Queue } from '../types';

const queuesCustomRepresentation =
  'custom:(uuid,display,name,description,service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display),location:(uuid,display))';
const queueRoomsCustomRepresentation = 'custom:(uuid,display,name,description,queue:(uuid,display))';

export const queuesMutationKey = `${restBaseUrl}/queue?v=${queuesCustomRepresentation}`;
export const queueRoomsMutationKey = `${restBaseUrl}/queue-room?v=${queueRoomsCustomRepresentation}`;

export function useQueuesMutable() {
  const { data, ...rest } = useSWR<{ data: { results: Array<Queue> } }, Error>(queuesMutationKey, openmrsFetch);

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
  const { data, ...rest } = useSWR<{ data: { results: Array<QueueRoom> } }, Error>(queueRoomsMutationKey, openmrsFetch);

  const queueRooms = useMemo(
    () => data?.data?.results.sort((a, b) => a.display.localeCompare(b.display, getLocale())) ?? [],
    [data?.data?.results],
  );

  return {
    queueRooms,
    ...rest,
  };
}
