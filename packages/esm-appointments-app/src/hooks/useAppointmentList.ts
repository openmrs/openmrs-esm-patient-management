import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import { useSelectedDate } from './useSelectedDate';
import { buildAppointmentsUrl } from '../helpers';

export const useAppointmentList = (date: string) => {
  const searchUrl = buildAppointmentsUrl(date);
  const { data, ...rest } = useSWR<AppointmentsFetchResponse, Error>(searchUrl, openmrsFetch);

  return {
    appointmentList: data?.data ?? [],
    // The error to show in place of the list. Once the list for this date has loaded, even an empty one,
    // a refresh that fails leaves it on screen, so that failure is not reported here.
    loadError: data ? undefined : rest.error,
    ...rest,
  };
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
