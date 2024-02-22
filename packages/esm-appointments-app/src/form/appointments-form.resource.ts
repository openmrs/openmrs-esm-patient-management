import dayjs from 'dayjs';
import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import {
  type AppointmentPayload,
  type AppointmentService,
  type AppointmentsFetchResponse,
  type RecurringAppointmentsPayload,
} from '../types';
import isToday from 'dayjs/plugin/isToday';
import { useCallback } from 'react';
dayjs.extend(isToday);

const appointmentUrlMatcher = '/ws/rest/v1/appointment';
const appointmentsSearchUrl = '/ws/rest/v1/appointments/search';

export function useMutateAppointments() {
  const { mutate } = useSWRConfig();
  // this mutate is intentionally broad because there may be many different keys that need to be invalidated when appointments are updated
  const mutateAppointments = useCallback(
    () =>
      mutate((key) => {
        return (
          (typeof key === 'string' && key.startsWith(appointmentUrlMatcher)) ||
          (Array.isArray(key) && key[0].startsWith(appointmentUrlMatcher))
        );
      }),
    [mutate],
  );

  return {
    mutateAppointments,
  };
}

export function useAppointments(patientUuid: string, startDate: string, abortController: AbortController) {
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

export function useAppointmentService() {
  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentService> }, Error>(
    `/ws/rest/v1/appointmentService/all/full`,
    openmrsFetch,
  );

  return {
    data: data ? data.data : null,
    isError: error,
    isLoading,
  };
}

export function saveAppointment(appointment: AppointmentPayload, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appointment`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: appointment,
  });
}

export function saveRecurringAppointments(
  recurringAppointments: RecurringAppointmentsPayload,
  abortController: AbortController,
) {
  return openmrsFetch(`/ws/rest/v1/recurring-appointments`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: recurringAppointments,
  });
}

// TODO refactor to use SWR?
export function getAppointmentsByUuid(appointmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appointments/${appointmentUuid}`, {
    signal: abortController.signal,
  });
}

// TODO refactor to use SWR?
export function getAppointmentService(abortController: AbortController, uuid) {
  return openmrsFetch(`/ws/rest/v1/appointmentService?uuid=` + uuid, {
    signal: abortController.signal,
  });
}

export const cancelAppointment = async (toStatus: string, appointmentUuid: string) => {
  const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `/ws/rest/v1/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
};
