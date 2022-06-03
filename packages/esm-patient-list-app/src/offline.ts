import {
  fetchCurrentPatient,
  makeUrl,
  messageOmrsServiceWorker,
  setupDynamicOfflineDataHandler,
} from '@openmrs/esm-framework';
import { cacheForOfflineHeaders } from './constants';

export function setupOffline() {
  setupDynamicOfflineDataHandler({
    id: 'esm-patient-list-app:patient',
    type: 'patient',
    displayName: 'Patient list',
    async isSynced(patientUuid) {
      const expectedUrls = [`/ws/fhir2/R4/Patient/${patientUuid}`];
      const absoluteExpectedUrls = expectedUrls.map((url) => window.origin + makeUrl(url));
      const cache = await caches.open('omrs-spa-cache-v1');
      const keys = (await cache.keys()).map((key) => key.url);
      return absoluteExpectedUrls.every((url) => keys.includes(url));
    },
    async sync(patientUuid) {
      await messageOmrsServiceWorker({
        type: 'registerDynamicRoute',
        pattern: `/ws/fhir2/R4/Patient/${patientUuid}`,
      });

      await fetchCurrentPatient(patientUuid, { headers: cacheForOfflineHeaders });
    },
  });
}
