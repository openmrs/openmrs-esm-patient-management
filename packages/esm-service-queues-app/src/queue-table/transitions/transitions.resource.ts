import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

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
export function transitionQueueEntry(params: TransitionQueueEntryParams, abortController?: AbortController) {
  return openmrsFetch(`${restBaseUrl}/queue-entry-transition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController?.signal,
    body: params,
  });
}
