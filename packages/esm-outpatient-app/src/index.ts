import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { homeDashboardMeta } from './dashboard.meta';

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
        route: /^patient\/.+\/chart/,
        load: getAsyncLifecycle(() => import('./visit-header/visit-header.component'), {
          featureName: 'Visit Header',
          moduleName,
        }),
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
          featureName: 'end visit',
          moduleName,
        }),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
