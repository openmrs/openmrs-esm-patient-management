import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentPayload, AppointmentService, AppointmentSummary, Provider } from '../../types';
import dayjs from 'dayjs';
import { omrsDateFormat } from '../../constants';
import first from 'lodash-es/first';

export const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;

export function useServices() {
  const apiUrl = `/ws/rest/v1/appointmentService/all/default`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<AppointmentService> }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    services: data ? data.data : [],
    isLoading,
    isError: error,
    isValidating,
  };
}
export function useProviders() {
  const { data, error, isLoading } = useSWR<{ data: { results: Array<Provider> } }, Error>(
    `/ws/rest/v1/provider`,
    openmrsFetch,
  );

  return {
    providers: data ? data.data.results : null,
    isError: error,
    isLoading,
  };
}

export function saveAppointment(appointment: AppointmentPayload) {
  const abortController = new AbortController();

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

export const cancelAppointment = async (toStatus: string, appointmentUuid: string) => {
  const abortController = new AbortController();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `/ws/rest/v1/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
};

export const useAppointmentSummary = (fromDate: Date, serviceUuid: string): Array<{ date: string; count: number }> => {
  const startDate = dayjs(fromDate).startOf('week').format(omrsDateFormat);
  const endDate = dayjs(startDate).add(2, 'week').format(omrsDateFormat);
  const url = `/ws/rest/v1/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;
  const { data, error } = useSWR<{ data: Array<AppointmentSummary> }>(url, openmrsFetch);
  const results = first(data?.data.filter(({ appointmentService }) => appointmentService.uuid === serviceUuid));
  const appointmentCountMap = results?.appointmentCountMap;
  return Object.entries(appointmentCountMap ?? [])
    .map(([key, value]) => ({
      date: key,
      count: value.allAppointmentsCount,
    }))
    .sort((dateA, dateB) => new Date(dateA.date).getTime() - new Date(dateB.date).getTime());
};

// NOTE: I don't think this is used anywhere?
export const checkAppointmentConflict = async (appointmentPayload: AppointmentPayload) => {
  return await openmrsFetch('/ws/rest/v1/appointments/conflicts', {
    method: 'POST',
    body: {
      patientUuid: appointmentPayload.patientUuid,
      serviceUuid: appointmentPayload.serviceUuid,
      startDateTime: appointmentPayload.startDateTime,
      endDateTime: appointmentPayload.endDateTime,
      providers: [],
      locationUuid: appointmentPayload.locationUuid,
      appointmentKind: appointmentPayload.appointmentKind,
    },
    headers: { 'Content-Type': 'application/json' },
  });
};

export const toAppointmentDateTime = (fromDate: Date, hours: number, minutes: number) => {
  return dayjs(new Date(dayjs(fromDate).year(), dayjs(fromDate).month(), dayjs(fromDate).date(), hours, minutes));
};
