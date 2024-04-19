import { openmrsFetch, restBaseUrl, showModal, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ProvidersQueueRoom, type QueueRoom } from '../types';
import { useIsPermanentProviderQueueRoom, useSelectedServiceUuid } from '../helpers/helpers';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import { timeDiffInMinutes } from '../helpers/functions';
import { useEffect } from 'react';

export function useQueueRooms(location: string, queueUuid: string) {
  const apiUrl = queueUuid
    ? `${restBaseUrl}/queueroom?location=${location}&queue=${queueUuid}`
    : `${restBaseUrl}/queueroom?location=${location}`;

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

  return openmrsFetch(`${restBaseUrl}/roomprovidermap`, {
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

  return openmrsFetch(`${restBaseUrl}/roomprovidermap/${queueProviderMapUuid}`, {
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
  const apiUrl = `${restBaseUrl}/roomprovidermap?provider=${providerUuid}`;

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

// show the modal dialog if one is not configured
export function useShowProviderQueueRoomModal() {
  const currentServiceUuid = useSelectedServiceUuid();
  const { queueLocations } = useQueueLocations();
  const { rooms, isLoading: loading } = useQueueRooms(queueLocations[0]?.id, currentServiceUuid);
  const isPermanentProviderQueueRoom = useIsPermanentProviderQueueRoom();
  const currentUserSession = useSession();
  const providerUuid = currentUserSession?.currentProvider?.uuid;
  const differenceInTime = timeDiffInMinutes(
    new Date(),
    new Date(localStorage.getItem('lastUpdatedQueueRoomTimestamp')),
  );

  useEffect(() => {
    if (
      !loading &&
      rooms?.length > 0 &&
      differenceInTime >= 1 &&
      (isPermanentProviderQueueRoom == 'false' || isPermanentProviderQueueRoom === null)
    ) {
      const dispose = showModal('add-provider-to-room-modal', {
        closeModal: () => dispose(),
        providerUuid,
      });
    }
  }, [rooms, isPermanentProviderQueueRoom]);
}
