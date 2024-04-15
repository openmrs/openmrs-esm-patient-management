import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import dayjs from 'dayjs';
import { useContext } from 'react';
import SelectedDateContext from './selectedDateContext';

export const useAppointmentList = (appointmentStatus: string, date?: string) => {
  const { selectedDate } = useContext(SelectedDateContext);
  const startDate = date ? date : selectedDate;
  const endDate = dayjs(startDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZZ'); // TODO: fix? is this correct?
  const searchUrl = `${restBaseUrl}/appointments/search`;
  const abortController = new AbortController();

  const fetcher = ([url, startDate, endDate, status]) =>
    openmrsFetch(url, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        startDate: startDate,
        endDate: endDate,
        status: status,
      },
    });

  const { data, error, isLoading, mutate } = useSWR<AppointmentsFetchResponse, Error>(
    [searchUrl, startDate, endDate, appointmentStatus],
    fetcher,
    { errorRetryCount: 2 },
  );

  return { appointmentList: data?.data ?? [], isLoading, error, mutate };
};

export const useEarlyAppointmentList = (startDate?: string) => {
  const { selectedDate } = useContext(SelectedDateContext);
  const forDate = startDate ? startDate : selectedDate;
  const url = `${restBaseUrl}/appointment/earlyAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  return { earlyAppointmentList: data?.data ?? [], isLoading, error };
};
