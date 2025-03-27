import { useMemo } from 'react';
import { uniqBy } from 'lodash-es';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useSelectedDateContext } from './selected-date-context';
import {
  flattenAppointmentSummary,
  getHighestAppointmentServiceLoad,
  getServiceCountByAppointmentType,
} from '../helpers';
import { type Appointment, type AppointmentSummary } from '../types';

export const useClinicalMetrics = () => {
  const { selectedDate } = useSelectedDateContext();
  const endDate = dayjs(new Date(selectedDate).setHours(23, 59, 59, 59)).format(omrsDateFormat);
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${selectedDate}&endDate=${endDate}`;
  const { data, error, isLoading } = useSWR<{
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

export const useAppointmentsForDate = () => {
  const { selectedDate } = useSelectedDateContext();
  const url = selectedDate ? `${restBaseUrl}/appointment/all?forDate=${selectedDate}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(
    url,
    openmrsFetch,
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useAllAppointmentsByDate = () => {
  const { data, error, isLoading, isValidating, mutate } = useAppointmentsForDate();

  const providersArray = data?.data?.flatMap(({ providers }) => providers ?? []) ?? [];
  const validProviders = providersArray.filter((provider) => provider.response === 'ACCEPTED');
  const uniqueProviders = uniqBy(validProviders, (provider) => provider.uuid);
  const providersCount = uniqueProviders.length;

  return {
    error,
    isLoading,
    isValidating,
    mutate,
    totalProviders: providersCount ? providersCount : 0,
  };
};

export const useScheduledAppointments = (appointmentServiceTypeUuids: string[]) => {
  const { data, error, isLoading } = useAppointmentsForDate();

  const totalScheduledAppointments = useMemo(() => {
    const appointments = data?.data ?? [];

    if (appointmentServiceTypeUuids.length === 0) {
      return appointments.length;
    }

    return appointments.filter(
      (appointment) => appointment.service && appointmentServiceTypeUuids.includes(appointment.service.uuid),
    ).length;
  }, [data?.data, appointmentServiceTypeUuids]);

  return {
    error,
    isLoading,
    totalScheduledAppointments,
  };
};
