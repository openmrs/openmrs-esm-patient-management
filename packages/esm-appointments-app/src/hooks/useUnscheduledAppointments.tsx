import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useAppointmentDate } from '../helpers';

export interface Response {
  age: number;
  dob: number;
  gender: string;
  identifier: string;
  name: string;
  uuid: string;
  phoneNumber: string;
}

export function useUnscheduledAppointments() {
  const { currentAppointmentDate } = useAppointmentDate();
  const url = `/ws/rest/v1/appointment/unScheduledAppointment?forDate=${currentAppointmentDate}`;
  const { data, error, isLoading } = useSWR<{ data: Array<Response> }>(url, openmrsFetch, { errorRetryCount: 2 });
  return { isLoading, data: data?.data ?? [], error };
}
