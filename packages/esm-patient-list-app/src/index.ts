import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink.component';
import { dashboardMeta } from './dashboard.meta';
import { setupOffline } from './offline';
import rootComponent from './root.component';
import patientListActionButtonComponent from './patient-list-action-button.component';
import listDetailsTableComponent from './list-details-table/list-details-table.component';
import addPatientToPatientListMenuItemComponent from './add-patient-to-patient-list-menu-item.component';

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

export const root = getSyncLifecycle(rootComponent, options);

export const addPatientToListModal = getAsyncLifecycle(() => import('./add-patient/add-patient.component'), {
  featureName: 'patient-actions-modal',
  moduleName,
});

export const addPatientToPatientListMenuItem = getSyncLifecycle(addPatientToPatientListMenuItemComponent, {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const patientListActionButton = getSyncLifecycle(patientListActionButtonComponent, {
  featureName: 'patient-list-action-menu-item',
  moduleName,
});

export const patientListDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const listDetailsTable = getSyncLifecycle(listDetailsTableComponent, {
  featureName: 'patient-table',
  moduleName,
});
