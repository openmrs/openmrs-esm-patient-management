import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta, appointmentCalendarDashboardMeta } from './dashboard.meta';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const moduleName = '@openmrs/esm-appointments-app';

const options = {
  featureName: 'appointments',
  moduleName,
};

function setupOpenMRS() {
  const appointmentsBasePath = `${window.spaBase}/home/appointments`;

  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      title: 'Appointments',
      path: appointmentsBasePath,
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${window.spaBase}/patient-list/:forDate/:serviceName`,
      title: ([date, serviceName]) => `Patient Lists / ${decodeURI(serviceName)}`,
      parent: `${window.spaBase}`,
    },
  ]);

  return {
    extensions: [
      {
        name: 'home-appointments',
        slot: 'homepage-widgets-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./home-appointments'), options),
      },
      {
        name: 'clinical-appointments-dashboard-link',
        slot: 'homepage-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        name: 'appointments-calendar-dashboard-link',
        slot: 'calendar-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(appointmentCalendarDashboardMeta), options),
        online: true,
        offline: true,
      },
      {
        name: 'clinical-appointments-dashboard',
        slot: 'clinical-appointments-dashboard-slot',
        load: getAsyncLifecycle(() => import('./appointments.component'), options),
        online: true,
        offline: true,
      },
      {
        name: 'todays-appointments-dashboard',
        slot: 'todays-appointment-slot',
        load: getAsyncLifecycle(() => import('./home-appointments/'), options),
        online: true,
        offline: true,
      },
      {
        name: 'check-in-appointment-modal',
        load: getAsyncLifecycle(() => import('./home-appointments/check-in-modal/check-in-modal.component'), options),
        online: true,
        offline: false,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
