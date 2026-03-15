import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse } from '../types';
import { useAppointmentsStore } from '../store';
import { useRef, useEffect } from 'react';

export function usePatientAppointmentHistory(patientUuid: string) {
  const abortControllerRef = useRef(new AbortController());

  useEffect(() => {
    const controller = abortControllerRef.current;
    return () => controller.abort();
  }, []);
  const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;
  const { selectedDate } = useAppointmentsStore();

  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortControllerRef.current.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: selectedDate,
      },
    });

  const { data, error, isLoading, isValidating } = useSWR<AppointmentsFetchResponse, Error>(
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
    appointmentsCount: { missedAppointments, completedAppointments, cancelledAppointments, upcomingAppointments },
    error,
    isLoading,
    isValidating,
  };
}
