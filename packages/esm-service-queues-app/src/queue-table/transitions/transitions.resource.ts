import { openmrsFetch } from '@openmrs/esm-framework';

interface TransitionQueueEntryParams {
  queueEntryToTransition: string;
  transitionDate?: string;
  newQueue?: string;
  newStatus?: string;
  newPriority?: string;
}

/**
 * A transition is defined as an action that ends a current queue entry and immediately starts a new one
 * with (slightly) different values. For now, this could be used to transition the queue entry's status,
 * priority or queue. This allows us to keep a history of queue entries through a patient's visit.
 * Note that there are some use cases (like RDE or data correction) where a transition is NOT appropriate.
 * @param params
 * @param abortController
 * @returns
 */
function transitionQueueEntry(params: TransitionQueueEntryParams, abortController?: AbortController) {
  return openmrsFetch(`/ws/rest/v1/queue-entry-transition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController?.signal,
    body: params,
  });
}

export function transitionQueueEntryStatus(queueEntryToTransition: string, newStatus: string) {
  return transitionQueueEntry({ queueEntryToTransition, newStatus });
}

export function transitionQueueEntryPriority(queueEntryToTransition: string, newPriority: string) {
  return transitionQueueEntry({ queueEntryToTransition, newPriority });
}

/**
 * A transfer is a special case of a transition that involving move a patient from one queue to another.
 * @param queueEntryToTransition
 * @param newQueue
 * @param newStatus
 * @param newPriority
 * @returns
 */
export function transferQueueEntry(
  queueEntryToTransition: string,
  newQueue: string,
  newStatus: string,
  newPriority: string,
) {
  return transitionQueueEntry({ queueEntryToTransition, newQueue, newStatus, newPriority });
}
