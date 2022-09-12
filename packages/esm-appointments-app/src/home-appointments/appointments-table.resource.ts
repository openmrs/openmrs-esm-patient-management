import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentService, Appointment } from '../types';
import { useMemo } from 'react';
import { startDate } from '../helpers';
import { appointmentsData } from './appointments-data';
import { getTodaysAppointment } from '../helpers/helper';

export function useTodayAppointments() {
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${startDate}`;
  const { data, error, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  const serverAppointments = data?.data?.map((appointment) => getTodaysAppointment(appointment)) ?? [];

  const results = useMemo(
    () => ({
      appointments: serverAppointments.length
        ? serverAppointments
        : appointmentsData?.map((appointment) => getTodaysAppointment(appointment)),
      isLoading: !data && !error,
      isError: error,
      isValidating,
      mutate,
    }),
    [data, error, isValidating, mutate],
  );
  return results;
}

export function useServices() {
  const apiUrl = `/ws/rest/v1/appointmentService/all/default`;
  const { data, error, isValidating } = useSWR<{ data: Array<AppointmentService> }, Error>(apiUrl, openmrsFetch);

  return {
    services: data ? data.data : [],
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
