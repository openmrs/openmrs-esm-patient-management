import { openmrsFetch } from '@openmrs/esm-framework';

export function requeueQueueEntry(
  priorityComment: string,
  queueUuid: string,
  queueEntryUuid: string,
  abortController: AbortController,
) {
  return openmrsFetch(`/ws/rest/v1/queue/${queueUuid}/entry/${queueEntryUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      priorityComment: priorityComment,
    },
  });
}
