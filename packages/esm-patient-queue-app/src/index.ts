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
  const moduleName = '@openmrs/esm-patient-queue-app';

  const options = {
    featureName: 'patient-queue',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'patient-queue-header',
        slot: 'homepage-widgets-slot',
        load: getAsyncLifecycle(() => import('./patient-queue-header/patient-queue-header.component'), options),
        offline: true,
        online: true,
        order: 0,
      },
      {
        id: 'patient-queue-metrics-header',
        slot: 'homepage-widgets-slot',
        load: getAsyncLifecycle(() => import('./patient-queue-metrics/metrics-header.component'), options),
        offline: true,
        online: true,
        order: 1,
      },
      {
        id: 'metrics-card',
        slot: 'homepage-widgets-slot',
        load: getAsyncLifecycle(() => import('./patient-queue-metrics/clinic-metrics.component'), options),
        offline: true,
        online: true,
        order: 2,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
