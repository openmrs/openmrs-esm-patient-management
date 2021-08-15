import { openmrsFetch } from '@openmrs/esm-framework';

export function performPatientSearch(query: string, objectVersion: string, ac: AbortController) {
  return openmrsFetch(`/ws/rest/v1/patient?q=${query}&v=${objectVersion}`, {
    method: 'GET',
    signal: ac.signal,
  });
}
