import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

// TO DO
// Replace this mock response with actual data
// Replace isLoading with actual loading status from swr
export function useAppointmentsMetrics() {
  const metrics = { scheduleAppointments: 100, missedAppointments: 28, providersAvailableToday: 182 };
  const url = ``;
  const { data, error } = useSWR<{ data: { results: {} } }, Error>(url, openmrsFetch);

  return {
    metrics: metrics,
    isError: error,
    isLoading: false, //!data && !error,
  };
}
