import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
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

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/queue-list`,
      title: `Patients List`,
      parent: `${window.spaBase}`,
    },
    {
      path: `${window.spaBase}/queue-list/:value?`,
      title: ([x]) => `Patient Lists / ${x}`,
      parent: `${window.spaBase}`,
    },
    {
      path: `${window.spaBase}/appointments-list/:value?`,
      title: ([x]) => `Patient Lists / ${x}`,
      parent: `${window.spaBase}`,
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
        route: /^patient\/.+\/chart/,
        load: getAsyncLifecycle(() => import('./visit-header/visit-header.component'), {
          featureName: 'Visit Header',
          moduleName,
        }),
        online: true,
        offline: true,
      },
      {
        load: getAsyncLifecycle(() => import('./queue-patient-table/services-table.component'), options),
        route: /^queue-list/,
        online: true,
        offline: true,
      },
      {
        load: getAsyncLifecycle(() => import('./queue-patient-table/appointments-table.component'), options),
        route: /^appointments-list/,
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
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
