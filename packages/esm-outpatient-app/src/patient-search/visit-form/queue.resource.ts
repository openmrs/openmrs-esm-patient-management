import {
  FetchResponse,
  openmrsFetch,
  openmrsObservableFetch,
  toDateObjectStrict,
  toOmrsIsoString,
} from '@openmrs/esm-framework';
import { Observable } from 'rxjs';
import { Appointment } from '../../types';

export function saveQueueEntry(payload: any, abortController: AbortController): Observable<FetchResponse<any>> {
  return openmrsObservableFetch(`/ws/rest/v1/visit-queue-entry`, {
    signal: abortController.signal,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: payload,
  });
}

export async function addQueueEntry(
  visitUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  queueServiceUuid: string,
  appointment: Appointment,
  abortController: AbortController,
) {
  await Promise.all([saveAppointment(appointment, abortController)]);

  return openmrsFetch(`/ws/rest/v1/visit-queue-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      visit: { uuid: visitUuid },
      queueEntry: {
        status: {
          uuid: status,
        },
        priority: {
          uuid: priority,
        },
        queue: {
          uuid: queueServiceUuid,
        },
        patient: {
          uuid: patientUuid,
        },
        startedAt: toDateObjectStrict(toOmrsIsoString(new Date())),
      },
    },
  });
}

export async function saveAppointment(appointment: Appointment, abortController: AbortController) {
  await openmrsFetch(`/ws/rest/v1/appointment`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      patientUuid: appointment?.patient.uuid,
      serviceUuid: appointment?.service?.uuid,
      startDateTime: appointment?.startDateTime,
      endDateTime: appointment?.endDateTime,
      appointmentKind: appointment?.appointmentKind,
      locationUuid: appointment?.location?.uuid,
      comments: appointment?.comments,
      status: 'CheckedIn',
      appointmentNumber: appointment?.appointmentNumber,
      uuid: appointment?.uuid,
      providerUuid: appointment?.provider?.uuid,
    },
  });
}
