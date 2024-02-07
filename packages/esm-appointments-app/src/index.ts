import {
  defineConfigSchema,
  defineExtensionConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink.component';
import { dashboardMeta, appointmentCalendarDashboardMeta } from './dashboard.meta';
import {
  cancelledAppointmentsPanelConfigSchema,
  checkedInAppointmentsPanelConfigSchema,
  completedAppointmentsPanelConfigSchema,
  earlyAppointmentsPanelConfigSchema,
  expectedAppointmentsPanelConfigSchema,
  missedAppointmentsPanelConfigSchema,
} from './scheduled-appointments-config-schema';
import rootComponent from './root.component';
import appointmentsDashboardComponent from './appointments.component';
import homeAppointmentsComponent from './home';
import appointmentStatusComponent from './appointments/scheduled/appointments-by-status.component';
import earlyAppointmentsComponent from './appointments/scheduled/early-appointments.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-appointments-app';

const options = {
  featureName: 'appointments',
  moduleName,
};

export function startupApp() {
  const appointmentsBasePath = `${window.spaBase}/home/appointments`;

  defineConfigSchema(moduleName, configSchema);

  defineExtensionConfigSchema('expected-appointments-panel', expectedAppointmentsPanelConfigSchema);
  defineExtensionConfigSchema('checked-in-appointments-panel', checkedInAppointmentsPanelConfigSchema);
  defineExtensionConfigSchema('completed-appointments-panel', completedAppointmentsPanelConfigSchema);
  defineExtensionConfigSchema('missed-appointments-panel', missedAppointmentsPanelConfigSchema);
  defineExtensionConfigSchema('cancelled-appointments-panel', cancelledAppointmentsPanelConfigSchema);
  defineExtensionConfigSchema('early-appointments-panel', earlyAppointmentsPanelConfigSchema);

  registerBreadcrumbs([
    {
      title: 'Appointments',
      path: appointmentsBasePath,
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${window.spaBase}/patient-list/:forDate/:serviceName`,
      title: ([serviceName]) => `Patient Lists / ${decodeURI(serviceName)}`,
      parent: `${window.spaBase}`,
    },
  ]);
}

export const root = getSyncLifecycle(rootComponent, options);

export const appointmentsDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

export const appointmentsCalendarDashboardLink = getSyncLifecycle(
  createDashboardLink(appointmentCalendarDashboardMeta),
  options,
);

export const appointmentsDashboard = getSyncLifecycle(appointmentsDashboardComponent, options);

export const checkInModal = getAsyncLifecycle(() => import('./home/check-in-modal/check-in-modal.component'), options);

export const homeAppointments = getSyncLifecycle(homeAppointmentsComponent, options);

export const appointmentsByStatus = getSyncLifecycle(appointmentStatusComponent, options);

export const earlyAppointments = getSyncLifecycle(earlyAppointmentsComponent, options);
