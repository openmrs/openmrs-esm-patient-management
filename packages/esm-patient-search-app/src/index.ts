import {
  defineConfigSchema,
  fetchCurrentPatient,
  getAsyncLifecycle,
  makeUrl,
  messageOmrsServiceWorker,
  setupDynamicOfflineDataHandler,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import CompactPatientSearch from './compact-patient-search/compact-patient-search.component';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-search-app';

  const options = {
    featureName: 'patient-search',
    moduleName,
  };

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

  return {
    pages: [
      {
        route: /^search/,
        load: getAsyncLifecycle(() => import('./root.component'), options),
      },
    ],
    extensions: [
      {
        id: 'patient-search-icon',
        slot: 'top-nav-actions-slot',
        order: 0,
        load: getAsyncLifecycle(() => import('./patient-search-icon'), options),
      },
      {
        // This extension renders the a Patient-Search Button, which when clicked, opens the search bar in an overlay.
        id: 'patient-search-button',
        slot: 'patient-search-button-slot',
        load: getAsyncLifecycle(() => import('./patient-search-button/patient-search-button.component'), options),
        offline: true,
      },
      {
        // P.S. This extension is not compatible with the tablet view.
        id: 'patient-search-bar',
        slot: 'patient-search-bar-slot',
        load: getAsyncLifecycle(() => import('./compact-patient-search/compact-patient-search.component'), options),
        offline: true,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS, version, CompactPatientSearch };
