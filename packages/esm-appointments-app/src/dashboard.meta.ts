import { Calendar } from '@carbon/react/icons';

export const dashboardMeta = {
  name: 'appointments',
  slot: 'clinical-appointments-dashboard-slot',
  title: 'Appointments',
};

export const appointmentCalendarDashboardMeta = {
  name: 'calendar',
  slot: 'clinical-appointments-dashboard-slot',
  title: 'Appointments Calendar',
  renderIcon: Calendar,
};

export const patientChartDashboardMeta = {
  slot: 'patient-chart-appointments-dashboard-slot',
  columns: 1,
  title: 'Appointments',
  path: 'Appointments',
};
