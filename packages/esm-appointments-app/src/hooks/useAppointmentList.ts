import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import { useSelectedDate } from './useSelectedDate';
import { buildAppointmentsUrl } from '../helpers';

export const useAppointmentList = (date: string) => {
  const searchUrl = buildAppointmentsUrl(date);
  const { data, ...rest } = useSWR<AppointmentsFetchResponse, Error>(searchUrl, openmrsFetch);
  return { appointmentList: data?.data ?? [], ...rest };
};

/**
 * This is a non-standard API that does not come with the appointments module by default
 * @param startDate
 * @returns
 */
export const useEarlyAppointmentList = (startDate?: string) => {
  const selectedDate = useSelectedDate();
  const forDate = startDate ? startDate : selectedDate;
  const url = `${restBaseUrl}/appointment/earlyAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  return { earlyAppointmentList: data?.data ?? [], isLoading, error };
};
