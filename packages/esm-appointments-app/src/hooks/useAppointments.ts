import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { omrsDateFormat } from '../constants';
import { type Appointment, DurationPeriod } from '../types';
import { getAppointment, useSelectedDate } from '../helpers';
import isEmpty from 'lodash-es/isEmpty';
import { useMemo } from 'react';

export function useAppointments(status?: string, forDate?: string) {
  const { selectedDate } = useSelectedDate();
  const startDate = forDate ? forDate : selectedDate;
  const apiUrl = `${restBaseUrl}/appointment/appointmentStatus?forDate=${startDate}&status=${status}`;
  const allAppointmentsUrl = `${restBaseUrl}/appointment/all?forDate=${startDate}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(
    isEmpty(status) ? allAppointmentsUrl : apiUrl,
    openmrsFetch,
  );

  const appointments = useMemo(() => data?.data?.map((appointment) => getAppointment(appointment)) ?? [], [data?.data]);

  return {
    appointments,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

export const useDailyAppointments = (startDateTime: string) => {
  const url = `${restBaseUrl}/appointment/all?forDate=${startDateTime}`;
  const { data, error, isLoading } = useSWR<{ data: Array<Appointment> }>(startDateTime ? url : null, openmrsFetch);

  return {
    appointments: data?.data ?? [],
    isLoading,
    error: error,
  };
};

export const useAppointmentsByDurationPeriod = (date: string, durationPeriod: DurationPeriod) => {
  const abortController = new AbortController();
  const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;
  const { startDate, endDate } = getStartAndEndDate(durationPeriod, date);

  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        startDate: startDate,
        endDate: endDate,
      },
    });

  const url = `openmrs/${restBaseUrl}/appointments/search`;
  const { data, error, isLoading } = useSWR<{ data: Array<Appointment> }>(url, fetcher);
  return { isLoading, appointments: data?.data ?? [], error };
};

const getStartAndEndDate = (durationPeriod: DurationPeriod, date: string) => {
  if (durationPeriod === DurationPeriod.weekly) {
    const startDate = dayjs(new Date(date)).startOf('week').format(omrsDateFormat);
    const endDate = dayjs(new Date(date)).endOf('week').format(omrsDateFormat);
    return { startDate, endDate };
  }

  const startDate = dayjs(new Date(date)).startOf('week').format(omrsDateFormat);
  const endDate = dayjs(new Date(date)).endOf('week').format(omrsDateFormat);
  return { startDate, endDate };
};
