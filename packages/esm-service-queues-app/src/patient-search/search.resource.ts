import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function findPatients(query: string, objectVersion: string, controller: AbortController, includeDead: boolean) {
  const url = `${restBaseUrl}/patient?q=${query}&v=${objectVersion}&includeDead=${includeDead}`;

  return openmrsFetch(url, {
    method: 'GET',
    signal: controller.signal,
  });
}
