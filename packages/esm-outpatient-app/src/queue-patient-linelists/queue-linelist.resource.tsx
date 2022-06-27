import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment } from '../types/index';

export function useAppointments() {
  const { data, error } = useSWR<{ data: { results: Array<Appointment> } }, Error>(
    `/ws/rest/v1/appointments`,
    openmrsFetch,
  );

  return {
    appointmentQueueEntries: data ? data.data?.results : null,
    isError: error,
    isLoading: !data && !error,
  };
}
