import { openmrsFetch, restBaseUrl, updateVisit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { endPatientStatus } from '../active-visits/active-visits-table.resource';
import { type AppointmentsFetchResponse, type EndVisitPayload } from '../types';
import useSWR from 'swr';
import { omrsDateFormat, timeZone } from '../constants';
import { first } from 'rxjs/operators';

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
      appointments.forEach(async (appointment) => {
        await Promise.all([changeAppointmentStatus('Completed', appointment.uuid)]);
      });
    }

    await Promise.all([endPatientStatus(queueUuid, queueEntryUuid, endedAt)]);

    return updateVisit(visitUuid, endCurrentVisitPayload, abortController)
      .pipe(first())
      .subscribe(
        (response) => {
          return response.status;
        },
        (error) => {
          return error;
        },
      );
  } else {
    return await Promise.all([endPatientStatus(queueUuid, queueEntryUuid, endedAt)])
      .then((res) => {
        return res;
      })
      .catch((error) => {
        return error;
      });
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
    isError: error,
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
