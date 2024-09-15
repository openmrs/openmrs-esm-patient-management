import {
  type FetchResponse,
  openmrsFetch,
  type OpenmrsResource,
  type Patient,
  type Visit,
} from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { type QueueEntry } from '../types';
import { FetcherResponse } from 'swr/_internal';

export function useLatestQueueEntry(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `/ws/rest/v1/queue-entry?v=${encodedRepresentation}&patient=${patientUuid}&isEnded=false`;
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
