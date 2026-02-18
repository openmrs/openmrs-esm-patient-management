import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { queueEntryCustomRepresentation } from '../../constants';
import { type QueueEntry } from '../../types';

export function useLatestQueueEntry(patientUuid: string) {
  const encodedRepresentation = encodeURIComponent(queueEntryCustomRepresentation);
  const url = `${restBaseUrl}/queue-entry?v=${encodedRepresentation}&patient=${patientUuid}&isEnded=false`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: QueueEntry[] }>>(url, openmrsFetch);

  const queueEntry =
    data?.data?.results?.reduce((latestEntry, currentEntry) => {
      if (!latestEntry || new Date(currentEntry.startedAt) > new Date(latestEntry.startedAt)) {
        return currentEntry;
      }
      return latestEntry;
    }, null) || null;

  return { data: queueEntry, error, isLoading, mutate };
}
