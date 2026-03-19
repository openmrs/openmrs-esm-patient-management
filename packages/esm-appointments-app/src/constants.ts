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
export const appointmentColumnTypes = [
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
  // t('dateTime', 'Date & time')
  'dateTime',
  // t('provider', 'Provider')
  'provider',
] as const;
