import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { backendDependencies } from './openmrs-backend-dependencies';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-search-app';

  const options = {
    featureName: 'patient-search',
    moduleName,
    style: { order: -1 },
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'patient-search-icon',
        slot: 'top-nav-actions-slot',
        load: getAsyncLifecycle(() => import('./patient-search-icon/patient-search-icon.component'), options),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
