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
    extensions: [
      {
        name: 'home-appointments',
        slot: 'homepage-widgets-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./home-appointments'), options),
      },
      {
        name: 'clinical-appointments-db-link',
        slot: 'homepage-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(clinicalAppointmentsDashboardMeta), options),
        meta: clinicalAppointmentsDashboardMeta,
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
        load: getAsyncLifecycle(() => import('./home-appointments/checkin-modal'), options),
        online: true,
        offline: false,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
