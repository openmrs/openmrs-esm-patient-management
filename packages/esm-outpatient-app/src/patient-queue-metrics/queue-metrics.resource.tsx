import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useMetrics() {
  const metrics = { scheduled_appointments: 100, avarage_wait_time: 28, patients_waiting_for_service: 182 };
  const { data, error } = useSWR<{ data: { results: {} } }, Error>(`/ws/rest/v1/queue?`, openmrsFetch);

  return {
    data: metrics ? metrics : null,
    isError: error,
    isLoading: !data && !error,
  };
}
