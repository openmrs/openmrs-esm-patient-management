import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

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
      },
      {
        // P.S. This extension is not compatible with the tablet view.
        id: 'patient-search-bar',
        slot: 'patient-search-bar-slot',
        load: getAsyncLifecycle(() => import('./patient-search-bar/patient-search-bar.component'), options),
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
