import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import rootComponent from './root.component';
import { moduleName } from './constant';
import WardPatientActionButton from './ward-patient-workspace/ward-patient-action-button.extension';
import { createDashboardLink } from './createDashboardLink.component';
import WardPatientNotesActionButton from './ward-workspace/ward-patient-notes/notes-action-button.extension';
import PatientNotesForm from './ward-workspace/ward-patient-notes/form/notes-form.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'ward',
  moduleName,
};

export const root = getSyncLifecycle(rootComponent, options);

export const wardDashboardLink = getSyncLifecycle(createDashboardLink({ name: 'ward', title: 'wards' }), options);

// t('admissionRequests', 'Admission Requests')
export const admissionRequestWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/admission-requests.workspace'),
  options,
);

export const admitPatientFormWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/admit-patient-form-workspace/admit-patient-form.workspace'),
  options,
);

// Title for this workspace is set dynamically
export const wardPatientWorkspace = getAsyncLifecycle(
  () => import('./ward-patient-workspace/ward-patient.workspace'),
  options,
);

export const wardPatientNotesWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/ward-patient-notes/notes.workspace'),
  options,
);

export const wardPatientActionButtonExtension = getSyncLifecycle(WardPatientActionButton, options);

export const wardPatientNotesActionButtonExtension = getSyncLifecycle(WardPatientNotesActionButton, options);
export const wardPatientNotesFormExtension = getSyncLifecycle(PatientNotesForm, options);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
  registerFeatureFlag(
    'bedmanagement-module',
    'Bed Management Module',
    'Enables features related to bed management / assignment. Requires the backend bed management module to be installed.',
  );
}
