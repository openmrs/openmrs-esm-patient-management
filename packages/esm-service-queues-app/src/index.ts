import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink.component';
import { dashboardMeta } from './dashboard.meta';
import rootComponent from './root.component';
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

export const addQueueEntry = getSyncLifecycle(addQueueEntryComponent, options);

export const queueTableName = getAsyncLifecycle(
  () => import('./queue-table/queue-table-cells.component').then(({ QueueTableName }) => ({ default: QueueTableName })),
  {
    featureName: 'queue table name column',
    moduleName,
  },
);

export const queueTablePriority = getAsyncLifecycle(
  () =>
    import('./queue-table/queue-table-cells.component').then(({ QueueTablePriority }) => ({
      default: QueueTablePriority,
    })),
  {
    featureName: 'queue table name column',
    moduleName,
  },
);

export const queueTableStatus = getAsyncLifecycle(
  () =>
    import('./queue-table/queue-table-cells.component').then(({ QueueTableStatus }) => ({ default: QueueTableStatus })),
  {
    featureName: 'queue table name column',
    moduleName,
  },
);

export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
}
