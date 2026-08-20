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
  const url = `${restBaseUrl}/appointments/search`;

  const startDate = forDate ? dayjs(forDate).startOf('month').startOf('day').format(omrsDateFormat) : null;
  const endDate = forDate ? dayjs(forDate).endOf('month').endOf('day').format(omrsDateFormat) : null;

  const { data, isLoading, error } = useSWR<{ data: Array<Appointment> }, Error>(
    startDate && endDate ? [url, startDate, endDate] : null,
    () =>
      openmrsFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { startDate, endDate },
      }),
    { errorRetryCount: 2 },
  );

  const appointments = [...(data?.data ?? [])].sort((a, b) => (a.startDateTime ?? 0) - (b.startDateTime ?? 0));

  return { appointments, isLoading, error };
};
