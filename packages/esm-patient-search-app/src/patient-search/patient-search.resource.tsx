import { openmrsFetch } from '@openmrs/esm-framework';

export function performPatientSearch(query: string, objectVersion: string, ac: AbortController, includeDead: boolean) {
  const url = `/ws/rest/v1/patient?q=${query}&v=${objectVersion}&includeDead=${includeDead}`;
  return openmrsFetch(url, {
    method: 'GET',
    signal: ac.signal,
  });
}
