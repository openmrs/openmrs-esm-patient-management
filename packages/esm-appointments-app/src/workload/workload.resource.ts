import useSWR from 'swr';
import dayjs from 'dayjs';
import first from 'lodash-es/first';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentSummary } from '../types';
import { omrsDateFormat } from '../constants';
interface AppointmentCount {
  date: string;
  count: number;
}

export const getMonthlyCalendarDistribution = (startDate: Date, appointmentCount: Array<AppointmentCount>) => {
  const distributionHashTable = new Map<string, number>([]);
  for (let i = 0; i <= 35; i++) {
    distributionHashTable.set(dayjs(startDate).add(i, 'day').format('YYYY-MM-DD'), 0);
  }
  appointmentCount.map(({ date, count }) => {
    if (distributionHashTable.has(date)) {
      distributionHashTable.set(date, count);
    }
  });

  return Array.from(distributionHashTable).flatMap(([date, value]) => ({ date: date, count: value }));
};

export const useCalendarDistribution = (
  serviceUuid: string,
  distributionType: 'month' | 'week',
  appointmentDate: Date,
) => {
  const appointmentSummary = useAppointmentSummary(new Date(appointmentDate), serviceUuid);
  const monthlyData = getMonthlyCalendarDistribution(new Date(appointmentDate), appointmentSummary) ?? [];
  return distributionType === 'month' ? monthlyData : monthlyData.slice(0, 7);
};

export const useAppointmentSummary = (fromDate: Date, serviceUuid: string): Array<{ date: string; count: number }> => {
  const startDate = dayjs(fromDate).startOf('week').format(omrsDateFormat);
  const endDate = dayjs(startDate).add(2, 'week').format(omrsDateFormat);
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;
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
