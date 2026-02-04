import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constant';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'ward',
  moduleName,
};
const swrRefreshIntervalInMs = 60000;

export const root = getAsyncLifecycle(() => import('./root.component'), options);

// t('wards', 'Wards')
export const wardDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const wardView = getAsyncLifecycle(() => import('./ward-view/ward-view.component'), options);

export const admissionRequestWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/admission-request-workspace/admission-requests.workspace'),
  options,
);

export const admitPatientFormWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/admit-patient-form-workspace/admit-patient-form.workspace'),
  options,
);

export const wardPatientWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/patient-details/ward-patient.workspace'),
  options,
);

export const wardPatientNotesWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/ward-patient-notes/notes.workspace'),
  options,
);

export const wardPatientActionButton = getAsyncLifecycle(
  () => import('./ward-workspace/patient-details/ward-patient-action-button.component'),
  options,
);

export const wardPatientCancelAdmissionRequestWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/cancel-admission-request-workspace/ward-patient-cancel-admission-request.workspace'),
  options,
);

export const wardPatientNotesActionButton = getAsyncLifecycle(
  () => import('./ward-workspace/ward-patient-notes/notes-action-button.component'),
  options,
);

export const patientTransferAndSwapWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/patient-transfer-bed-swap/patient-transfer-swap.workspace'),
  options,
);

export const patientDischargeWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/patient-discharge/patient-discharge.workspace'),
  options,
);

export const patientTransferAndSwapWorkspaceSiderailIcon = getAsyncLifecycle(
  () => import('./action-menu-buttons/transfer-workspace-siderail.component'),
  options,
);

export const patientTransferRequestWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/patient-transfer-request-workspace/patient-transfer-request.workspace'),
  options,
);

export const patientDischargeWorkspaceSideRailIcon = getAsyncLifecycle(
  () => import('./action-menu-buttons/discharge-workspace-siderail.component'),
  options,
);

export const cancelAdmissionRequestWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/cancel-admission-request-workspace/cancel-admission-request.workspace'),
  options,
);

export const clinicalFormWorkspaceSideRailIcon = getAsyncLifecycle(
  () => import('./action-menu-buttons/clinical-forms-workspace-siderail.component'),
  options,
);

export const orderBasketWorkspaceSideRailIcon = getAsyncLifecycle(
  () => import('./action-menu-buttons/order-basket-action-button.component'),
  options,
);

export const createAdmissionEncounterWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/create-admission-encounter/create-admission-encounter.workspace'),
  options,
);

export const defaultWardView = getAsyncLifecycle(() => import('./ward-view/default-ward/default-ward-view.component'), {
  featureName: 'default-ward-view',
  moduleName,
  swrConfig: {
    refreshInterval: swrRefreshIntervalInMs,
  },
});

export const maternalWardView = getAsyncLifecycle(
  () => import('./ward-view/maternal-ward/maternal-ward-view.component'),
  {
    featureName: 'maternal-ward-view',
    moduleName,
    swrConfig: {
      refreshInterval: swrRefreshIntervalInMs,
    },
  },
);

export const wardPatientWorkspaceBanner = getAsyncLifecycle(
  () => import('./ward-workspace/patient-banner/patient-banner.component'),
  options,
);

export const deleteNoteModal = getAsyncLifecycle(
  () => import('./ward-workspace/ward-patient-notes/history/delete-note.modal'),
  options,
);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);

  registerFeatureFlag(
    'bedmanagement-module',
    'Bed management module',
    'Enables features related to bed management / assignment. Requires the backend bed management module to be installed.',
  );
}
