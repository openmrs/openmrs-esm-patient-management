import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment, QueueServiceInfo } from '../types';
import { startOfDay } from '../constants';

export function useServices(location: string) {
  const apiUrl = `/ws/rest/v1/queue?location=${location}`;

  const { data, isLoading } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(
    location ? apiUrl : null,
    openmrsFetch,
  );

  return {
    services: data ? data?.data?.results?.map((service) => service.display) : [],
    allServices: data ? data?.data.results : [],
    isLoading: isLoading,
  };
}

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
