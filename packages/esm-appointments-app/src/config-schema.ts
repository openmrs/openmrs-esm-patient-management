import { Type, validators } from '@openmrs/esm-framework';
import { appointmentColumnTypes } from './constants';

type AppointmentColumnType = (typeof appointmentColumnTypes)[number];

export const configSchema = {
  allowAllDayAppointments: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Whether to allow scheduling of all-day appointments (vs appointments with start time and end time)',
  },
  appointmentStatuses: {
    _type: Type.Array,
    _default: ['Requested', 'Scheduled', 'CheckedIn', 'Completed', 'Cancelled', 'Missed'],
    _description: 'Configurable appointment status (status of appointments)',
    _elements: {
      _type: Type.String,
      _description: 'Status of an appointment',
    },
  },
  appointmentTypes: {
    _type: Type.Array,
    _default: ['Scheduled'],
    _description: 'Configurable appointment types (types of appointments)',
    _elements: {
      _type: Type.String,
      _description: 'Type of an appointment',
    },
  },
  checkInButton: {
    enabled: {
      _type: Type.Boolean,
      _default: true,
      _description: 'Whether the check-in button on the "Appointments" list should be enabled',
    },
    showIfActiveVisit: {
      _type: Type.Boolean,
      _default: false,
      _description: 'Whether to show the check-in button if the patient currently has an active visit',
    },
    customUrl: {
      _type: Type.String,
      _default: '',
      _description: 'Custom URL to open when clicking the check-in button (instead of the start visit form)',
    },
  },
  checkOutButton: {
    enabled: {
      _type: Type.Boolean,
      _default: true,
      _description: 'Whether the check-out button on the "Appointments" list should be enabled',
    },
    customUrl: {
      _type: Type.String,
      _default: '',
      _description: 'Custom URL to open when clicking the check-out button',
    },
  },
  customPatientChartUrl: {
    _type: Type.String,
    _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
    _description: `Template URL that will be used when clicking on the patient name in the queues table.
      Available argument: patientUuid, openmrsSpaBase, openBase
      (openmrsSpaBase and openBase are available to any <ConfigurableLink>)`,
    _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
  },
  includePhoneNumberInExcelSpreadsheet: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Whether to include phone numbers in the exported Excel spreadsheet',
  },
  patientIdentifierType: {
    _type: Type.String,
    _default: '',
    _description: 'The name of the patient identifier type to be used for the patient identifier field',
  },
  showUnscheduledAppointmentsTab: {
    _type: Type.Boolean,
    _default: false,
    _description:
      'Whether to show the Unscheduled Appointments tab. Note that configuring this to true requires a custom unscheduledAppointment endpoint not currently available',
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
