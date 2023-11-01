import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink.component';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-service-queues-app';

const options = {
  featureName: 'outpatient',
  moduleName,
};

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const appointmentsList = getAsyncLifecycle(
  () => import('./queue-patient-linelists/scheduled-appointments-table.component'),
  options,
);

export const queueList = getAsyncLifecycle(
  () => import('./queue-patient-linelists/queue-services-table.component'),
  options,
);

export const outpatientSideNav = getAsyncLifecycle(() => import('./side-menu/side-menu.component'), options);

export const serviceQueuesDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const homeDashboard = getAsyncLifecycle(() => import('./home.component'), options);

export const editQueueEntryStatusModal = getAsyncLifecycle(
  () => import('./active-visits/change-status-dialog.component'),
  {
    featureName: 'edit queue status',
    moduleName,
  },
);

export const patientInfoBannerSlot = getAsyncLifecycle(() => import('./patient-info/patient-info.component'), {
  featureName: 'patient info slot',
  moduleName,
});

export const addPatientToQueue = getAsyncLifecycle(() => import('./patient-search/visit-form/visit-form.component'), {
  featureName: 'patient info slot',
  moduleName,
});

export const removeQueueEntry = getAsyncLifecycle(
  () => import('./remove-queue-entry-dialog/remove-queue-entry.component'),
  {
    featureName: 'remove queue entry and end visit',
    moduleName,
  },
);

export const clearAllQueueEntries = getAsyncLifecycle(
  () => import('./clear-queue-entries-dialog/clear-queue-entries-dialog.component'),
  {
    featureName: 'clear all queue entries and end visits',
    moduleName,
  },
);

export const addVisitToQueueModal = getAsyncLifecycle(
  () => import('./add-patient-toqueue/add-patient-toqueue-dialog.component'),
  {
    featureName: 'add visit to queue',
    moduleName,
  },
);

export const transitionQueueEntryStatusModal = getAsyncLifecycle(
  () => import('./transition-queue-entry/transition-queue-entry-dialog.component'),
  {
    featureName: 'transition queue status',
    moduleName,
  },
);

export const previousVisitSummaryWidget = getAsyncLifecycle(() => import('./past-visit/past-visit.component'), options);

export const addProviderToRoomModal = getAsyncLifecycle(
  () => import('./add-provider-queue-room/add-provider-queue-room.component'),
  {
    featureName: 'add provider queue room',
    moduleName,
  },
);

export const addQueueEntryWidget = getAsyncLifecycle(
  () => import('./patient-search/visit-form-queue-fields/visit-form-queue-fields.component'),
  options,
);

export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
}
