import { getAsyncLifecycle } from '@openmrs/esm-framework';
// import { configSchema } from './config-schema';
import { registerBreadcrumbs } from '@openmrs/esm-framework';
import './offline/offlineData';
import './patientListData/api';
const backendDependencies = { 'webservices.rest': '^2.2.0' };
const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

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
        load: getAsyncLifecycle(() => import('./patientListList'), options),
        route: (location: Location) => location.pathname.startsWith(window.getOpenmrsSpaBase() + 'patient-list'),
        online: { syncUserPropertiesChangesOnLoad: true },
        offline: { syncUserPropertiesChangesOnLoad: false },
      },
    ],
    extensions: [
      {
        id: 'patient-list-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./patient-list-link'), options),
        online: true,
        offline: true,
      },
      {
        id: 'add-patient-to-patient-list',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./patient-list-action'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
