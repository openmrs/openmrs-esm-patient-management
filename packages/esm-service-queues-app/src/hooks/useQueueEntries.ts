import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useState } from 'react';

type QueueEntryResponse = FetchResponse<{
  results: Array<QueueEntry>;
  links: Array<{
    rel: 'prev' | 'next';
    uri: string;
  }>;
  totalCount: number;
}>;

const repString =
  'custom:(uuid,display,queue,status,patient:(uuid,display,person,identifiers:(uuid,display,identifier,identifierType)),visit:(uuid,display,startDatetime,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString) {
  const [fetchUrl, setFetchUrl] = useState<string>(null);

  const url = useMemo(() => {
    const apiUrl = `${restBaseUrl}/queue-entry`;
    const searchParam = new URLSearchParams();
    searchParam.append('v', rep);
    searchParam.append('totalCount', 'true');

    for (let [key, value] of Object.entries(searchCriteria)) {
      if (value != null) {
        searchParam.append(key, value?.toString());
      }
    }

    return `${apiUrl}?${searchParam.toString()}`;
  }, [searchCriteria, rep]);

  useEffect(() => {
    if (url) {
      setFetchUrl(url);
    }
  }, [url]);

  const { data, ...rest } = useSWR<QueueEntryResponse, Error>(fetchUrl, openmrsFetch);

  const fetchPrevPage = useCallback(() => {
    if (!data?.data?.links?.some((link) => link.rel === 'prev')) {
      return;
    }

    const prevUrl = new URL(data?.data?.links?.find((link) => link.rel === 'prev')?.uri);

    setFetchUrl(
      prevUrl.origin === window.location.origin
        ? prevUrl.toString()
        : new URL(`${prevUrl.pathname}${prevUrl.search ? prevUrl.search : ''}`, window.location.origin).toString(),
    );
  }, [setFetchUrl, data]);

  const fetchNextPage = useCallback(() => {
    if (!data?.data?.links?.some((link) => link.rel === 'next')) {
      return;
    }

    const nextUrl = new URL(data?.data?.links?.find((link) => link.rel === 'next')?.uri);

    setFetchUrl(
      nextUrl.origin === window.location.origin
        ? nextUrl.toString()
        : new URL(`${nextUrl.pathname}${nextUrl.search ? nextUrl.search : ''}`, window.location.origin).toString(),
    );
  }, [setFetchUrl, data]);

  return {
    queueEntries: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    hasPrevPage: data?.data?.links?.some((link) => link.rel === 'prev'),
    fetchPrevPage,
    hasNextPage: data?.data?.links?.some((link) => link.rel === 'next'),
    fetchNextPage,
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
