import { openmrsFetch } from '@openmrs/esm-framework';

export function voidQueueEntry(
  previousQueueUuid: string,
  abortController: AbortController,
  queueEntryUuid: string,
  endedAt: Date,
) {
  return openmrsFetch(`/ws/rest/v1/queue/${previousQueueUuid}/entry/${queueEntryUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      endedAt: endedAt,
    },
  });
}
