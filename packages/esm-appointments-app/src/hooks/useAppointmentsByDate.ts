import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentsFetchResponse } from '../types';
import { buildAppointmentsUrl } from '../helpers';

export const useAppointmentsByDate = (
  isoDate: string | null | undefined,
): {
  appointments: Array<Appointment>;
  isLoading: boolean;
  error: Error | undefined;
} => {
  const url = isoDate ? buildAppointmentsUrl(isoDate) : null;

  const { data, isLoading, error } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const appointments = (data?.data ?? []).sort((a, b) => (a.startDateTime ?? 0) - (b.startDateTime ?? 0));

  return { appointments, isLoading, error };
};
