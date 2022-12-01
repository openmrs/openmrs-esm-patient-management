import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { clinicalAppointmentsDashboardMeta } from './dashboard.meta';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

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

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/appointments`,
      title: 'Appointments',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${window.spaBase}/appointments/calendar`,
      title: 'Calendar',
      parent: `${window.spaBase}/appointments`,
    },
  ]);

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
        id: 'home-appointments',
        slot: 'homepage-widgets-slot',
        load: getAsyncLifecycle(() => import('./home-appointments'), options),
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
        name: 'change-appointment-status-modal',
        load: getAsyncLifecycle(
          () => import('./change-appointment-status/change-appointment-status.component'),
          options,
        ),
        online: true,
        offline: false,
      },
      {
        name: 'check-in-appointment-modal',
        load: getAsyncLifecycle(() => import('./home-appointments/checkin-modal'), options),
        online: true,
        offline: false,
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

export { backendDependencies, importTranslation, setupOpenMRS, version };
