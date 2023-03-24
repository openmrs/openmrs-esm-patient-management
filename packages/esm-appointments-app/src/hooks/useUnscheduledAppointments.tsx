import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useAppointmentDate } from '../helpers';

export interface UnscheduledAppointmentsResponse {
  age: number;
  dob: number;
  gender: string;
  identifier: string;
  name: string;
  uuid: string;
  phoneNumber: string;
}

export function useUnscheduledAppointments() {
  const fromData = useAppointmentDate();
  const url = `/ws/rest/v1/appointment/unScheduledAppointment?forDate=${fromData}`;
  const { data, error, isLoading } = useSWR<{ data: Array<UnscheduledAppointmentsResponse> }>(url, openmrsFetch);
  return { isLoading, data: data?.data ?? [], error };
}
