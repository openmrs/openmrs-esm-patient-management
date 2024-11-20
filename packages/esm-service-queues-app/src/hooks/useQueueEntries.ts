import { type FetchResponse, openmrsFetch, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSWRConfig } from 'swr/_internal';
import isEqual from 'lodash-es/isEqual';

type QueueEntryResponse = FetchResponse<{
  results: Array<QueueEntry>;
  links: Array<{
    rel: 'prev' | 'next';
    uri: string;
  }>;
  totalCount: number;
}>;

const queueEntryBaseUrl = `${restBaseUrl}/queue-entry`;

const repString =
  'custom:(uuid,display,queue,status,patient:(uuid,display,person,identifiers:(uuid,display,identifier,identifierType)),visit:(uuid,display,startDatetime,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided),attributes:(uuid,display,value,attributeType)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

function getInitialUrl(rep: string, searchCriteria?: QueueEntrySearchCriteria) {
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

function getNextUrlFromResponse(data: QueueEntryResponse) {
  const next = data?.data?.links?.find((link) => link.rel === 'next');
  if (next) {
    const nextUrl = new URL(next.uri);
    // default for production
    if (nextUrl.origin === window.location.origin) {
      return nextUrl.toString();
    }

    // in development, the request should be routed through the local proxy
    return new URL(`${nextUrl.pathname}${nextUrl.search ? nextUrl.search : ''}`, window.location.origin).toString();
  }
  // There's no next URL
  return null;
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

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString){

  const [pageUrl, setPageUrl] = useState<string>(getInitialUrl(rep, searchCriteria));
  const {data,mutate,...rest}=useOpenmrsFetchAll<any>(pageUrl);

  useEffect(() => {
   setPageUrl(getInitialUrl(rep, searchCriteria));
 }, [searchCriteria,rep]);

  useEffect(()=>{
     mutate();
  },[pageUrl])

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
    queueEntries:data,
    mutate,
    ...rest
  }

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
