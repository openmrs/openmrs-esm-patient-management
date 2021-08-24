import { getAsyncLifecycle, registerBreadcrumbs, getOfflinePatientDataStore } from '@openmrs/esm-framework';
import './global-store';
import { setupOffline } from './offline';

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-list-app';
const options = {
  featureName: 'patient list',
  moduleName,
};

function setupOpenMRS() {
  const route = `patient-list`;
  const spaBasePath = `${window.spaBase}/${route}`;
  setupOffline();

  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Patient Lists',
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
        load: getAsyncLifecycle(() => import('./patient-list-list/patient-list-list.component'), options),
        route,
        online: { syncUserPropertiesChangesOnLoad: true },
        offline: { syncUserPropertiesChangesOnLoad: false },
      },
    ],
    extensions: [
      {
        id: 'patient-list-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./patient-list-link.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'add-patient-to-patient-list-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./add-patient-to-patient-list-menu-item.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        id: 'add-patient-to-patient-list-modal',
        load: getAsyncLifecycle(() => import('./add-patient/add-patient.component'), {
          featureName: 'patient-actions-modal',
          moduleName,
        }),
      },
      {
        id: 'patient-table',
        load: getAsyncLifecycle(() => import('./patient-table/patient-table.component'), {
          featureName: 'patient-table',
          moduleName,
        }),
        online: true,
        offline: true,
      },
      {
        id: 'overview-offline-patient-table',
        slot: 'offline-tools-home-overview-slot',
        load: getAsyncLifecycle(() => import('./offline-patient-table/overview-offline-patient-table.component'), {
          featureName: 'overview-offline-patient-table',
          moduleName,
        }),
        online: true,
        offline: true,
      },
      {
        id: 'offline-patient-table',
        slot: 'offline-tools-offline-patients-slot',
        load: getAsyncLifecycle(() => import('./offline-patient-table/interactive-offline-patient-table.component'), {
          featureName: 'offline-patient-table',
          moduleName,
        }),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
