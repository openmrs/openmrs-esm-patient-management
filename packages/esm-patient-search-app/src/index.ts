import {
  defineConfigSchema,
  fetchCurrentPatient,
  fhirBaseUrl,
  getSyncLifecycle,
  makeUrl,
  messageOmrsServiceWorker,
  setupDynamicOfflineDataHandler,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import rootComponent from './root.component';
import patientSearchIconComponent from './patient-search-icon';
import patientSearchButtonComponent from './patient-search-button/patient-search-button.component';
import patientSearchBarComponent from './compact-patient-search-extension';

const moduleName = '@openmrs/esm-patient-search-app';

const options = {
  featureName: 'patient-search',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const root = getSyncLifecycle(rootComponent, options);

export const patientSearchIcon = getSyncLifecycle(patientSearchIconComponent, options);

// This extension renders the a Patient-Search Button, which when clicked, opens the search bar in an overlay.
export const patientSearchButton = getSyncLifecycle(patientSearchButtonComponent, options);

// This extension is not compatible with the tablet view.
export const patientSearchBar = getSyncLifecycle(patientSearchBarComponent, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  setupDynamicOfflineDataHandler({
    id: 'esm-patient-search-app:patient',
    type: 'patient',
    displayName: 'Patient search',
    async isSynced(patientUuid) {
      const expectedUrls = [`${fhirBaseUrl}/Patient/${patientUuid}`];
      const absoluteExpectedUrls = expectedUrls.map((url) => window.origin + makeUrl(url));
      const cache = await caches.open('omrs-spa-cache-v1');
      const keys = (await cache.keys()).map((key) => key.url);
      return absoluteExpectedUrls.every((url) => keys.includes(url));
    },
    async sync(patientUuid) {
      await messageOmrsServiceWorker({
        type: 'registerDynamicRoute',
        pattern: `${fhirBaseUrl}/Patient/${patientUuid}`,
      });

      await fetchCurrentPatient(patientUuid);
    },
  });
}
