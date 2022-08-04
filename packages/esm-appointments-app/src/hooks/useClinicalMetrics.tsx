import useSWR from 'swr';
import dayjs from 'dayjs';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentSummary } from '../types';
import {
  getHighestAppointmentServiceLoad,
  flattenAppointmentSummary,
  getServiceCountByAppointmentType,
} from '../helpers/helper';
import { omrsDateFormat } from '../constants';

export const useClinicalMetrics = () => {
  const startDate = dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat);
  const endDate = dayjs(new Date().setHours(23, 59, 59, 59)).format(omrsDateFormat);
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
