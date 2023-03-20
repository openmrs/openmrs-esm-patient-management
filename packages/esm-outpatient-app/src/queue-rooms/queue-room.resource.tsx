import { openmrsFetch } from '@openmrs/esm-framework';

export function saveQueueRoom(name: string, description: string, queueUuid, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/queueroom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      name: name,
      description: description,
      queue: {
        uuid: queueUuid,
      },
    },
  });
}
