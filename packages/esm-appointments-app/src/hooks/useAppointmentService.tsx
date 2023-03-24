import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { AppointmentService } from '../types';

export function useAppointmentServices() {
  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentService> }>(
    `/ws/rest/v1/appointmentService/all/default`,
    openmrsFetch,
  );
  return { serviceTypes: data?.data ?? [], isLoading, error };
}
