import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentsFetchResponse } from '../types';
import { useSelectedDate } from './useSelectedDate';

export function usePatientAppointmentHistory(patientUuid: string) {
  const abortController = new AbortController();
  const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;

  const selectedDate = useSelectedDate();

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

  const { data, error, isLoading, isValidating } = useSWR<AppointmentsFetchResponse, Error>(
    patientUuid ? [appointmentsSearchUrl, patientUuid, selectedDate] : null,
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
    ? data.data?.filter((appointment: Appointment) =>
        dayjs((Number(appointment.startDateTime) / 1000) * 1000).isAfter(dayjs()),
      ).length
    : 0;

  return {
    appointmentsCount: { missedAppointments, completedAppointments, cancelledAppointments, upcomingAppointments },
    error,
    isLoading,
    isValidating,
  };
}
