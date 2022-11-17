import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Appointment } from '../../../types';

export function useAllAppointments() {
  const { data, error } = useSWR<{ data: Array<Appointment> }, Error>(`/ws/rest/v1/appointment/all`, openmrsFetch);
  return {
    allAppointments: data ? data.data : null,
    isError: error,
    isLoading: !data && !error,
  };
}
