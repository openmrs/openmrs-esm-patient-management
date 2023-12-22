import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';

export const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;

export function useAppointments(patientUuid: string, startDate: string) {
  const abortController = new AbortController();

  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: startDate,
      },
    });

  const { data, error, isLoading, isValidating } = useSWR<AppointmentsFetchResponse, Error>(
    appointmentsSearchUrl,
    fetcher,
  );

  const appointments = data?.data?.length
    ? data.data.sort((a, b) => (b.startDateTime > a.startDateTime ? 1 : -1))
    : null;

  const upcomingAppointment = appointments?.find((appointment) =>
    dayjs((appointment.startDateTime / 1000) * 1000).isAfter(dayjs()),
  );

  return {
    upcomingAppointment: upcomingAppointment ? upcomingAppointment : null,
    isError: error,
    isLoading,
    isValidating,
  };
}
