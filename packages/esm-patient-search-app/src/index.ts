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
    extensions: [
      {
        id: 'patient-search-icon',
        slot: 'top-nav-actions-slot',
        order: 0,
        load: getAsyncLifecycle(() => import('./patient-search-launch/patient-search-launch.component'), options),
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
