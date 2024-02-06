import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type Appointment, type QueueServiceInfo } from '../types';
import { startOfDay } from '../constants';

export function useServiceMetricsCount(service: string, location: string) {
  const status = 'Waiting';
  const apiUrl = `/ws/rest/v1/queue-entry-metrics?service=${service}&status=${status}&location=${location}`;

  const { data } = useSWRImmutable<
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

export const useAppointmentMetrics = () => {
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${startOfDay}`;

  const { data, error, isLoading } = useSWR<{
    data: Array<Appointment>;
  }>(apiUrl, openmrsFetch);

  const totalScheduledAppointments = data?.data.length ?? 0;

  return {
    isLoading,
    error,
    totalScheduledAppointments,
  };
};
