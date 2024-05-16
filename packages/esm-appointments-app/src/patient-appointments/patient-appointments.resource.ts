import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);

const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;

export function usePatientAppointments(patientUuid: string, startDate: string, abortController: AbortController) {
  /*
    SWR isn't meant to make POST requests for data fetching. This is a consequence of the API only exposing this resource via POST.
    This works but likely isn't recommended.
  */
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

  const { data, error, isLoading, isValidating, mutate } = useSWR<AppointmentsFetchResponse, Error>(
    appointmentsSearchUrl,
    fetcher,
  );

  const appointments = data?.data?.length ? data.data : null;

  const pastAppointments = appointments
    ?.sort((a, b) => (b.startDateTime > a.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) =>
      dayjs(new Date(startDateTime).toISOString()).isBefore(new Date().setHours(0, 0, 0, 0)),
    );

  const upcomingAppointments = appointments
    ?.sort((a, b) => (a.startDateTime > b.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) => dayjs(new Date(startDateTime).toISOString()).isAfter(new Date()));

  const todaysAppointments = appointments
    ?.sort((a, b) => (a.startDateTime > b.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) => dayjs(new Date(startDateTime).toISOString()).isToday());

  return {
    data: data ? { pastAppointments, upcomingAppointments, todaysAppointments } : null,
    isError: error,
    isLoading,
    isValidating,
    mutate,
  };
}

// TODO: move?
export const changeAppointmentStatus = async (toStatus: string, appointmentUuid: string) => {
  const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `${restBaseUrl}/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
};
