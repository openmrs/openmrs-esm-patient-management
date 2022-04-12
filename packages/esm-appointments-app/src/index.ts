import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { homeDashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-appointments-app';

  const options = {
    featureName: 'appointments',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [
      {
        route: 'appointments',
        load: getAsyncLifecycle(() => import('./root.component'), options),
        online: true,
        offline: true,
      },
    ],
    extensions: [
      {
        id: 'appointments-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./appointment-link'), options),
        online: true,
        offline: false,
      },
      {
        id: 'appointments-side-nav-ext',
        slot: 'appointments-sidebar-slot',
        load: getAsyncLifecycle(() => import('./side-menu/side-menu.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'home-db-link',
        slot: 'appointments-dashboard-slot',
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
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
