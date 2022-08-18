import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Appointment } from '../types';

interface AppointmentsReturnType {
  isLoading: boolean;
  appointments: Array<Appointment>;
}

export const useAppointment = (startDateTime: string): AppointmentsReturnType => {
  const url = `/ws/rest/v1/appointment/all?forDate=${startDateTime}`;
  const { data, error } = useSWR<{ data: Array<Appointment> }>(url, openmrsFetch);
  const appointments = data?.data ?? [];

  return {
    appointments: appointments,
    isLoading: !data && !error,
  };
};
