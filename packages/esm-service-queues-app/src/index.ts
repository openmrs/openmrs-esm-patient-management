import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink.component';
import { dashboardMeta } from './dashboard.meta';
import rootComponent from './root.component';
import queueTableByStatusMenuComponent from './queue-table/queue-table-by-status-menu.component';
import appointmentListComponent from './queue-patient-linelists/scheduled-appointments-table.component';
import queueListComponent from './queue-patient-linelists/queue-services-table.component';
import outpatientSideNavComponent from './side-menu/side-menu.component';
import homeDashboardComponent from './home.component';
import patientInfoBannerSlotComponent from './patient-info/patient-info.component';
import pastVisitSummaryComponent from './past-visit/past-visit.component';
import addQueueEntryComponent from './patient-search/visit-form-queue-fields/visit-form-queue-fields.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-service-queues-app';

const options = {
  featureName: 'outpatient',
  moduleName,
};

export const root = getSyncLifecycle(rootComponent, options);

export const queueTableByStatusMenu = getSyncLifecycle(queueTableByStatusMenuComponent, options);

export const appointmentsList = getSyncLifecycle(appointmentListComponent, options);

export const queueList = getSyncLifecycle(queueListComponent, options);

export const outpatientSideNav = getSyncLifecycle(outpatientSideNavComponent, options);

export const serviceQueuesDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const homeDashboard = getSyncLifecycle(homeDashboardComponent, options);

export const editQueueEntryStatusModal = getAsyncLifecycle(
  () => import('./active-visits/change-status-dialog.component'),
  {
    featureName: 'edit queue status',
    moduleName,
  },
);

export const patientInfoBannerSlot = getSyncLifecycle(patientInfoBannerSlotComponent, {
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

export const pastVisitSummary = getSyncLifecycle(pastVisitSummaryComponent, options);

export const addProviderToRoomModal = getAsyncLifecycle(
  () => import('./add-provider-queue-room/add-provider-queue-room.component'),
  {
    featureName: 'add provider queue room',
    moduleName,
  },
);

export const transitionQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/transition-queue-entry-modal.component'),
  {
    featureName: 'transfer patient to a different queue',
    moduleName,
  },
);

export const editQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/edit-queue-entry-modal.component'),
  {
    featureName: 'edit queue entry of a patient',
    moduleName,
  },
);

export const undoTransitionQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/undo-transition-queue-entry-modal.component'),
  {
    featureName: 'undo queue entry transiion of a patient',
    moduleName,
  },
);

export const voidQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/void-queue-entry-modal.component'),
  {
    featureName: 'void queue entry of a patient',
    moduleName,
  },
);

export const endQueueEntryModal = getAsyncLifecycle(
  () => import('./queue-table/queue-entry-actions/end-queue-entry-modal.component'),
  {
    featureName: 'end queue entry of a patient',
    moduleName,
  },
);

export const addQueueEntry = getSyncLifecycle(addQueueEntryComponent, options);

export const activeVisitsRowActions = getAsyncLifecycle(
  () => import('./active-visits/active-visits-row-actions.component'),
  {
    featureName:
      'quick actions to queue, requeue and transfer patients. With overflow menu actions to edit patient and end visit',
    moduleName,
  },
);

export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
}
