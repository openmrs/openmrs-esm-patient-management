import {
  defineConfigSchema,
  fetchCurrentPatient,
  getAsyncLifecycle,
  makeUrl,
  messageOmrsServiceWorker,
  setupDynamicOfflineDataHandler,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-search-app';

const options = {
  featureName: 'patient-search',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const patientSearchIcon = getAsyncLifecycle(() => import('./patient-search-icon'), options);

// This extension renders the a Patient-Search Button, which when clicked, opens the search bar in an overlay.
export const patientSearchButton = getAsyncLifecycle(
  () => import('./patient-search-button/patient-search-button.component'),
  options,
);

// P.S. This extension is not compatible with the tablet view.
export const patientSearchBar = getAsyncLifecycle(() => import('./compact-patient-search-extension'), options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  setupDynamicOfflineDataHandler({
    id: 'esm-patient-search-app:patient',
    type: 'patient',
    displayName: 'Patient search',
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

      await fetchCurrentPatient(patientUuid);
    },
  });
}
