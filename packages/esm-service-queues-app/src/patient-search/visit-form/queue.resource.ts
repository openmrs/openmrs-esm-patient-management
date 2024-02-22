import { openmrsFetch, restBaseUrl, toDateObjectStrict, toOmrsIsoString } from '@openmrs/esm-framework';
import { generateVisitQueueNumber } from '../../active-visits/active-visits-table.resource';
import { type Appointment } from '../../types';

export async function addQueueEntry(
  visitUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  queueServiceUuid: string,
  appointment: Appointment,

  locationUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  const abortController = new AbortController();

  await Promise.all([
    saveAppointment(appointment),
    generateVisitQueueNumber(locationUuid, visitUuid, queueServiceUuid, visitQueueNumberAttributeUuid),
  ]);

  return openmrsFetch(`${restBaseUrl}/visit-queue-entry`, {
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
        startedAt: new Date(),
      },
    },
  });
}

export async function saveAppointment(appointment: Appointment) {
  const abortController = new AbortController();

  await openmrsFetch(`${restBaseUrl}/appointment`, {
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
