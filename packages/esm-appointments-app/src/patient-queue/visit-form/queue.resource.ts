import { FetchResponse, openmrsObservableFetch } from '@openmrs/esm-framework';
import { Observable } from 'rxjs';

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
