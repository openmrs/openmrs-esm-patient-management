import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import type { AppointmentService, AppointmentsFetchResponse } from '../types';
import SelectedDateContext from '../hooks/selectedDateContext';

export function useTodaysAppointments() {
  const { t } = useTranslation();
  const { selectedDate } = useContext(SelectedDateContext);

  const apiUrl = `${restBaseUrl}/appointment/all?forDate=${selectedDate}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<AppointmentsFetchResponse, Error>(
    selectedDate ? apiUrl : null,
    openmrsFetch,
  );

  const results = useMemo(() => {
    const appointments = data?.data ?? [];

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
  const apiUrl = `${restBaseUrl}/appointmentService/all/default`;
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
  const url = `${restBaseUrl}/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
};

export const undoAppointmentStatus = async (appointmentUuid: string) => {
  const abortController = new AbortController();
  const url = `${restBaseUrl}/appointment/undoStatusChange/${appointmentUuid}`;
  return await openmrsFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
};
