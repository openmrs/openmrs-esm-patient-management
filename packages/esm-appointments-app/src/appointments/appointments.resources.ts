import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentService, AppointmentsFetchResponse, Provider } from '../types';

export const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;

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

  const { data, error, isLoading, isValidating } = useSWR<AppointmentsFetchResponse, Error>(
    appointmentsSearchUrl,
    fetcher,
  );

  const appointments = data?.data?.length
    ? data.data.sort((a, b) => (b.startDateTime > a.startDateTime ? 1 : -1))
    : null;

  return {
    data: data ? appointments : null,
    isError: error,
    isLoading,
    isValidating,
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

export function getAppointmentsByUuid(appointmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appointments/${appointmentUuid}`, {
    signal: abortController.signal,
  });
}

export function getAppointmentService(abortController: AbortController, uuid) {
  return openmrsFetch(`/ws/rest/v1/appointmentService?uuid=` + uuid, {
    signal: abortController.signal,
  });
}

export function getTimeSlots(abortController: AbortController) {
  //https://openmrs-spa.org/openmrs/ws/rest/v1/appointment/all?forDate=2020-03-02T21:00:00.000Z
}
