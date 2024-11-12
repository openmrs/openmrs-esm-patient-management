import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type QueueEntry } from '../types';

export function useLatestQueueEntry(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
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
