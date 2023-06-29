import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { getPatientListName } from './api/api-remote';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta } from './dashboard.meta';
import { setupOffline } from './offline';

const moduleName = '@openmrs/esm-patient-list-app';

const options = {
  featureName: 'patient list',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
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
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const addPatientToListModal = getAsyncLifecycle(() => import('./add-patient/add-patient.component'), {
  featureName: 'patient-actions-modal',
  moduleName,
});

export const addPatientToPatientListMenuItem = getAsyncLifecycle(
  () => import('./add-patient-to-patient-list-menu-item.component'),
  {
    featureName: 'patient-actions-slot',
    moduleName,
  },
);

export const patientListActionButton = getAsyncLifecycle(() => import('./patient-list-action-button.component'), {
  featureName: 'patient-list-action-menu-item',
  moduleName,
});

export const patientListDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const patientTable = getAsyncLifecycle(() => import('./patient-table/patient-table.component'), {
  featureName: 'patient-table',
  moduleName,
});
