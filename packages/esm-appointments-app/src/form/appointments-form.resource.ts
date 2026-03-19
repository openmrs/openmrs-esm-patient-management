import { useCallback } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentPayload, type AppointmentService, type RecurringAppointmentsPayload } from '../types';
dayjs.extend(isToday);

export function useAppointmentService() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Array<AppointmentService> }, Error>(
    `${restBaseUrl}/appointmentService/all/full`,
    openmrsFetch,
  );

  return {
    data: data ? data.data : null,
    error,
    isLoading,
    mutate,
  };
}

export function saveAppointment(appointment: AppointmentPayload, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/appointment`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: appointment,
  });
}

export function saveRecurringAppointments(
  recurringAppointments: RecurringAppointmentsPayload,
  abortController: AbortController,
) {
  return openmrsFetch(`${restBaseUrl}/recurring-appointments`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: recurringAppointments,
  });
}

export const checkAppointmentConflict = async (appointmentPayload: AppointmentPayload) => {
  return await openmrsFetch(`${restBaseUrl}/appointments/conflicts`, {
    method: 'POST',
    body: {
      patientUuid: appointmentPayload.patientUuid,
      serviceUuid: appointmentPayload.serviceUuid,
      startDateTime: appointmentPayload.startDateTime,
      endDateTime: appointmentPayload.endDateTime,
      providers: [],
      locationUuid: appointmentPayload.locationUuid,
      appointmentKind: appointmentPayload.appointmentKind,
      ...(appointmentPayload.uuid && { uuid: appointmentPayload.uuid }),
    },
    headers: { 'Content-Type': 'application/json' },
  });
};
