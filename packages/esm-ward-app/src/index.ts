import {
  defineConfigSchema,
  defineExtensionConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import rootComponent from './root.component';
import { moduleName } from './constant';
import { createDashboardLink } from './createDashboardLink.component';
import { coloredObsTagsCardRowConfigSchema } from './config-schema-extension-colored-obs-tags';
import WardPatientActionButton from './ward-patient-workspace/ward-patient-action-button.extension';
import ColoredObsTagsCardRowExtension from './ward-patient-card/colored-obs-tags-card-row/colored-obs-tags-card-row.extension';

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

// t("inpatientNotesWorkspaceTitle", "In-patient notes")
export const wardPatientNotesWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/ward-patient-notes/notes.workspace'),
  options,
);

export const wardPatientActionButtonExtension = getAsyncLifecycle(
  () => import('./ward-patient-workspace/ward-patient-action-button.extension'),
  options,
);

export const wardPatientNotesActionButtonExtension = getAsyncLifecycle(
  () => import('./ward-workspace/ward-patient-notes/notes-action-button.extension'),
  options,
);

export const coloredObsTagCardRowExtension = getSyncLifecycle(ColoredObsTagsCardRowExtension, options);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
  defineExtensionConfigSchema('colored-obs-tags-card-row', coloredObsTagsCardRowConfigSchema);
  registerFeatureFlag(
    'bedmanagement-module',
    'Bed Management Module',
    'Enables features related to bed management / assignment. Requires the backend bed management module to be installed.',
  );
}
