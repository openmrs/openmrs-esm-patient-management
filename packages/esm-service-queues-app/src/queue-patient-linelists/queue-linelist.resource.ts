import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentsFetchResponse } from '../types/index';
import { type Provider } from '../types';
import { startOfDay } from '../constants';
import dayjs from 'dayjs';
import { useRef, useEffect } from 'react';

export function useAppointments() {
  const apiUrl = `${restBaseUrl}/appointment/all?forDate=${startOfDay}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  return {
    appointmentQueueEntries: data ? data?.data : [],
    isLoading,
    error,
    isValidating,
  };
}

export function useCheckedInAppointments() {
  const apiUrl = `${restBaseUrl}/appointment/appointmentStatus?forDate=${startOfDay}&status=CheckedIn`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  return {
    checkedInAppointments: data ? data?.data : [],
    isLoading,
    error,
    isValidating,
  };
}

export function useProviders() {
  const customRepresentation = 'custom:(uuid,display,person:(age,display,gender,uuid))';
  const apiUrl = `${restBaseUrl}/provider?q=&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Provider> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    providers: data ? data.data?.results : [],
    isLoading,
    error,
    isValidating,
  };
}

export function usePatientAppointments(patientUuid: string, startDate) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;
  const fetcher = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    return openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortControllerRef.current.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid,
        startDate,
      },
    });
  };

  const { data, error, isLoading, isValidating } = useSWR<AppointmentsFetchResponse, Error>(
    appointmentsSearchUrl,
    fetcher,
  );

  const appointments = data?.data?.length ? data.data : [];

  const upcomingAppointments = appointments
    ?.sort((a, b) => (a.startDateTime > b.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) => dayjs(new Date(startDateTime).toISOString()).isAfter(new Date()));

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    upcomingAppointment: upcomingAppointments ? upcomingAppointments?.[0] : null,
    error,
    isLoading,
    isValidating,
  };
}
