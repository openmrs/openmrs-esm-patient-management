import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta, appointmentCalendarDashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-appointments-app';

const options = {
  featureName: 'appointments',
  moduleName,
};

export function startupApp() {
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
}

export const appointmentsDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const appointmentsCalendarDashboardLink = getSyncLifecycle(
  createDashboardLink(appointmentCalendarDashboardMeta),
  options,
);

export const appointmentsDashboard = getAsyncLifecycle(() => import('./appointments.component'), options);

export const checkInModal = getAsyncLifecycle(
  () => import('./home-appointments/check-in-modal/check-in-modal.component'),
  options,
);

export const homeAppointments = getAsyncLifecycle(() => import('./home-appointments'), options);
