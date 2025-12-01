import { Type, validators } from '@openmrs/esm-framework';
import { appointmentColumnTypes } from './constants';

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
  showEarlyAppointmentsTab: {
    _type: Type.Boolean,
    _default: false,
    _description:
      'Whether to show the Early Appointments tab. Note that configuring this to true requires a custom earlyAppointment endpoint not currently available',
  },
  appointmentsTableColumns: {
    _type: Type.Array,
    _description:
      'Columns to display in the appointment table. Available options: ' + appointmentColumnTypes.join(', '),
    _default: ['patientName', 'identifier', 'location', 'serviceType', 'status', 'prescription', 'provider'],
    _elements: {
      _type: Type.String,
      _validators: [validators.oneOf(appointmentColumnTypes)],
    },
  },
  filterProvidersByAppointmentSupportedEnabled: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to filter providers by appointment supported enabled',
  },
  prescriptionConfig: {
    logoUrl: {
      _type: Type.String,
      _default: '',
      _description: 'URL of the hospital/clinic logo to display in the prescription header',
    },
    watermarkLogoUrl: {
      _type: Type.String,
      _default: '',
      _description:
        'URL of the icon/logo to display as watermark in the prescription body. Should be an icon without text for best results',
    },
    watermarkAlignment: {
      _type: Type.String,
      _default: 'center',
      _description: 'Alignment of the watermark logo: left, center, or right',
      _validators: [validators.oneOf(['left', 'center', 'right'])],
    },
    watermarkOpacity: {
      _type: Type.Number,
      _default: 0.04,
      _description: 'Opacity of the watermark logo (0.0 to 1.0). Recommended: 0.03-0.08 for subtle watermark effect',
      _validators: [validators.inRange(0, 1)],
    },
    showDiagnosisSection: {
      _type: Type.Boolean,
      _default: true,
      _description: 'Show diagnosis section in prescription template',
    },
    hospitalSlogan: {
      _type: Type.String,
      _default: 'SLOGAN HERE',
      _description: 'Hospital slogan to display on prescription footer',
    },
    landlineNumber: {
      _type: Type.String,
      _default: '',
      _description: 'Hospital landline phone number',
    },
    whatsappNumber: {
      _type: Type.String,
      _default: '',
      _description: 'Hospital WhatsApp contact number',
    },
    email: {
      _type: Type.String,
      _default: '',
      _description: 'Hospital contact email',
    },
    address: {
      _type: Type.String,
      _default: '',
      _description: 'Hospital physical address',
    },
    website: {
      _type: Type.String,
      _default: '',
      _description: 'Hospital website URL',
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
  showEarlyAppointmentsTab: boolean;
  filterProvidersByAppointmentSupportedEnabled: boolean;
  prescriptionConfig: {
    logoUrl: string;
    watermarkLogoUrl: string;
    watermarkAlignment: 'left' | 'center' | 'right';
    watermarkOpacity: number;
    showDiagnosisSection: boolean;
    hospitalSlogan: string;
    landlineNumber: string;
    whatsappNumber: string;
    email: string;
    address: string;
    website: string;
  };
}
