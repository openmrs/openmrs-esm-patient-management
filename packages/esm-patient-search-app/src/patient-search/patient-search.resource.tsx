import { openmrsFetch } from '@openmrs/esm-framework';

export function performPatientSearch(query: string, objectVersion: string, ac: AbortController, includeDead: boolean) {
  const url = `/ws/fhir2/R4//Patient?name:contains=${query}&identifier=${query}={includeDead ? '&deceased=true,false' : ''}`;
  return openmrsFetch(url, {
    method: 'GET',
    signal: ac.signal,
  });
}
