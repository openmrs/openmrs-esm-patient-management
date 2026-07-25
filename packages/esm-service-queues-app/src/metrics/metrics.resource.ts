import dayjs from 'dayjs';
import { useMemo } from 'react';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type WaitTime } from '../types';

export function useAverageWaitTime(serviceUuid: string, locationUuid: string, statusUuid: string) {
  // Service queues are an outpatient concern, so the average is scoped to entries started today rather
  // than to the whole history of the queue. The queue module parses this parameter with a strict
  // `yyyy-MM-dd HH:mm:ss` SimpleDateFormat and errors on anything else, so don't switch to ISO 8601 here.
  const startOfDay = useMemo(() => dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'), []);

  const apiUrl =
    `${restBaseUrl}/queue-entry-metrics?metric=averageWaitTime` +
    `&startedOnOrAfter=${encodeURIComponent(startOfDay)}` +
    (statusUuid ? `&status=${statusUuid}` : '') +
    (serviceUuid ? `&service=${serviceUuid}` : '') +
    (locationUuid ? `&location=${locationUuid}` : '');

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: WaitTime }, Error>(apiUrl, openmrsFetch);

  return {
    waitTime: data ? data?.data : null,
    isLoading,
    error,
    isValidating,
    mutate,
  };
}

export function useServiceMetricsCount(service: string, location: string) {
  const status = 'Waiting';
  const apiUrl =
    `${restBaseUrl}/queue-entry-metrics?status=${status}&isEnded=false` +
    (service ? `&service=${service}` : '') +
    (location ? `&location=${location}` : '');

  const { data } = useSWR<
    {
      data: {
        count: number;
      };
    },
    Error
  >(service ? apiUrl : null, openmrsFetch);

  return {
    serviceCount: data ? data?.data?.count : 0,
  };
}
