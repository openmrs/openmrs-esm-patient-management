import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { clinicalAppointmentsDashboardMeta } from './dashboard.meta';

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
        name: 'appointments-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./appointment-link'), options),
        online: true,
        offline: false,
      },
      {
        name: 'appointments-side-nav',
        slot: 'appointments-sidebar-slot',
        load: getAsyncLifecycle(() => import('./side-menu/side-menu.component'), options),
        online: true,
        offline: true,
      },
      {
        name: 'clinical-appointments-db-link',
        slot: 'appointments-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(clinicalAppointmentsDashboardMeta), options),
        meta: clinicalAppointmentsDashboardMeta,
        online: true,
        offline: true,
      },
      {
        name: 'clinical-appointments-dashboard',
        slot: 'clinical-appointments-dashboard-slot',
        load: getAsyncLifecycle(() => import('./clinical-appointments.component'), options),
        online: true,
        offline: true,
      },
      {
        name: 'patient-list-action-menu',
        slot: 'action-menu-items-slot',
        load: getAsyncLifecycle(() => import('./patient-list-action-button.component'), {
          featureName: 'patient-list-action-menu-item',
          moduleName,
        }),
      },
      {
        name: 'patient-table',
        load: getAsyncLifecycle(() => import('./patient-table/patient-table.component'), {
          featureName: 'patient-table',
          moduleName,
        }),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
