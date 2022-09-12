import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment } from '../types/index';
import dayjs from 'dayjs';
import { Provider } from '../types';

export function useAppointments() {
  const startDate = dayjs(new Date().setHours(0, 0, 0, 0)).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
  const apiUrl = `/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=Scheduled`;
  const { data, error, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  return {
    appointmentQueueEntries: data ? data?.data : [],
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export function useProviders() {
  const customRepresentation = 'custom:(uuid,display,person:(age,display,gender,uuid))';
  const apiUrl = `/ws/rest/v1/provider?q=&v=${customRepresentation}`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<Provider> } }, Error>(apiUrl, openmrsFetch);

  return {
    providers: data ? data.data?.results : [],
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
