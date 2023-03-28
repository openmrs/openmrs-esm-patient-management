import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment, AppointmentsFetchResponse } from '../types/index';
import { Provider } from '../types';
import { startOfDay } from '../constants';
import dayjs from 'dayjs';

export function useAppointments() {
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${startOfDay}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  return {
    appointmentQueueEntries: data ? data?.data : [],
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useCheckedInAppointments() {
  const apiUrl = `/ws/rest/v1/appointment/appointmentStatus?forDate=${startOfDay}&status=CheckedIn`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  return {
    checkedInAppointments: data ? data?.data : [],
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useProviders() {
  const customRepresentation = 'custom:(uuid,display,person:(age,display,gender,uuid))';
  const apiUrl = `/ws/rest/v1/provider?q=&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Provider> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    providers: data ? data.data?.results : [],
    isLoading,
    isError: error,
    isValidating,
  };
}

export function usePatientAppointments(patientUuid: string, startDate) {
  const abortController = new AbortController();

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

  const appointments = data?.data?.length ? data.data : [];

  const upcomingAppointments = appointments
    ?.sort((a, b) => (a.startDateTime > b.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) => dayjs(new Date(startDateTime).toISOString()).isAfter(new Date()));

  return {
    upcomingAppointment: upcomingAppointments ? upcomingAppointments?.[0] : null,
    isError: error,
    isLoading,
    isValidating,
  };
}
