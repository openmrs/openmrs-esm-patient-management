import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentsFetchResponse } from '../types';
import { buildAppointmentsUrl } from '../helpers';
import { generateMockAppointments } from '../calendar/utils/mock-appointments';

const isMockAppointmentsEnabled = (isoDate: string | null): boolean =>
  isoDate != null && new URLSearchParams(window.location.search).get('mockAppointments') === '1';

export const useAppointmentsByDate = (
  isoDate: string | null,
): {
  appointments: Array<Appointment>;
  isLoading: boolean;
  error: Error | undefined;
} => {
  const mockEnabled = useMemo(() => isMockAppointmentsEnabled(isoDate), [isoDate]);
  const url = isoDate && !mockEnabled ? buildAppointmentsUrl(isoDate) : null;

  const { data, isLoading, error } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  if (mockEnabled && isoDate) {
    return { appointments: generateMockAppointments(isoDate), isLoading: false, error: undefined };
  }

  const appointments = [...(data?.data ?? [])].sort((a, b) => (a.startDateTime ?? 0) - (b.startDateTime ?? 0));

  return { appointments, isLoading, error };
};
