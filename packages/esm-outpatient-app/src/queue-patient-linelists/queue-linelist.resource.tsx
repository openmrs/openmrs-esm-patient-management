import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment } from '../types/index';
import { Provider } from '../types';
import { startOfDay } from '../constants';

export function useAppointments() {
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${startOfDay}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  return {
    appointmentQueueEntries: data ? data?.data : [],
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useCheckedInAppointments() {
  const apiUrl = `/ws/rest/v1/appointment/appointmentStatus?forDate=${startOfDay}&status=CheckedIn`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  return {
    checkedInAppointments: data ? data?.data : [],
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useProviders() {
  const customRepresentation = 'custom:(uuid,display,person:(age,display,gender,uuid))';
  const apiUrl = `/ws/rest/v1/provider?q=&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Provider> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    providers: data ? data.data?.results : [],
    isLoading,
    isError: error,
    isValidating,
  };
}
