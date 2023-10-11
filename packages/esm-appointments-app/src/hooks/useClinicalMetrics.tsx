import useSWR from 'swr';
import dayjs from 'dayjs';
import uniqBy from 'lodash-es/uniqBy';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Appointment, AppointmentSummary } from '../types';
import { omrsDateFormat } from '../constants';
import {
  getHighestAppointmentServiceLoad,
  flattenAppointmentSummary,
  getServiceCountByAppointmentType,
  useAppointmentDate,
} from '../helpers';
import isEmpty from 'lodash-es/isEmpty';

export const useClinicalMetrics = () => {
  const { currentAppointmentDate } = useAppointmentDate();
  const endDate = dayjs(new Date(currentAppointmentDate).setHours(23, 59, 59, 59)).format(omrsDateFormat);
  const url = `/ws/rest/v1/appointment/appointmentSummary?startDate=${currentAppointmentDate}&endDate=${endDate}`;
  const { data, error, isLoading, mutate } = useSWR<{
    data: Array<AppointmentSummary>;
  }>(url, openmrsFetch);

  const totalAppointments = getServiceCountByAppointmentType(data?.data ?? [], 'allAppointmentsCount');

  const missedAppointments = getServiceCountByAppointmentType(data?.data ?? [], 'missedAppointmentsCount');

  const transformedAppointments = flattenAppointmentSummary(data?.data ?? []);
  const highestServiceLoad = getHighestAppointmentServiceLoad(transformedAppointments);

  return {
    isLoading,
    error,
    totalAppointments,
    missedAppointments,
    highestServiceLoad,
  };
};

export function useAllAppointmentsByDate() {
  const { currentAppointmentDate } = useAppointmentDate();
  const apiUrl = `/ws/rest/v1/appointment/all?forDate=${currentAppointmentDate}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const providersArray = data?.data?.filter(({ providers }) => providers !== null) ?? [];
  const providersCount = uniqBy(
    providersArray.map(({ providers }) => providers).flat(),
    (provider) => provider.uuid,
  ).length;
  return {
    totalProviders: providersCount ? providersCount : 0,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

export const useScheduledAppointment = (serviceUuid: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const url = `/ws/rest/v1/appointment/all?forDate=${currentAppointmentDate}`;

  const { data, error, isLoading, mutate } = useSWR<{
    data: Array<any>;
  }>(url, openmrsFetch);

  const totalScheduledAppointments = !isEmpty(serviceUuid)
    ? data?.data?.filter((appt) => appt?.service?.uuid === serviceUuid)?.length ?? 0
    : data?.data?.length ?? 0;

  return {
    isLoading,
    error,
    totalScheduledAppointments,
  };
};
