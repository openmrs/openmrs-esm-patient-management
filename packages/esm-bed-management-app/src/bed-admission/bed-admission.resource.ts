import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';

export async function assignPatientBed(requestPayload, bedId): Promise<FetchResponse> {
  const abortController = new AbortController();
  abortController.abort();
  const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/beds/${bedId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestPayload,
  });
  return response;
}

export async function endPatientQueue(queueStatus, queueUuid): Promise<FetchResponse> {
  const abortController = new AbortController();
  abortController.abort();
  const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/patientqueue/${queueUuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: queueStatus,
  });
  return response;
}
