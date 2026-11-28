import useSWR from 'swr';
import dayjs from 'dayjs';
import first from 'lodash-es/first';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentSummary } from '../types';

export const useMonthlyCalendarDistribution = (
  serviceUuid: string,
  distributionType: 'month' | 'week',
  appointmentDate: Date,
) => {
  const appointmentSummary = useMonthlyAppointmentSummary(appointmentDate, serviceUuid);

  return distributionType === 'month' ? appointmentSummary : appointmentSummary.slice(0, 6);
};

export const useMonthlyAppointmentSummary = (
  fromDate: Date,
  serviceUuid: string,
): Array<{ date: string; count: number }> => {
  const startDate = dayjs(fromDate).startOf('month').toISOString();
  const endDate = dayjs(fromDate).endOf('month').toISOString();
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
  const { data } = useSWR<{ data: Array<AppointmentSummary> }>(url, openmrsFetch);

  const results = first(data?.data?.filter(({ appointmentService }) => appointmentService.uuid === serviceUuid));
  const appointmentCountMap = results?.appointmentCountMap;

  return Object.entries(appointmentCountMap ?? [])
    .map(([key, value]) => ({
      date: key,
      count: value.allAppointmentsCount,
    }))
    .sort((dateA, dateB) => new Date(dateA.date).getTime() - new Date(dateB.date).getTime());
};
