import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWRInfinite from 'swr/infinite';
import { useEffect, useState } from 'react';

type QueueEntryResponse = FetchResponse<{
  results: Array<QueueEntry>;
  links: Array<{
    rel: 'prev' | 'next';
    link: '';
  }>;
  totalCount: number;
}>;

const repString =
  'custom:(uuid,display,queue,status,patient,visit:(uuid,display,startDatetime,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString) {
  const [totalCount, setTotalCount] = useState<number>();
  const chunkSize = 50;

  const getUrl = (pageIndex: number, previousPageData: QueueEntryResponse) => {
    if (pageIndex && !previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
      return null;
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

    if (pageIndex) {
      searchParam.append('startIndex', `${pageIndex * chunkSize}`);
    }
    return `${apiUrl}?${searchParam.toString()}`;
  };

  const { data, ...rest } = useSWRInfinite<QueueEntryResponse, Error>(getUrl, openmrsFetch, {
    initialSize: totalCount ? Math.ceil(totalCount / chunkSize) : 1,
  });

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
