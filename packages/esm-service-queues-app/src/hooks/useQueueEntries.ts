import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getQueryParamsForSearch } from '../queue-table/queue-table.resource';

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

export function useQueueEntries({
  searchCriteria,
  rep = repString,
  currentPage = 1,
  pageSize = 50,
}: {
  searchCriteria?: QueueEntrySearchCriteria;
  rep?: string;
  currentPage?: number;
  pageSize?: number;
}) {
  const url = useMemo(() => {
    const apiUrl = `${restBaseUrl}/queue-entry`;
    const searchParams = getQueryParamsForSearch(searchCriteria);
    searchParams.append('v', rep);
    searchParams.append('totalCount', 'true');
    if (currentPage) {
      searchParams.append('startIndex', `${(currentPage - 1) * pageSize}`);
    }
    if (pageSize) {
      searchParams.append('limit', `${pageSize}`);
    }

    return `${apiUrl}?${searchParams.toString()}`;
  }, [searchCriteria, rep, currentPage, pageSize]);

  const { data, ...rest } = useSWR<QueueEntryResponse, Error>(url, openmrsFetch);

  return {
    queueEntries: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    hasPrevPage: data?.data?.links?.some((link) => link.rel === 'prev'),
    hasNextPage: data?.data?.links?.some((link) => link.rel === 'next'),
    ...rest,
  };
}

export function useQueueEntriesMetrics(searchCriteria?: QueueEntrySearchCriteria) {
  const searchParam = getQueryParamsForSearch(searchCriteria);
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
