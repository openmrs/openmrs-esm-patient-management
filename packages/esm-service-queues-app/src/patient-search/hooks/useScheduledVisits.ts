import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { type AppointmentsFetchResponse } from '../../types';

const fetcher = (appointmentsSearchUrl: string, patientUuid: string) => {
  const abortController = new AbortController();
  let startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();

  return openmrsFetch(appointmentsSearchUrl, {
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
};

export function useScheduledVisits(patientUuid: string) {
  const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;

  const { data, error, isLoading } = useSWR<AppointmentsFetchResponse, Error>(
    patientUuid ? [appointmentsSearchUrl, patientUuid] : null,
    ([appointmentsSearchUrl, patientUuid]) => fetcher(appointmentsSearchUrl, patientUuid as string),
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
