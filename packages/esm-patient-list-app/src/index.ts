import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
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
  setupOffline();
  defineConfigSchema(moduleName, configSchema);
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
