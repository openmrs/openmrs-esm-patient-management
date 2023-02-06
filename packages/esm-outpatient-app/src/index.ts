import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { homeDashboardMeta } from './dashboard.meta';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-outpatient-app';

  const options = {
    featureName: 'outpatient',
    moduleName,
  };

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/appointments-list/:value?`,
      title: ([x]) => `Patient Lists / ${x}`,
      parent: `${window.spaBase}`,
    },
    {
      path: `${window.spaBase}/queue-list/:value?`,
      title: ([x]) => `Patient Lists / ${x}`,
      parent: `${window.spaBase}`,
    },
    {
      path: `${window.spaBase}/outpatient/home`,
      title: 'Service Queues',
      parent: `${window.spaBase}/home`,
    },
  ]);

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [
      {
        route: 'outpatient',
        load: getAsyncLifecycle(() => import('./root.component'), options),
        online: true,
        offline: true,
      },
      {
        load: getAsyncLifecycle(
          () => import('./queue-patient-linelists/scheduled-appointments-table.component'),
          options,
        ),
        route: /^appointments-list/,
        online: true,
        offline: true,
      },
      {
        load: getAsyncLifecycle(() => import('./queue-patient-linelists/queue-services-table.component'), options),
        route: /^queue-list/,
        online: true,
        offline: true,
      },
    ],
    extensions: [
      {
        id: 'outpatient-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./outpatient-link'), options),
        online: true,
        offline: false,
      },
      {
        id: 'outpatient-side-nav-ext',
        slot: 'outpatient-sidebar-slot',
        load: getAsyncLifecycle(() => import('./side-menu/side-menu.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'home-db-link',
        slot: 'outpatient-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(homeDashboardMeta), options),
        meta: homeDashboardMeta,
        online: true,
        offline: true,
      },
      {
        id: 'home-dashboard',
        slot: 'home-dashboard-slot',
        load: getAsyncLifecycle(() => import('./home.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'edit-queue-entry-status-modal',
        load: getAsyncLifecycle(() => import('./active-visits/change-status-dialog.component'), {
          featureName: 'edit queue status',
          moduleName,
        }),
      },
      {
        id: 'patient-info-banner-slot',
        load: getAsyncLifecycle(() => import('./patient-info/patient-info.component'), {
          featureName: 'patient info slot',
          moduleName,
        }),
      },
      {
        id: 'add-patient-to-queue',
        slot: 'add-patient-to-queue-slot',
        load: getAsyncLifecycle(() => import('./patient-search/visit-form/visit-form.component'), {
          featureName: 'patient info slot',
          moduleName,
        }),
      },
      {
        id: 'remove-queue-entry',
        load: getAsyncLifecycle(() => import('./remove-queue-entry-dialog/remove-queue-entry.component'), {
          featureName: 'remove queue entry and end visit',
          moduleName,
        }),
      },
      {
        id: 'clear-all-queue-entries',
        load: getAsyncLifecycle(() => import('./clear-queue-entries-dialog/clear-queue-entries-dialog.component'), {
          featureName: 'clear all queue entries and end visits',
          moduleName,
        }),
      },
      {
        id: 'add-visit-to-queue-modal',
        load: getAsyncLifecycle(() => import('./add-patient-toqueue/add-patient-toqueue-dialog.component'), {
          featureName: 'add visit to queue',
          moduleName,
        }),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
