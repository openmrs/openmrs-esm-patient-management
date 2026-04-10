export const dashboardMeta = {
  path: 'appointments',
  slot: 'clinical-appointments-dashboard-slot',
  title: 'Appointments',
  basePath: `${window.spaBase}/home`,
} as const;

export const appointmentCalendarDashboardMeta = {
  path: 'calendar',
  slot: 'clinical-appointments-dashboard-slot',
  title: 'Appointments calendar',
  basePath: `${window.spaBase}/home`,
} as const;

export const patientChartDashboardMeta = {
  slot: 'patient-chart-appointments-dashboard-slot',
  columns: 1,
  title: 'Appointments',
  path: 'Appointments',
  icon: 'omrs-icon-event-schedule',
} as const;
