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

export const queueTableByStatusMenu = getAsyncLifecycle(
  () => import('./queue-table/queue-table-by-status-menu.component'),
  options,
);
export const queueTableByStatusView = getAsyncLifecycle(
  () => import('./views/queue-table-by-status-view.component'),
  options,
);

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

export const editQueueEntryStatusModal = getAsyncLifecycle(() => import('./active-visits/change-status.modal'), {
  featureName: 'edit queue status',
  moduleName,
});

export const removeQueueEntry = getAsyncLifecycle(
  () => import('./clear-queue-entries-modal/clear-queue-entries.component'),
  {
    featureName: 'remove queue entry and end visit',
    moduleName,
  },
);

export const clearAllQueueEntries = getAsyncLifecycle(
  () => import('./clear-queue-entries-modal/clear-queue-entries.modal'),
  {
    featureName: 'clear all queue entries and end visits',
    moduleName,
  },
);

export const transitionQueueEntryStatusModal = getAsyncLifecycle(
  () => import('./transition-queue-entry/transition-queue-entry.modal'),
  {
    featureName: 'transition queue status',
    moduleName,
  },
);

export const pastVisitSummary = getAsyncLifecycle(() => import('./past-visit/past-visit.component'), options);

export const addProviderToRoomModal = getAsyncLifecycle(
  () => import('./add-provider-queue-room-modal/add-provider-queue-room.modal'),
  {
    featureName: 'add provider queue room',
    moduleName,
  },
);

export const transitionQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/transition-queue-entry.modal'),
  {
    featureName: 'transfer patient to a different queue',
    moduleName,
  },
);

export const editQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/edit-queue-entry.modal'),
  {
    featureName: 'edit queue entry of a patient',
    moduleName,
  },
);

export const undoTransitionQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/undo-transition-queue-entry.modal'),
  {
    featureName: 'undo queue entry transiion of a patient',
    moduleName,
  },
);

export const voidQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/void-queue-entry.modal'),
  {
    featureName: 'void queue entry of a patient',
    moduleName,
  },
);

export const endQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/end-queue-entry.modal'),
  {
    featureName: 'end queue entry of a patient',
    moduleName,
  },
);

// t('addNewQueueService', 'Add New Queue Service')
export const addNewQueueServiceWorkspace = getAsyncLifecycle(
  () => import('./queue-services/queue-service-form.workspace'),
  {
    featureName: 'service-queues-service-form',
    moduleName,
  },
);
export const transitionPatientToLatestQueue = getAsyncLifecycle(
  () => import('./transition-latest-queue-entry/transition-latest-queue-entry.component'),
  {
    featureName: 'transition patient to new queue',
    moduleName,
  },
);

export const transitionOverflowMenuItem = getAsyncLifecycle(
  () => import('./transition-latest-queue-entry/transition-overflow-menu-item/transition-overflow-menu-item.component'),
  {
    featureName: 'overflow menu with action to transition patient to a new queue',
    moduleName,
  },
);

// t('addNewQueueServiceRoom', 'Add new queue service room')
export const addNewQueueServiceRoomWorkspace = getAsyncLifecycle(
  () => import('./queue-rooms/queue-room-form.workspace'),
  {
    featureName: 'service-queues-queue-room-form',
    moduleName,
  },
);

export const visitFormQueueFields = getAsyncLifecycle(
  () => import('./create-queue-entry/queue-fields/visit-form-queue-fields.extension'),
  options,
);

export const createQueueEntryWorkspace = getAsyncLifecycle(
  () => import('./create-queue-entry/create-queue-entry.workspace'),
  {
    featureName: 'create-queue-entry-workspace',
    moduleName,
  },
);

export const activeVisitsRowActions = getAsyncLifecycle(
  () => import('./active-visits/active-visits-row-actions.component'),
  {
    featureName:
      'quick actions to queue, requeue and transfer patients. With overflow menu actions to edit patient and end visit',
    moduleName,
  },
);

export const patientBannerQueueEntryStatus = getAsyncLifecycle(
  () => import('./patient-info/patient-banner-queue-entry-status.extension'),
  {
    featureName: 'patient-info-queue-entry-status',
    moduleName,
  },
);

export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
}
