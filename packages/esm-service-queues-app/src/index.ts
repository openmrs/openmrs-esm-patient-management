import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-service-queues-app';
const swrRefreshIntervalInMs = 60000;

const options = {
  featureName: 'serviceQueues',
  moduleName,
};

export const root = getAsyncLifecycle(() => import('./root.component'), {
  featureName: 'service-queues-app-root',
  moduleName,
  swrConfig: {
    refreshInterval: swrRefreshIntervalInMs,
  },
});

export const queueTableByStatusMenu = getAsyncLifecycle(
  () => import('./queue-table/queue-table-by-status-menu.component'),
  options,
);
export const queueTableByStatusView = getAsyncLifecycle(() => import('./views/queue-table-by-status-view.component'), {
  featureName: 'queue-table-by-status-view',
  moduleName,
  swrConfig: {
    refreshInterval: swrRefreshIntervalInMs,
  },
});

export const queueList = getAsyncLifecycle(
  () => import('./queue-patient-linelists/queue-services-table.component'),
  options,
);

export const outpatientSideNav = getAsyncLifecycle(() => import('./side-menu/side-menu.component'), options);

// t('serviceQueues', 'Service queues')
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

export const callQueueEntryModal = getAsyncLifecycle(() => import('./modals/call-modal/call-queue-entry.modal'), {
  featureName: 'call queue entry',
  moduleName,
});

export const moveQueueEntryModal = getAsyncLifecycle(() => import('./modals/move-queue-entry.modal'), {
  featureName: 'move queue entry',
  moduleName,
});

export const transitionQueueEntryModal = getAsyncLifecycle(() => import('./modals/transition-queue-entry.modal'), {
  featureName: 'transition queue entry',
  moduleName,
});

export const editQueueEntryModal = getAsyncLifecycle(() => import('./modals/edit-queue-entry.modal'), {
  featureName: 'edit queue entry of a patient',
  moduleName,
});

export const undoTransitionQueueEntryModal = getAsyncLifecycle(
  () => import('./modals/undo-transition-queue-entry.modal'),
  {
    featureName: 'undo queue entry transiion of a patient',
    moduleName,
  },
);

export const deleteQueueEntryModal = getAsyncLifecycle(() => import('./modals/delete-queue-entry.modal'), {
  featureName: 'delete queue entry of a patient',
  moduleName,
});

export const removeQueueEntryModal = getAsyncLifecycle(() => import('./modals/remove-queue-entry.modal'), {
  featureName: 'remove queue entry of a patient',
  moduleName,
});

// This modal is declared with the name 'transition-patient-to-latest-queue-modal'.
// It is not clear why it was named this way.
export const addOrMoveModal = getAsyncLifecycle(() => import('./modals/add-or-move-modal/add-or-move.modal'), {
  featureName: 'add or move modal',
  moduleName,
});

export const transitionOverflowMenuItem = getAsyncLifecycle(
  () => import('./add-or-move-button/add-or-move-overflow-menu-item.extension'),
  {
    featureName: 'add or move overflow menu item',
    moduleName,
  },
);

export const addNewQueueWorkspace = getAsyncLifecycle(() => import('./admin/queues/queue-form.workspace'), {
  featureName: 'service-queues-queue-form',
  moduleName,
});

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

export const queueScreenLink = getAsyncLifecycle(() => import('./queue-screen/queue-screen-link.extension'), {
  featureName: 'queue-screen-link',
  moduleName,
});

export const adminPageCardLink = getAsyncLifecycle(
  () => import('./admin/admin-page-card-link/admin-page-card-link.extension'),
  {
    featureName: 'admin-page-card-link',
    moduleName,
  },
);

export const serviceQueuesAdminPage = getAsyncLifecycle(() => import('./admin/admin-page/admin-page.component'), {
  featureName: 'service-queues-admin-page',
  moduleName,
});

export const queueScreen = getAsyncLifecycle(() => import('./queue-screen/queue-screen.component'), {
  featureName: 'queue-screen',
  moduleName,
});

export const deleteQueueModal = getAsyncLifecycle(() => import('./admin/modals/delete-queue.modal'), {
  featureName: 'delete-queue-modal',
  moduleName,
});

export const deleteQueueRoomModal = getAsyncLifecycle(() => import('./admin/modals/delete-queue-room.modal'), {
  featureName: 'delete-queue-room-modal',
  moduleName,
});

export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
}
