import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type AppointmentService } from '../types';

export function useAppointmentServices() {
  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentService> }>(
    `${restBaseUrl}/appointmentService/all/default`,
    openmrsFetch,
  );
  const sortedServices = data?.data ? [...data.data].sort((a, b) => a?.name?.localeCompare(b?.name)) : [];
  return { serviceTypes: sortedServices, isLoading, error };
}
