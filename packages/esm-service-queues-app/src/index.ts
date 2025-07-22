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

export const queueList = getAsyncLifecycle(
  () => import('./queue-patient-linelists/queue-services-table.component'),
  options,
);

export const outpatientSideNav = getAsyncLifecycle(() => import('./side-menu/side-menu.component'), options);

export const serviceQueuesDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const clearAllQueueEntriesModal = getAsyncLifecycle(
  () => import('./modals/clear-queue-entries-modal/clear-queue-entries.modal'),
  {
    featureName: 'clear all queue entries and end visits',
    moduleName,
  },
);

export const pastVisitSummary = getAsyncLifecycle(() => import('./past-visit/past-visit.component'), options);

export const metricsCardCheckedInPatients = getAsyncLifecycle(
  () => import('./metrics/metrics-cards/checked-in-patients.extension'),
  options,
);

export const metricsCardWaitingPatients = getAsyncLifecycle(
  () => import('./metrics/metrics-cards/waiting-patients.extension'),
  options,
);

export const metricsCardAverageWaitTime = getAsyncLifecycle(
  () => import('./metrics/metrics-cards/average-wait-time.extension'),
  options,
);

export const addProviderToRoomModal = getAsyncLifecycle(
  () => import('./admin/add-provider-queue-room-modal/add-provider-queue-room.modal'),
  {
    featureName: 'add provider queue room',
    moduleName,
  },
);

export const callQueueEntryModal = getAsyncLifecycle(() => import('./modals/call-modal/call-queue-entry.modal'), {
  featureName: 'call queue entry',
  moduleName,
});

export const moveQueueEntryModal = getAsyncLifecycle(() => import('./modals/move-queue-entry.modal'), {
  featureName: 'move queue entry',
  moduleName,
});

export const editQueueEntryModal = getAsyncLifecycle(() => import('./modals/edit-queue-entry.modal'), {
  featureName: 'edit queue entry of a patient',
  moduleName,
});

export const metricsCardPatientsSeen = getAsyncLifecycle(
  () => import('./metrics/metrics-cards/patients-seen.extension'),
  options,
);

export const undoTransitionQueueEntryModal = getAsyncLifecycle(
  () => import('./modals/undo-transition-queue-entry.modal'),
  {
    featureName: 'undo queue entry transiion of a patient',
    moduleName,
  },
);

export const voidQueueEntryModal = getAsyncLifecycle(() => import('./modals/void-queue-entry.modal'), {
  featureName: 'void queue entry of a patient',
  moduleName,
});

export const endQueueEntryModal = getAsyncLifecycle(() => import('./modals/end-queue-entry.modal'), {
  featureName: 'end queue entry of a patient',
  moduleName,
});

// This modal is declared with the name 'transition-patient-to-latest-queue-modal'.
// It is not clear why it was named this way.
export const addOrMoveModal = getAsyncLifecycle(() => import('./modals/add-or-move-modal/add-or-move.modal'), {
  featureName: 'transition patient to new queue',
  moduleName,
});

export const transitionOverflowMenuItem = getAsyncLifecycle(
  () => import('./add-or-move-button/add-or-move-overflow-menu-item.extension'),
  {
    featureName: 'overflow menu with action to transition patient to a new queue',
    moduleName,
  },
);

// t('addNewQueueService', 'Add New Queue Service')
export const addNewQueueServiceWorkspace = getAsyncLifecycle(
  () => import('./admin/queue-services/queue-service-form.workspace'),
  {
    featureName: 'service-queues-service-form',
    moduleName,
  },
);

// t('addNewQueueServiceRoom', 'Add new queue service room')
export const addNewQueueServiceRoomWorkspace = getAsyncLifecycle(
  () => import('./admin/queue-rooms/queue-room-form.workspace'),
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

export const patientBannerQueueEntryStatus = getAsyncLifecycle(
  () => import('./patient-banner-extension/patient-banner-queue-entry-status.extension'),
  {
    featureName: 'patient-info-queue-entry-status',
    moduleName,
  },
);

export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
}
