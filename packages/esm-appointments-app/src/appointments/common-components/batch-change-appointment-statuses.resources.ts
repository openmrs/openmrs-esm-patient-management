import { type FetchResponse, openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';

export function getActiveVisitsForPatient(
  patientUuid: string,
  abortController?: AbortController,
  v?: string,
): Promise<FetchResponse<{ results: Array<Visit> }>> {
  const custom = v ?? `default`;

  return openmrsFetch(`${restBaseUrl}/visit?patient=${patientUuid}&v=${custom}&includeInactive=false`, {
    signal: abortController?.signal,
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
}
