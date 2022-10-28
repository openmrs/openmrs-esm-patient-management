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
import uniqBy from 'lodash-es/uniqBy';

export const useClinicalMetrics = () => {
  const appointmentDate = useAppointmentDate();
  const endDate = dayjs(new Date(appointmentDate).setHours(23, 59, 59, 59)).format(omrsDateFormat);
  const url = `/ws/rest/v1/appointment/appointmentSummary?startDate=${appointmentDate}&endDate=${endDate}`;
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

  const providersArray = data?.data?.filter(({ providers }) => providers !== null) ?? [];
  const providersCount = uniqBy(
    providersArray.map(({ providers }) => providers).flat(),
    (provider) => provider.uuid,
  ).length;
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
