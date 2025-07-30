import { Type, validator, validators } from '@openmrs/esm-framework';

export const appointmentColumnTypes = [
  'patient-name',
  'identifier',
  'location',
  'service-type',
  'status',
  'date-time',
  'provider',
  'actions',
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

  appointmentTables: {
    _description: 'Configuration for appointment tables',
    columnDefinitions: {
      _type: Type.Array,
      _default: [],
      _description: 'Custom columns for appointment tables',
      _elements: {
        _validators: [
          validator(
            (columnDef: AppointmentColumnDefinition) =>
              Boolean(columnDef.columnType || appointmentColumnTypes.some((c) => c == columnDef.id)),
            (columnDef) =>
              `No columnType provided for column with ID '${
                columnDef.id
              }', and the ID is not a valid columnType. Valid column types are: ${appointmentColumnTypes.join(', ')}.`,
          ),
        ],
        id: {
          _type: Type.String,
          _description: 'The unique identifier for the column',
        },
        columnType: {
          _type: Type.String,
          _description: 'The type of column, if different from the ID',
          _validators: [validators.oneOf(appointmentColumnTypes)],
          _default: null,
        },
        header: {
          _type: Type.String,
          _description: 'The header text for the column',
          _default: null,
        },
        config: {
          _type: Type.Object,
          _description: 'Column-specific configuration',
          _default: {},
        },
      },
    },
    tableDefinitions: {
      _type: Type.Array,
      _default: [
        {
          columns: ['patient-name', 'identifier', 'location', 'service-type', 'status'],
        },
      ],
      _elements: {
        columns: {
          _type: Type.Array,
          _elements: {
            _type: Type.String,
          },
        },
      },
    },
  },
};

export interface ConfigObject {
  allowAllDayAppointments: boolean;
  appointmentStatuses: Array<string>;
  appointmentTypes: Array<string>;
  checkInButton: {
    enabled: boolean;
    showIfActiveVisit: boolean;
    customUrl: string;
  };
  checkOutButton: {
    enabled: boolean;
    customUrl: string;
  };
  appointmentTables: {
    columnDefinitions: Array<AppointmentColumnDefinition>;
    tableDefinitions: Array<AppointmentTableDefinition>;
  };
  customPatientChartUrl: string;
  includePhoneNumberInExcelSpreadsheet: boolean;
  patientIdentifierType: string;
  showUnscheduledAppointmentsTab: boolean;
}

export interface AppointmentColumnDefinition {
  id: string;
  columnType?: AppointmentColumnType;
  header?: string;
  config?: Record<string, any>;
}

export interface AppointmentTableDefinition {
  columns: Array<string>;
}
