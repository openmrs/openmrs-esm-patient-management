import { openmrsFetch, restBaseUrl, toDateObjectStrict, toOmrsIsoString } from '@openmrs/esm-framework';

export async function saveQueueEntry(
  visitUuid: string,
  queueUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  sortWeight: number,
  abortController: AbortController,
  locationUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  await Promise.all([
    generateVisitQueueNumber(locationUuid, visitUuid, queueUuid, abortController, visitQueueNumberAttributeUuid),
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
          uuid: queueUuid,
        },
        patient: {
          uuid: patientUuid,
        },
        startedAt: new Date(),
        sortWeight: sortWeight,
      },
    },
  });
}

export async function generateVisitQueueNumber(
  location: string,
  visitUuid: string,
  queueUuid: string,
  abortController: AbortController,
  visitQueueNumberAttributeUuid: string,
) {
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
