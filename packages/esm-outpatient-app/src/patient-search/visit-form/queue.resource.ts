import { FetchResponse, openmrsObservableFetch } from '@openmrs/esm-framework';
import { QueueEntryPayload } from '../../types';
import { Observable } from 'rxjs';

export function saveQueueEntry(
  payload: QueueEntryPayload,
  abortController: AbortController,
): Observable<FetchResponse<any>> {
  return openmrsObservableFetch(`/ws/rest/v1/visit-queue-entry`, {
    signal: abortController.signal,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: payload,
  });
}
