import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentPayload, AppointmentService, Provider } from '../types';
import { startDate } from '../helpers';

export const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;

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

export function getAppointmentService(abortController: AbortController, uuid) {
  return openmrsFetch(`/ws/rest/v1/appointmentService?uuid=` + uuid, {
    signal: abortController.signal,
  });
}

export function fetchAppointments(abortController: AbortController) {
  const date = startDate;
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${date}&status=Scheduled`;
  return openmrsFetch(apiUrl, {
    signal: abortController.signal,
  });
}

export function useProviders() {
  const { data, error } = useSWR<{ data: { results: Array<Provider> } }, Error>(`/ws/rest/v1/provider`, openmrsFetch);

  return {
    data: data ? data.data.results : null,
    isError: error,
    isLoading: !data && !error,
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

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
