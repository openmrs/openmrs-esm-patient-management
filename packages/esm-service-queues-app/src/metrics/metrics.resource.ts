import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type WaitTime } from '../types';

export function useAverageWaitTime(serviceUuid: string, locationUuid: string, statusUuid: string) {
  const apiUrl =
    `${restBaseUrl}/queue-entry-metrics?metric=averageWaitTime` +
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
