import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentsFetchResponse } from '../types';

/**
 * Fetches the list of appointments for a specific date.
 * Uses the standard /ws/rest/v1/appointments?forDate= endpoint.
 *
 * @param isoDate - Date string in YYYY-MM-DD format (or null/undefined to skip fetching)
 */
export function useAppointmentsByDate(isoDate: string | null | undefined): {
  appointments: Array<Appointment>;
  isLoading: boolean;
  error: Error | undefined;
} {
  const startOfDay = isoDate ? dayjs(isoDate).startOf('day').toISOString() : null;
  const url = startOfDay ? `${restBaseUrl}/appointments?forDate=${startOfDay}` : null;

  const { data, isLoading, error } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  return {
    appointments: data?.data ?? [],
    isLoading,
    error,
  };
}
