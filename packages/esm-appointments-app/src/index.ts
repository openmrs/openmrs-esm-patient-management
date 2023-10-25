import {
  defineConfigSchema,
  defineExtensionConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  Type,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta, appointmentCalendarDashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-appointments-app';

const options = {
  featureName: 'appointments',
  moduleName,
};

const expectedAppointmentsPanelConfigSchema = {
  title: {
    _type: Type.Boolean,
    _description: 'The title to display, may be a translation key or plain text',
    _default: 'expected',
  },
  status: {
    _type: Type.String,
    _description:
      'The status to filter on, must be one of the valid appointment statues: Requested, Scheduled, CheckedIn, Completed, Cancelled, Missed',
    _default: 'Scheduled',
  },
  showForPastDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a past date',
    _default: false,
  },
  showForToday: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for today',
    _default: true,
  },
  showForFutureDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a future date',
    _default: true,
  },
};

export function startupApp() {
  const appointmentsBasePath = `${window.spaBase}/home/appointments`;

  defineConfigSchema(moduleName, configSchema);

  defineExtensionConfigSchema('expected-appointments-panel', expectedAppointmentsPanelConfigSchema);

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

export const root = getAsyncLifecycle(() => import('./root.component'), options);

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

export const appointmentsByStatus = getAsyncLifecycle(
  () => import('./appointments/scheduled/appointments-by-status.component'),
  options,
);

export const earlyAppointments = getAsyncLifecycle(
  () => import('./appointments/scheduled/early-appointments.component'),
  options,
);
