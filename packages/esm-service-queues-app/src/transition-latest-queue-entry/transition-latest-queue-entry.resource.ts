import { openmrsFetch, type OpenmrsResource, type Patient, type Visit } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { type QueueEntry } from '../types';

export function useLatestQueueEntry(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `/ws/rest/v1/queue-entry?v=${encodedRepresentation}&patient=${patientUuid}&isEnded=false`;

  const fetcher = async (url: string) => {
    const response = await openmrsFetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR<{ results: QueueEntry[] }>(url, fetcher);

  const queueEntry =
    data?.results.reduce((latestEntry, currentEntry) => {
      if (!latestEntry || new Date(currentEntry.startedAt) > new Date(latestEntry.startedAt)) {
        return currentEntry;
      }
      return latestEntry;
    }, null) || null;

  return { data: queueEntry, error, isLoading, mutate };
}
