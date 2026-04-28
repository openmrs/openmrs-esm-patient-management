import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta } from './dashboard.meta';
import { setupOffline } from './offline';

const moduleName = '@openmrs/esm-patient-list-management-app';

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

export const addPatientToListModal = getAsyncLifecycle(() => import('./add-patient/add-patient.modal'), {
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

// t('patientLists', 'Patient lists')
export const patientListDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const listDetailsTable = getAsyncLifecycle(() => import('./list-details-table/list-details-table.component'), {
  featureName: 'patient-table',
  moduleName,
});

export const removePatientFromListModal = getAsyncLifecycle(
  () => import('./modals/remove-patient-from-list/remove-patient-from-list.modal'),
  {
    featureName: 'patient-actions-modal',
    moduleName,
  },
);

export const deletePatientListModal = getAsyncLifecycle(
  () => import('./modals/delete-patient-list/delete-patient-list.modal'),
  {
    featureName: 'patient-actions-modal',
    moduleName,
  },
);

export const patientListFormWorkspace = getAsyncLifecycle(
  () => import('./patient-list-form/patient-list-form.workspace'),
  options,
);
