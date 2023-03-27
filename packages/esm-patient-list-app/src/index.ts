import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { getPatientListName } from './api/api-remote';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta } from './dashboard.meta';
import { setupOffline } from './offline';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

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
  const patientListsBasePath = `${window.spaBase}/home/patient-lists`;

  async function getListName(patientListUuid: string): Promise<string> {
    return (await getPatientListName(patientListUuid)) ?? '--';
  }

  setupOffline();
  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      title: 'Patient Lists',
      path: patientListsBasePath,
      parent: `${window.spaBase}/home`,
    },
    {
      title: ([patientListUuid]) => getListName(patientListUuid),
      path: `${patientListsBasePath}/:patientListUuid?`,
      parent: patientListsBasePath,
    },
  ]);

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import('./root.component'), options),
        route: 'patient-lists',
        online: { syncUserPropertiesChangesOnLoad: true },
        offline: { syncUserPropertiesChangesOnLoad: false },
      },
    ],
    extensions: [
      {
        id: 'patient-lists-dashboard-link',
        slot: 'homepage-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        id: 'patient-lists-dashboard',
        slot: 'patient-lists-dashboard-slot',
        load: getAsyncLifecycle(() => import('./root.component'), options),
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
        name: 'patient-list-action-menu',
        slot: 'action-menu-non-chart-items-slot',
        load: getAsyncLifecycle(() => import('./patient-list-action-button.component'), {
          featureName: 'patient-list-action-menu-item',
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
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS, version };
