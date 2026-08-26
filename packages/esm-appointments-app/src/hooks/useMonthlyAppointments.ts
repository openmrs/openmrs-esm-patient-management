import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs, { type Dayjs } from 'dayjs';
import { omrsDateFormat } from '../constants';
import { type Appointment } from '../types';

export const useMonthlyAppointments = (
  forDate: Dayjs | null,
): {
  appointments: Array<Appointment>;
  isLoading: boolean;
  error: Error | undefined;
} => {
  const url = `${restBaseUrl}/appointments/search?limit=5000`;

  const startDate = forDate ? dayjs(forDate).startOf('month').format(omrsDateFormat) : null;
  const endDate = forDate ? dayjs(forDate).endOf('month').format(omrsDateFormat) : null;

  const { data, isLoading, error } = useSWR<{ data: Array<Appointment> }, Error>(
    startDate && endDate ? [url, startDate, endDate] : null,
    () =>
      openmrsFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { startDate, endDate, limit: 5000 },
      }),
    { errorRetryCount: 2 },
  );

  const appointments = useMemo(
    () =>
      [...(data?.data ?? [])]
        .filter((a) => {
          if (!forDate || a.startDateTime == null) return false;
          const parsed = isNaN(Number(a.startDateTime)) ? a.startDateTime : Number(a.startDateTime);
          return dayjs(parsed).isSame(forDate, 'month');
        })
        .sort((a, b) => {
          const aTime = Number(a.startDateTime) || new Date(a.startDateTime ?? 0).getTime() || 0;
          const bTime = Number(b.startDateTime) || new Date(b.startDateTime ?? 0).getTime() || 0;
          return aTime - bTime;
        }),
    [data?.data, forDate],
  );

  return { appointments, isLoading, error };
};
