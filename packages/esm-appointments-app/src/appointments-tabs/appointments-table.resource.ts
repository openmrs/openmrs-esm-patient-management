import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentService, Appointment } from '../types';
import { formatAppointmentData, useAppointmentDate } from '../helpers';

export function useAppointments(status?: string) {
  const startDate = useAppointmentDate();
  const appointmentsByStatusUrl = `/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=${status}`;
  const allAppointmentsUrl = `/ws/rest/v1/appointment/all?forDate=${startDate}`;
  const { data, error, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(
    status ? allAppointmentsUrl : appointmentsByStatusUrl,
    openmrsFetch,
  );

  const formattedAppointments = useMemo(
    () => data?.data?.map((appointment) => formatAppointmentData(appointment)) ?? [],
    [data?.data],
  );

  return {
    appointments: formattedAppointments,
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
