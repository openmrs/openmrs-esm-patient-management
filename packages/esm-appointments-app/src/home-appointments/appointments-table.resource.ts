import { useMemo } from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentService, Appointment } from '../types';
import { useAppointmentDate, mapAppointmentProperties } from '../helpers';
import { omrsDateFormat } from '../constants';

export function useTodaysAppointments() {
  const { t } = useTranslation();
  const { currentAppointmentDate } = useAppointmentDate();

  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${currentAppointmentDate}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(
    currentAppointmentDate ? apiUrl : null,
    openmrsFetch,
  );

  const results = useMemo(() => {
    const appointments = data?.data?.map((appointment) => mapAppointmentProperties(appointment, t)) ?? [];

    return {
      appointments,
      isLoading,
      isError: error,
      isValidating,
      mutate,
    };
  }, [data?.data, error, isLoading, isValidating, mutate, t]);

  return results;
}

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

export const updateAppointmentStatus = async (toStatus: string, appointmentUuid: string) => {
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

export const undoAppointmentStatus = async (appointmentUuid: string) => {
  const abortController = new AbortController();
  const url = `/ws/rest/v1/appointment/undoStatusChange/${appointmentUuid}`;
  return await openmrsFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
};
