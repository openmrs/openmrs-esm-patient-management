import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment, QueueServiceInfo } from '../types';
import { startOfDay } from '../constants';

export function useMetrics() {
  const metrics = { scheduled_appointments: 100, average_wait_time: 28, patients_waiting_for_service: 182 };
  const { data, error, isLoading } = useSWR<{ data: { results: {} } }, Error>(`/ws/rest/v1/queue?`, openmrsFetch);

  return {
    // Returns placeholder mock data, soon to be replaced with actual data from the backend
    metrics: metrics,
    isError: error,
    isLoading,
  };
}

export function useServices(location: string) {
  const apiUrl = `/ws/rest/v1/queue?location=${location}`;
  const { data, isLoading } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    services: data ? data?.data?.results?.map((service) => service.display) : [],
    allServices: data ? data?.data.results : [],
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
  >(apiUrl, openmrsFetch);

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
