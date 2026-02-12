import {
  createDashboard,
  defineConfigSchema,
  defineExtensionConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';
import { dashboardMeta, appointmentCalendarDashboardMeta, patientChartDashboardMeta } from './dashboard.meta';
import {
  cancelledAppointmentsPanelConfigSchema,
  checkedInAppointmentsPanelConfigSchema,
  completedAppointmentsPanelConfigSchema,
  earlyAppointmentsPanelConfigSchema,
  expectedAppointmentsPanelConfigSchema,
  missedAppointmentsPanelConfigSchema,
} from './scheduled-appointments-config-schema';

const moduleName = '@openmrs/esm-appointments-app';

const options = {
  featureName: 'appointments',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

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
      title: ([_, serviceName]) => `Patient Lists / ${decodeURI(serviceName)}`,
      parent: `${window.spaBase}`,
    },
  ]);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

// t('appointments', 'Appointments')
export const appointmentsDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);

// t('appointmentsCalendar', 'Appointments calendar')
export const appointmentsCalendarDashboardLink = getSyncLifecycle(
  createDashboardLink(appointmentCalendarDashboardMeta),
  options,
);

export const appointmentsDashboard = getAsyncLifecycle(() => import('./appointments.component'), options);

export const homeAppointments = getAsyncLifecycle(() => import('./home/home-appointments.component'), options);

export const appointmentsList = getAsyncLifecycle(
  () => import('./appointments/scheduled/appointments-list.component'),
  options,
);

export const earlyAppointments = getAsyncLifecycle(
  () => import('./appointments/scheduled/early-appointments.component'),
  options,
);

export const metricsCardScheduledAppointments = getAsyncLifecycle(
  () => import('./metrics/metrics-cards/scheduled-appointments.extension'),
  options,
);

export const metricsCardHighestVolumeService = getAsyncLifecycle(
  () => import('./metrics/metrics-cards/highest-volume-service.extension'),
  options,
);

export const metricsCardProvidersBooked = getAsyncLifecycle(
  () => import('./metrics/metrics-cards/providers-booked.extension'),
  options,
);

// t('Appointments', 'Appointments')
export const patientAppointmentsSummaryDashboardLink = getAsyncLifecycle(
  async () => ({ default: createDashboard({ ...patientChartDashboardMeta }) }),
  options,
);

export const patientAppointmentsDetailedSummary = getAsyncLifecycle(
  () => import('./patient-appointments/patient-appointments-detailed-summary.extension'),
  options,
);

export const patientAppointmentsOverview = getAsyncLifecycle(
  () => import('./patient-appointments/patient-appointments-overview.component'),
  options,
);

export const patientUpcomingAppointmentsWidget = getAsyncLifecycle(
  () => import('./patient-appointments/patient-upcoming-appointments-card.component'),
  options,
);

export const cancelAppointmentModal = getAsyncLifecycle(
  () => import('./patient-appointments/patient-appointments-cancel.modal'),
  options,
);

export const appointmentsFormWorkspace = getAsyncLifecycle(() => import('./form/appointments-form.workspace'), options);

export const exportedAppointmentsFormWorkspace = getAsyncLifecycle(
  () => import('./form/exported-appointments-form.workspace'),
  options,
);

export const endAppointmentModal = getAsyncLifecycle(
  () => import('./appointments/common-components/end-appointment.modal'),
  options,
);

export const homeAppointmentsTile = getAsyncLifecycle(
  () => import('./homepage-tile/appointments-tile.component'),
  options,
);

export const batchChangeAppointmentStatusesModal = getAsyncLifecycle(
  () => import('./appointments/common-components/batch-change-appointment-statuses.modal'),
  options,
);
