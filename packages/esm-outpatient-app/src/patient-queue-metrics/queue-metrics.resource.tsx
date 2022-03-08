import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useMetrics() {
  const metrics = { scheduled_appointments: 100, average_wait_time: 28, patients_waiting_for_service: 182 };
  const { data, error } = useSWR<{ data: { results: {} } }, Error>(`/ws/rest/v1/queue?`, openmrsFetch);

  return {
    metrics: metrics,
    isError: error,
    isLoading: !data && !error,
  };
}
