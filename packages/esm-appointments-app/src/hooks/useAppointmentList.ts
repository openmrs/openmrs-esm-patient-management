import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import { useAppointmentDate } from '../helpers';
import dayjs from 'dayjs';

export const useAppointmentList = (appointmentStatus: string, date?: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const startDate = date ? date : currentAppointmentDate;
  const endDate = dayjs(startDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZZ'); // TODO: fix? is this correct?
  const searchUrl = `/ws/rest/v1/appointments/search`;
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
  const { currentAppointmentDate } = useAppointmentDate();
  const forDate = startDate ? startDate : currentAppointmentDate;
  const url = `/ws/rest/v1/appointment/earlyAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  return { earlyAppointmentList: data?.data ?? [], isLoading, error };
};
