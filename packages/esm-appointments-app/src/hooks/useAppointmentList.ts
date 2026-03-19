import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import { useAppointmentsStore } from '../store';
import { type UseAppointmentHookResult } from './hook-types';

export const useAppointmentList = (date: string): UseAppointmentHookResult<AppointmentsFetchResponse['data']> => {
  const startOfDay = dayjs(date).startOf('day').toISOString();
  const searchUrl = `${restBaseUrl}/appointments?forDate=${startOfDay}`;

  const { data, error, isLoading } = useSWR<AppointmentsFetchResponse, Error>(searchUrl, openmrsFetch);
  return { data: data?.data ?? [], error: error ?? null, isLoading };
};

/**
 * This is a non-standard API that does not come with the appointments module by default
 * @param startDate
 * @returns
 */
export const useEarlyAppointmentList = (
  startDate?: string,
): UseAppointmentHookResult<AppointmentsFetchResponse['data']> => {
  const { selectedDate } = useAppointmentsStore();
  const forDate = startDate ? startDate : selectedDate;
  const url = `${restBaseUrl}/appointment/earlyAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  return { data: data?.data ?? [], error: error ?? null, isLoading };
};
