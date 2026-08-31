import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs, { type Dayjs } from 'dayjs';
import { omrsDateFormat } from '../constants';
import { type Appointment } from '../types';

async function fetchAllMonthlyAppointments(forDate: Dayjs): Promise<{ data: Array<Appointment> }> {
  const daysInMonth = forDate.daysInMonth();
  const startOfMonth = forDate.startOf('month');

  const dayPromises = Array.from({ length: daysInMonth }, (_, i) => {
    const day = startOfMonth.add(i, 'day');
    const forDateParam = encodeURIComponent(day.startOf('day').format(omrsDateFormat));
    const url = `${restBaseUrl}/appointments?forDate=${forDateParam}`;
    return openmrsFetch<Array<Appointment>>(url).then((res) => res?.data ?? []);
  });

  const results = await Promise.allSettled(dayPromises);
  const fulfilled = results.filter((r): r is PromiseFulfilledResult<Array<Appointment>> => r.status === 'fulfilled');

  if (!fulfilled.length && results.length > 0) {
    const firstRejection = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    throw firstRejection?.reason ?? new Error('Failed to fetch monthly appointments');
  }

  const allAppointments = fulfilled.flatMap((r) => r.value);

  const uniqueMap = new Map<string, Appointment>();
  allAppointments.forEach((a) => {
    if (a?.uuid) {
      uniqueMap.set(a.uuid, a);
    }
  });

  return { data: Array.from(uniqueMap.values()) };
}

export const useMonthlyAppointments = (
  forDate: Dayjs | null,
): {
  appointments: Array<Appointment>;
  isLoading: boolean;
  error: Error | undefined;
} => {
  const monthKey = forDate ? forDate.format('YYYY-MM') : null;

  const { data, isLoading, error } = useSWR<{ data: Array<Appointment> }, Error>(
    monthKey ? ['monthly-appointments', monthKey] : null,
    () => fetchAllMonthlyAppointments(forDate),
    { errorRetryCount: 2 },
  );

  const appointments = useMemo(
    () =>
      [...(data?.data ?? [])].sort((a, b) => {
        const aTime = Number(a.startDateTime) || new Date(a.startDateTime ?? 0).getTime() || 0;
        const bTime = Number(b.startDateTime) || new Date(b.startDateTime ?? 0).getTime() || 0;
        return aTime - bTime;
      }),
    [data?.data],
  );

  return { appointments, isLoading, error };
};
