import { AppointmentKind, AppointmentStatus } from './types';

export const basePath = '/appointments';
export const spaHomePage = `${window.spaBase}/home`;
export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
export const appointmentLocationTagName = 'Appointment Location';

export const moduleName = '@openmrs/esm-appointments-app';
export const appointmentsFormWorkspace = 'appointments-form-workspace';

export const dateFormat = 'DD/MM/YYYY';
export const weekDays = [
  {
    id: 'MONDAY',
    label: 'Monday',
    labelCode: 'monday',
    order: 0,
  },
  {
    id: 'TUESDAY',
    label: 'Tuesday',
    labelCode: 'tuesday',
    order: 1,
  },
  {
    id: 'WEDNESDAY',
    label: 'Wednesday',
    labelCode: 'wednesday',
    order: 2,
  },
  {
    id: 'THURSDAY',
    label: 'Thursday',
    labelCode: 'thursday',
    order: 3,
  },
  {
    id: 'FRIDAY',
    label: 'Friday',
    labelCode: 'friday',
    order: 4,
  },
  {
    id: 'SATURDAY',
    label: 'Saturday',
    labelCode: 'saturday',
    order: 5,
  },
  {
    id: 'SUNDAY',
    label: 'Sunday',
    labelCode: 'sunday',
    order: 6,
  },
];

// Appointment table column types and their translations
// These are used both in configuration and in the component for dynamic translation
export const appointmentColumnTypes = Object.freeze([
  // t('patientName', 'Patient name')
  'patientName',
  // t('identifier', 'Identifier')
  'identifier',
  // t('location', 'Location')
  'location',
  // t('serviceType', 'Service type')
  'serviceType',
  // t('status', 'Status')
  'status',
  // t('dateTime', 'Appointment time')
  'dateTime',
  // t('provider', 'Provider')
  'provider',
  // t('actions', 'Actions')
  'actions',
  // t('visitStartTime', 'Visit start time')
  'visitStartTime',
]);

// Appointment statuses and their translations
// This is an enum on the backend, so these values are not swappable
export const appointmentStatuses = Object.freeze([
  // t('Requested', 'Requested')
  AppointmentStatus.REQUESTED,
  // t('Scheduled', 'Scheduled')
  AppointmentStatus.SCHEDULED,
  // t('CheckedIn', 'Checked in')
  AppointmentStatus.CHECKEDIN,
  // t('Completed', 'Completed')
  AppointmentStatus.COMPLETED,
  // t('Cancelled', 'Cancelled')
  AppointmentStatus.CANCELLED,
  // t('Missed', 'Missed')
  AppointmentStatus.MISSED,
]);

// Appointment types and their translations
// This is an enum on the backend, so these values are not swappable
export const appointmentTypes = Object.freeze([
  // t('Scheduled', 'Scheduled')
  AppointmentKind.SCHEDULED,
  // t('WalkIn', 'Walk In')
  AppointmentKind.WALKIN,
  // t('Virtual', 'Virtual')
  AppointmentKind.VIRTUAL,
]);
