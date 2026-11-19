import useSWR from 'swr';
import dayjs from 'dayjs';
import first from 'lodash-es/first';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentSummary } from '../types';
import { omrsDateFormat } from '../constants';

export const useMonthlyAppointmentSummary = (
  fromDate: Date,
  serviceUuid: string,
): Array<{ date: string; count: number }> => {
  const startDate = dayjs(fromDate).startOf('month').format(omrsDateFormat);
  const endDate = dayjs(fromDate).endOf('month').format(omrsDateFormat);
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
