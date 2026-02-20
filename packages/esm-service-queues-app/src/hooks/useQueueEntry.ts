import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { queueEntryCustomRepresentation } from '../constants';
import { type QueueEntry } from '../types';

/**
 * Fetches a single queue entry by UUID with full representation.
 * Used to get fresh data when opening action modals, preventing stale-data errors
 * when the entry has already been ended by another user or process.
 */
export function useQueueEntry(queueEntryUuid: string) {
  const encodedRepresentation = encodeURIComponent(queueEntryCustomRepresentation);
  const url = `${restBaseUrl}/queue-entry/${queueEntryUuid}?v=${encodedRepresentation}`;

  const { data, error, isLoading } = useSWR<FetchResponse<QueueEntry>>(queueEntryUuid ? url : null, openmrsFetch, {
    dedupingInterval: 0,
  });

  return {
    queueEntry: data?.data ?? null,
    error,
    isLoading,
  };
}
