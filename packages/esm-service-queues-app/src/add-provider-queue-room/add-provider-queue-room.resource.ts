import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ProvidersQueueRoom, type QueueRoom } from '../types';

export function useQueueRooms(location: string, queueUuid: string) {
  const apiUrl = queueUuid
    ? `/ws/rest/v1/queueroom?location=${location}&queue=${queueUuid}`
    : `/ws/rest/v1/queueroom?location=${location}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<QueueRoom> } }, Error>(
    location ? apiUrl : null,
    openmrsFetch,
  );

  return {
    rooms: data ? data?.data?.results : [],
    isError: error,
    isLoading,
  };
}

export function addProviderToQueueRoom(queueRoomUuid: string, providerUuid) {
  const abortController = new AbortController();

  return openmrsFetch(`/ws/rest/v1/roomprovidermap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      queueRoom: {
        uuid: queueRoomUuid,
      },
      provider: {
        uuid: providerUuid,
      },
    },
  });
}

export function updateProviderToQueueRoom(queueProviderMapUuid: string, queueRoomUuid: string, providerUuid) {
  const abortController = new AbortController();

  return openmrsFetch(`/ws/rest/v1/roomprovidermap/${queueProviderMapUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      queueRoom: {
        uuid: queueRoomUuid,
      },
      provider: {
        uuid: providerUuid,
      },
    },
  });
}

export function useProvidersQueueRoom(providerUuid: string) {
  const apiUrl = `/ws/rest/v1/roomprovidermap?provider=${providerUuid}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Array<ProvidersQueueRoom> } }, Error>(
    providerUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    providerRoom: data ? data?.data?.results : [],
    isError: error,
    isLoading,
    mutate,
  };
}
