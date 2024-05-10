import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWRInfinite from 'swr/infinite';
import { useCallback, useEffect, useState } from 'react';

type QueueEntryResponse = FetchResponse<{
  results: Array<QueueEntry>;
  links: Array<{
    rel: 'prev' | 'next';
    uri: string;
  }>;
  totalCount: number;
}>;

const repString =
  'custom:(uuid,display,queue,status,patient,visit:(uuid,display,startDatetime,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString) {
  const [totalCount, setTotalCount] = useState<number>();

  const getUrl = useCallback(
    (pageIndex: number, previousPageData: QueueEntryResponse) => {
      if (pageIndex && !previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
        return null;
      }

      if (previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
        const nextUrl = new URL(previousPageData.data.links.find((link) => link.rel === 'next')?.uri);
        // default for production
        if (nextUrl.origin === window.location.origin) {
          return nextUrl;
        }

        // in development, the request should be funnelled through the local proxy
        return new URL(`${nextUrl.pathname}${nextUrl.search ? nextUrl.search : ''}`, window.location.origin).toString();
      }

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
    },
    [searchCriteria, rep],
  );

  const { data, size, setSize, ...rest } = useSWRInfinite<QueueEntryResponse, Error>(getUrl, openmrsFetch);

  useEffect(() => {
    if (data && data.length && data?.[data?.length - 1]?.data?.links?.some((link) => link.rel === 'next')) {
      // Calling for the next set of data
      setSize((prev) => prev + 1);
    }
  }, [data, setSize]);

  useEffect(() => {
    if (data?.[0]?.data?.totalCount && data[0].data.totalCount !== totalCount) {
      setTotalCount(data[0].data.totalCount);
    }
  }, [data?.[0], totalCount, setTotalCount]);

  const allResults: QueueEntry[] = data ? [].concat(...data?.map((response) => response?.data?.results)) : [];

  return {
    queueEntries: allResults,
    totalCount,
    ...rest,
  };
}
