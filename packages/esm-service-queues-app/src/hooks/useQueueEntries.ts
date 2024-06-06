import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { Queue, type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cache, useSWRConfig } from 'swr/_internal';

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
  searchParam.append('limit', '4');

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
  if (data?.data?.links?.some((link) => link.rel === 'next')) {
    const nextUrl = new URL(data.data.links.find((link) => link.rel === 'next')?.uri);
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

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString) {
  const [data, setData] = useState<Array<Array<QueueEntry>>>([]);
  const [totalCount, setTotalCount] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageUrl, setPageUrl] = useState<string>(getInitialUrl(rep, searchCriteria));
  const [error, setError] = useState<Error>();
  const { mutateQueueEntries } = useMutateQueueEntries();
  const [waitingForMutate, setWaitingForMutate] = useState(false);

  const { data: pageData, isValidating, error: pageError } = useSWR<QueueEntryResponse, Error>(pageUrl, openmrsFetch);

  useEffect(() => {
    const nextUrl = getNextUrlFromResponse(pageData);
    const stillWaitingForMutate = waitingForMutate && !isValidating;
    if (waitingForMutate && isValidating) {
      setWaitingForMutate(false);
    }
    if (pageData && !isValidating && !stillWaitingForMutate) {
      if (pageData?.data?.totalCount && pageData?.data?.totalCount !== totalCount) {
        setTotalCount(pageData?.data?.totalCount);
      }
      if (pageData?.data?.results?.length) {
        const newData = [...data];
        newData[currentPage] = pageData?.data?.results;
        setData(newData);
      }
      setCurrentPage(currentPage + 1);
      setPageUrl(nextUrl);
      const inMutateMode = data.length > currentPage;
      if (inMutateMode && nextUrl) {
        setWaitingForMutate(true);
      }
    }
    if (!nextUrl) {
      if (data.length > currentPage + 1) {
        setData((prevData) => {
          const newData = [...prevData];
          newData.splice(currentPage + 1);
          return newData;
        });
      }
    }
  }, [pageData, data, currentPage, totalCount, waitingForMutate, isValidating]);

  useEffect(() => {
    if (pageError) {
      setError(pageError);
    }
  }, [pageError]);

  const queueUpdateListener = useCallback(() => {
    setWaitingForMutate(true);
    setCurrentPage(0);
    setPageUrl(getInitialUrl(rep, searchCriteria));
  }, [rep, searchCriteria]);

  useEffect(() => {
    window.addEventListener('queue-entry-updated', queueUpdateListener);
    return () => {
      window.removeEventListener('queue-entry-updated', queueUpdateListener);
    };
  }, [queueUpdateListener]);

  const queueEntries = useMemo(() => data.flat(), [data]);

  return {
    queueEntries,
    totalCount,
    isLoading: totalCount && queueEntries.length < totalCount,
    isValidating: isValidating || currentPage < data.length,
    error,
    mutate: mutateQueueEntries,
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
