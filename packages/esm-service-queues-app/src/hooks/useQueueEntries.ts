import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import isEqual from 'lodash-es/isEqual';
import useSWR from 'swr';
import { useSWRConfig } from 'swr/_internal';
import { type FetchResponse, openmrsFetch, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';

export type QueueEntryResponse = FetchResponse<{
  results: Array<QueueEntry>;
  links: Array<{
    rel: 'prev' | 'next';
    uri: string;
  }>;
  totalCount: number;
}>;

const queueEntryBaseUrl = `${restBaseUrl}/queue-entry`;

export const repString =
  'custom:(uuid,display,queue,status,patient:(uuid,display,person,identifiers:(uuid,display,identifier,identifierType)),visit:(uuid,display,startDatetime,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided),attributes:(uuid,display,value,attributeType)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

export function getInitialUrl(rep: string, searchCriteria?: QueueEntrySearchCriteria) {
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

  return `${queueEntryBaseUrl}?${searchParam.toString()}`;
}

export function useMutateQueueEntries() {
  const { mutate } = useSWRConfig();

  return {
    mutateQueueEntries: () => {
      return mutate((key) => {
        return (
          typeof key === 'string' &&
          (key.includes(`${restBaseUrl}/queue-entry`) || key.includes(`${restBaseUrl}/visit-queue-entry`))
        );
      }).then(() => {
        window.dispatchEvent(new CustomEvent('queue-entry-updated'));
      });
    },
  };
}

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString) {
  const initialMount = useRef<boolean>(true);
  const [pageUrl, setPageUrl] = useState<string>(getInitialUrl(rep, searchCriteria));
  const { data, mutate, ...rest } = useOpenmrsFetchAll<QueueEntry>(pageUrl, {
    swrInfiniteConfig: {
      revalidateFirstPage: false,
    },
  });

  useEffect(() => {
    setPageUrl(getInitialUrl(rep, searchCriteria));
  }, [searchCriteria, rep]);

  useEffect(() => {
    if (initialMount) {
      initialMount.current = false;
      return;
    }
    mutate();
  }, [pageUrl]);

  const queueUpdateListener = useCallback(() => {
    mutate();
  }, []);

  useEffect(() => {
    window.addEventListener('queue-entry-updated', queueUpdateListener);
    return () => {
      window.removeEventListener('queue-entry-updated', queueUpdateListener);
    };
  }, [queueUpdateListener]);

  return {
    queueEntries: data,
    mutate,
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
