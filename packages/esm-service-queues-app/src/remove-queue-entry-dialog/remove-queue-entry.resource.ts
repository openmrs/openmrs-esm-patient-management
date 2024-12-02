import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, updateVisit } from '@openmrs/esm-framework';
import { type AppointmentsFetchResponse, type EndVisitPayload } from '../types';
import { endPatientStatus } from '../active-visits/active-visits-table.resource';
import { omrsDateFormat, timeZone } from '../constants';

const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);

export async function endQueueEntry(
  queueUuid: string,
  queueEntryUuid: string,
  endedAt: Date,
  endCurrentVisitPayload: EndVisitPayload,
  visitUuid: string,
  appointments: any,
) {
  const abortController = new AbortController();

  if (endCurrentVisitPayload) {
    if (appointments?.length) {
      await Promise.all(
        appointments.map(async (appointment) => {
          await changeAppointmentStatus('Completed', appointment.uuid);
        }),
      );
    }

    await endPatientStatus(queueUuid, queueEntryUuid, endedAt);

    try {
      const response = await updateVisit(visitUuid, endCurrentVisitPayload, abortController);
      return response.status;
    } catch (error) {
      return error;
    }
  } else {
    try {
      return await endPatientStatus(queueUuid, queueEntryUuid, endedAt);
    } catch (error) {
      return error;
    }
  }
}

export function useCheckedInAppointments(patientUuid: string, startDate: string) {
  const abortController = new AbortController();

  const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;
  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: startDate,
      },
    });

  const { data, error, isLoading, isValidating } = useSWR<AppointmentsFetchResponse, Error>(
    appointmentsSearchUrl,
    fetcher,
  );

  const appointments = data?.data?.length
    ? data.data.filter((appointment) => appointment.status === 'CheckedIn')
    : null;

  return {
    data: data ? appointments : null,
    error,
    isLoading,
    isValidating,
  };
}

export async function changeAppointmentStatus(toStatus: string, appointmentUuid: string) {
  const url = `${restBaseUrl}/appointments/${appointmentUuid}/status-change`;
  return openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}
