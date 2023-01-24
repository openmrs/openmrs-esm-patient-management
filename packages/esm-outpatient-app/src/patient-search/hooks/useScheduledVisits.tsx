import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { AppointmentsFetchResponse } from '../../types';

export function useScheduledVisits(patientUuid: string, abortController: AbortController) {
  let startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;

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

  // visits + or - 7 days before visit date
  const recentVisits = appointments?.filter(
    (appointment) =>
      dayjs((appointment.startDateTime / 1000) * 1000).isBefore(dayjs().add(7, 'day')) ||
      dayjs((appointment.startDateTime / 1000) * 1000).isBefore(dayjs().subtract(7, 'day')),
  );

  // visits past 7 days
  const futureVisits = appointments?.filter((appointment) =>
    dayjs((appointment.startDateTime / 1000) * 1000).isAfter(dayjs().add(7, 'day')),
  );

  return {
    appointments: data ? { recentVisits, futureVisits } : null,
    isError: error,
    isLoading,
  };
}
