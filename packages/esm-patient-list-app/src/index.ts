import { getAsyncLifecycle } from '@openmrs/esm-framework';
// import { configSchema } from './config-schema';
import { registerBreadcrumbs } from '@openmrs/esm-framework';
const backendDependencies = { 'webservices.rest': '^2.2.0' };

// const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-list-app';
const options = {
  featureName: 'patient list',
  moduleName,
};
const spaBasePath = `${window.spaBase}/patient-list`;

function setupOpenMRS() {
  // defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Patient List',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${spaBasePath}/:view?`,
      title: ([x]) => `${x} Dashboard`,
      parent: spaBasePath,
    },
  ]);

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import('./patientListList/index'), options),
        route: (location: Location) => location.pathname.startsWith(window.getOpenmrsSpaBase() + 'patient-list'),
        online: { syncUserPropertiesChangesOnLoad: true },
        offline: { syncUserPropertiesChangesOnLoad: false },
      },
    ],
    extensions: [],
  };
}

export { backendDependencies, /*importTranslation, */ setupOpenMRS };
