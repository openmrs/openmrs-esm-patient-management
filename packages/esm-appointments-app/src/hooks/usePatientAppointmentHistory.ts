import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import { useAppointmentsStore } from '../store';
import { type UseAppointmentHookResult } from './hook-types';

interface AppointmentCountData {
  missedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  upcomingAppointments: number;
}

export function usePatientAppointmentHistory(patientUuid: string): UseAppointmentHookResult<AppointmentCountData> {
  const abortController = new AbortController();
  const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;
  const { selectedDate } = useAppointmentsStore();

  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: selectedDate,
      },
    });

  const { data, error, isLoading } = useSWR<AppointmentsFetchResponse, Error>(
    patientUuid ? appointmentsSearchUrl : null,
    fetcher,
  );

  const missedAppointments = data?.data?.length
    ? data.data.filter((appointment) => appointment.status === 'Missed').length
    : 0;
  const completedAppointments = data?.data?.length
    ? data.data.filter((appointment) => appointment.status === 'Completed').length
    : 0;
  const cancelledAppointments = data?.data?.length
    ? data.data.filter((appointment) => appointment.status === 'Cancelled').length
    : 0;
  const upcomingAppointments = data?.data?.length
    ? data.data?.filter((appointment: any) => dayjs((appointment.startDateTime / 1000) * 1000).isAfter(dayjs())).length
    : 0;

  return {
    data: { missedAppointments, completedAppointments, cancelledAppointments, upcomingAppointments },
    error: error ?? null,
    isLoading,
  };
}
