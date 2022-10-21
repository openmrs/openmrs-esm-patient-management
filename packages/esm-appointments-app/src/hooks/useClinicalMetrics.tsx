import useSWR from 'swr';
import dayjs from 'dayjs';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment, AppointmentSummary } from '../types';
import {
  getHighestAppointmentServiceLoad,
  flattenAppointmentSummary,
  getServiceCountByAppointmentType,
  useAppointmentDate,
} from '../helpers';
import { omrsDateFormat } from '../constants';

export const useClinicalMetrics = () => {
  const startDate = useAppointmentDate();
  const endDate = dayjs(new Date(startDate).setHours(23, 59, 59, 59)).format(omrsDateFormat);
  const url = `/ws/rest/v1/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;
  const { data, error, mutate } = useSWR<{
    data: Array<AppointmentSummary>;
  }>(url, openmrsFetch);

  const totalAppointments = getServiceCountByAppointmentType(data?.data ?? [], 'allAppointmentsCount');

  const missedAppointments = getServiceCountByAppointmentType(data?.data ?? [], 'missedAppointmentsCount');

  const transformedAppointments = flattenAppointmentSummary(data?.data ?? []);
  const highestServiceLoad = getHighestAppointmentServiceLoad(transformedAppointments);

  return {
    isLoading: !data && !error,
    error,
    totalAppointments,
    missedAppointments,
    highestServiceLoad,
  };
};

export function useAllAppointmentsByDate() {
  const startDate = useAppointmentDate();
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${startDate}`;
  const { data, error, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(apiUrl, openmrsFetch);

  let providersCount = data?.data?.map((appointment) => appointment.providers).flat()?.length;

  return {
    totalProviders: providersCount ? providersCount : 0,
    isLoading: !data && !error,
    isError: error,
    isValidating,
    mutate,
  };
}

export const useScheduledAppointment = () => {
  const startDate = useAppointmentDate();
  const url = `/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=Scheduled`;

  const { data, error, mutate } = useSWR<{
    data: Array<AppointmentSummary>;
  }>(url, openmrsFetch);

  const totalScheduledAppointments = data?.data.length ?? 0;

  return {
    isLoading: !data && !error,
    error,
    totalScheduledAppointments,
  };
};
