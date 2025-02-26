import { useContext } from 'react';
import { uniqBy } from 'lodash-es';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentSummary } from '../types';
import { omrsDateFormat } from '../constants';
import {
  getHighestAppointmentServiceLoad,
  flattenAppointmentSummary,
  getServiceCountByAppointmentType,
} from '../helpers';
import SelectedDateContext from './selectedDateContext';

export const useClinicalMetrics = () => {
  const { selectedDate } = useContext(SelectedDateContext);
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

export function useAllAppointmentsByDate() {
  const { selectedDate } = useContext(SelectedDateContext);
  const apiUrl = `${restBaseUrl}/appointment/all?forDate=${selectedDate}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Array<Appointment> }, Error>(
    apiUrl,
    openmrsFetch,
  );

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
}

export const useScheduledAppointments = (appointmentServiceTypeUuids: string[]) => {
  const { selectedDate } = useContext(SelectedDateContext);
  const url = `${restBaseUrl}/appointment/all?forDate=${selectedDate}`;

  const { data, error, isLoading } = useSWR<
    {
      data: Array<Appointment>;
    },
    Error
  >(url, selectedDate ? openmrsFetch : null);

  const appointments = data?.data ?? [];

  const totalScheduledAppointments =
    appointmentServiceTypeUuids.length > 0
      ? appointments.filter((appointment) => appointmentServiceTypeUuids.includes(appointment?.service?.uuid))
          ?.length ?? 0
      : appointments.length ?? 0;

  return {
    error,
    isLoading,
    totalScheduledAppointments,
  };
};
