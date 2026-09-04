import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentsFetchResponse } from '../types';
import { buildAppointmentsUrl } from '../helpers';

const isDevEnvironment = (): boolean =>
  typeof process !== 'undefined' && Boolean(process?.env && process.env.NODE_ENV !== 'production');

const checkMockParam = (): boolean =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mockAppointments') === '1';

export const useAppointmentsByDate = (
  isoDate: string | null,
): {
  appointments: Array<Appointment>;
  isLoading: boolean;
  error: Error | undefined;
} => {
  const isDev = useMemo(() => isDevEnvironment(), []);
  const mockEnabled = Boolean(isDev && isoDate && checkMockParam());
  const [mockAppointments, setMockAppointments] = useState<Array<Appointment> | null>(null);

  useEffect(() => {
    if (mockEnabled && isoDate) {
      import('../calendar/utils/mock-appointments').then((mod) => {
        setMockAppointments(mod.generateMockAppointments(isoDate));
      });
    } else {
      setMockAppointments(null);
    }
  }, [mockEnabled, isoDate]);

  const url = isoDate && !mockEnabled ? buildAppointmentsUrl(isoDate) : null;

  const { data, isLoading, error } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const realAppointments = useMemo(() => {
    if (mockEnabled) return [];
    return [...(data?.data ?? [])].sort((a, b) => (a.startDateTime ?? 0) - (b.startDateTime ?? 0));
  }, [data, mockEnabled]);

  const appointments = mockAppointments ?? realAppointments;

  return {
    appointments,
    isLoading: mockEnabled ? mockAppointments === null : isLoading,
    error: mockEnabled ? undefined : error,
  };
};
