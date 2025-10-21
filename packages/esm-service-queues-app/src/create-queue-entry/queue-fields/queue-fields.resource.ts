import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export async function generateVisitQueueNumber(
  location: string,
  visitUuid: string,
  queueUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  const abortController = new AbortController();

  await openmrsFetch(
    `${restBaseUrl}/queue-entry-number?location=${location}&queue=${queueUuid}&visit=${visitUuid}&visitAttributeType=${visitQueueNumberAttributeUuid}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    },
  );
}

export async function postQueueEntry(
  visitUuid: string,
  queueUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  sortWeight: number,
  locationUuid: string,
  visitQueueNumberAttributeUuid: string,
  providerUuid?: string,
) {
  const abortController = new AbortController();

  await Promise.all([generateVisitQueueNumber(locationUuid, visitUuid, queueUuid, visitQueueNumberAttributeUuid)]);

  const queueEntry: any = {
    status: {
      uuid: status,
    },
    priority: {
      uuid: priority,
    },
    queue: {
      uuid: queueUuid,
    },
    patient: {
      uuid: patientUuid,
    },
    startedAt: new Date(),
    sortWeight: sortWeight,
  };

  if (providerUuid) {
    queueEntry.providerWaitingFor = {
      uuid: providerUuid,
    };
  }

  return openmrsFetch(`${restBaseUrl}/visit-queue-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      visit: { uuid: visitUuid },
      queueEntry,
    },
  });
}
