import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentService, Appointment } from '../types';
import { useMemo } from 'react';
import { getAppointment, useAppointmentDate } from '../helpers';
import isEmpty from 'lodash-es/isEmpty';

export function useAppointments(status?: string, forDate?: string) {
  const appointmentDate = useAppointmentDate();
  const startDate = forDate ? forDate : appointmentDate;
  const apiUrl = `/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=${status}`;
  const allAppointmentsUrl = `/ws/rest/v1/appointment/all?forDate=${startDate}`;
  const { data, error, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(
    isEmpty(status) ? allAppointmentsUrl : apiUrl,
    openmrsFetch,
  );

  const appointments = useMemo(() => data?.data?.map((appointment) => getAppointment(appointment)) ?? [], [data?.data]);

  return {
    appointments,
    isLoading: !data && !error,
    isError: error,
    isValidating,
    mutate,
  };
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
