import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentPayload, AppointmentService, Appointment } from '../types';
import { useMemo } from 'react';
import { getAppointment, startDate } from '../helpers';

export function useAppointments(status: string) {
  const apiUrl = `/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=${status}`;
  const { data, error, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);
  const appointments = useMemo(() => data?.data?.map((appointment) => getAppointment(appointment)) ?? [], [data?.data]);

  return {
    appointments,
    isLoading: !data && !error,
    isError: error,
    isValidating,
    mutate,
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

export function useServices() {
  const apiUrl = `/ws/rest/v1/appointmentService/all/default`;
  const { data, error, isValidating } = useSWR<{ data: Array<AppointmentService> }, Error>(apiUrl, openmrsFetch);

  return {
    services: data ? data.data : [],
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
