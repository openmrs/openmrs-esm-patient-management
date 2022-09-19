import useSWR from 'swr';
import dayjs from 'dayjs';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentService, Appointment } from '../types';
import { useMemo } from 'react';
import { startDate, getTodaysAppointment } from '../helpers';
import { appointmentsData } from './mock-appointments-data';
import { omrsDateFormat } from '../constants';

export function useTodayAppointments() {
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${startDate}`; // this is not currently working for dates beyond 14/09/2022
  const apiUrlForAll = `/ws/rest/v1/appointment/all`;
  const { data, error, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(apiUrlForAll, openmrsFetch);

  const serverAppointments = data?.data?.map((appointment) => getTodaysAppointment(appointment)) ?? [];

  const results = useMemo(
    () => ({
      appointments: serverAppointments.length
        ? serverAppointments
        : appointmentsData?.map((appointment) => getTodaysAppointment(appointment)),
      isLoading: !data && !error,
      isError: error,
      isValidating,
      mutate,
    }),
    [data, error, isValidating, mutate],
  );
  return results;
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

export const updateAppointmentStatus = async (toStatus: string, appointmentUuid: string, ac: AbortController) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `/ws/rest/v1/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
};

export const undoAppointmentStatus = async (appointmentUuid: string, ac: AbortController) => {
  const url = `/ws/rest/v1/appointment/undoStatusChange/${appointmentUuid}`;
  return await openmrsFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
};
