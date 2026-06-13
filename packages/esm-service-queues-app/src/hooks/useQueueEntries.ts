import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';

const queueEntryBaseUrl = `${restBaseUrl}/queue-entry`;

const repString =
  'custom:(uuid,display,queue:(uuid,display,name),status:(uuid,display),patient:(uuid,display,person:(uuid,display,age,birthdate,gender),identifiers:(uuid,identifier,identifierType:(uuid,display))),visit:(uuid,startDatetime,attributes:(uuid,value,attributeType:(uuid))),priority:(uuid,display),priorityComment,sortWeight,startedAt,endedAt,queueComingFrom:(uuid,display),previousQueueEntry:(uuid,startedAt,status:(uuid,display)))';

export function useMutateQueueEntries() {
  const { mutate, cache } = useSWRConfig();
  const mutateQueueEntries = useCallback(() => {
    const promises: Promise<unknown>[] = [];
    for (const key of cache.keys()) {
      if (key.includes(`${restBaseUrl}/queue-entry`) || key.includes(`${restBaseUrl}/visit-queue-entry`)) {
        promises.push(mutate(key));
      }
    }
    return Promise.all(promises);
  }, [mutate, cache]);

  return useMemo(
    () => ({
      mutateQueueEntries,
    }),
    [mutateQueueEntries],
  );
}

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString) {
  const searchParam = new URLSearchParams();
  searchParam.append('v', rep);
  searchParam.append('totalCount', 'true');

  if (searchCriteria) {
    for (let [key, value] of Object.entries(searchCriteria)) {
      if (value != null) {
        searchParam.append(key, value?.toString());
      }
    }
  }

  const { data, ...rest } = useOpenmrsFetchAll<QueueEntry>(`${queueEntryBaseUrl}?${searchParam.toString()}`);

  return {
    queueEntries: data ?? [],
    ...rest,
  };
}

export function useQueueEntriesMetrics(searchCriteria?: QueueEntrySearchCriteria) {
  const searchParam = new URLSearchParams();
  for (let [key, value] of Object.entries(searchCriteria)) {
    if (value != null) {
      searchParam.append(key, value?.toString());
    }
  }
  const apiUrl = `${restBaseUrl}/queue-entry-metrics?` + searchParam.toString();

  const { data } = useSWR<
    {
      data: {
        count: number;
        averageWaitTime: number;
      };
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    count: data ? data?.data?.count : 0,
    averageWaitTime: data?.data?.averageWaitTime,
  };
}
