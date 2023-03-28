import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

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
  const moduleName = '@openmrs/esm-active-visits-app';

  const options = {
    featureName: 'active-visits',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'active-visits-widget',
        slot: 'homepage-widgets-slot',
        order: 0,
        load: getAsyncLifecycle(() => import('./active-visits-widget/active-visits.component'), options),
      },
      {
        id: 'visit-summary-widget',
        slot: 'visit-summary-slot',
        load: getAsyncLifecycle(() => import('./visits-summary/visit-detail.component'), options),
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS, version };
