import { Type, validators } from '@openmrs/esm-framework';

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

type AppointmentColumnType = (typeof appointmentColumnTypes)[number];

export const configSchema = {
  allowAllDayAppointments: {
    _type: Type.Boolean,
    _description: 'Whether to allow scheduling of all-day appointments (vs appointments with start time and end time)',
    _default: false,
  },
  appointmentStatuses: {
    _type: Type.Array,
    _description: 'Configurable appointment status (status of appointments)',
    _default: ['Requested', 'Scheduled', 'CheckedIn', 'Completed', 'Cancelled', 'Missed'],
  },
  appointmentTypes: {
    _type: Type.Array,
    _description: 'Configurable appointment types (types of appointments)',
    _default: ['Scheduled'],
  },
  checkInButton: {
    enabled: {
      _type: Type.Boolean,
      _description: 'Whether the check-in button on the "Appointments" list should be enabled',
      _default: true,
    },
    showIfActiveVisit: {
      _type: Type.Boolean,
      _description: 'Whether to show the check-in button if the patient currently has an active visit',
      _default: false,
    },
    customUrl: {
      _type: Type.String,
      _description: 'Custom URL to open when clicking the check-in button (instead of thes start visit form)',
      _default: '',
    },
  },
  checkOutButton: {
    enabled: {
      _type: Type.Boolean,
      _description: 'Whether the check-out button on the "Appointments" list should be disabled',
      _default: true,
    },
    customUrl: {
      _type: Type.String,
      _description: 'Custom URL to open when clicking the check-out button',
      _default: '',
    },
  },
  customPatientChartUrl: {
    _type: Type.String,
    _description: `Template URL that will be used when clicking on the patient name in the queues table.
      Available argument: patientUuid, openmrsSpaBase, openBase
      (openmrsSpaBase and openBase are available to any <ConfigurableLink>)`,
    _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
    _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
  },
  includePhoneNumberInExcelSpreadsheet: {
    _type: Type.Boolean,
    _description: 'Whether to include phone numbers in the exported Excel spreadsheet',
    _default: false,
  },
  patientIdentifierType: {
    _type: Type.String,
    _description: 'The name of the patient identifier type to be used for the patient identifier field',
    _default: '',
  },
  showUnscheduledAppointmentsTab: {
    _type: Type.Boolean,
    _description:
      'Whether to show the Unscheduled Appointments tab. Note that configuring this to true requires a custom unscheduledAppointment endpoint not currently available',
    _default: false,
  },
  appointmentsTableColumns: {
    _type: Type.Array,
    _description:
      'Columns to display in the appointment table. Available options: ' + appointmentColumnTypes.join(', '),
    _default: ['patientName', 'identifier', 'location', 'serviceType', 'status'],
    _elements: {
      _type: Type.String,
      _validators: [validators.oneOf(appointmentColumnTypes)],
    },
  },
};

export interface ConfigObject {
  allowAllDayAppointments: boolean;
  appointmentStatuses: Array<string>;
  appointmentTypes: Array<string>;
  appointmentsTableColumns: Array<string>;
  checkInButton: {
    enabled: boolean;
    showIfActiveVisit: boolean;
    customUrl: string;
  };
  checkOutButton: {
    enabled: boolean;
    customUrl: string;
  };
  customPatientChartUrl: string;
  includePhoneNumberInExcelSpreadsheet: boolean;
  patientIdentifierType: string;
  showUnscheduledAppointmentsTab: boolean;
}

export type AppointmentTableColumn = {
  header: string;
  key: string;
};
