import { Type, restBaseUrl, validators } from '@openmrs/esm-framework';
import { spaHomePage } from './constants';

export const configSchema = {
  allowAllDayAppointments: {
    _type: Type.Boolean,
    _description: 'Whether to allow scheduling of all-day appointments (vs appointments with start time and end time)',
    _default: false,
  },
  appointmentsBaseUrl: {
    _type: Type.String,
    _description: 'Configurable alternative URL for the Appointments UI. Eg, the Bahmni Appointments UI URL',
    _default: `${spaHomePage}`,
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
  bahmniAppointmentsUiBaseUrl: {
    _type: Type.String,
    _description: 'Configurable base URL that points to the Bahmni Appointments UI',
    _default: '/appointments',
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
  concepts: {
    visitQueueNumberAttributeUuid: {
      _type: Type.String,
      _description: 'The UUID of the visit attribute that contains the visit queue number.',
      _default: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
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
  daysOfTheWeek: {
    _type: Type.Array,
    _description: 'Configurable days of the week',
    _default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  defaultFacilityUrl: {
    _type: Type.String,
    _default: `${restBaseUrl}/kenyaemr/default-facility`,
    _description: 'Custom URL to load default facility if it is not in the session',
  },
  fullViewPrivilege: {
    _type: Type.String,
    _description: 'Name of the privilege to display the full view of the Appointments dashboard widget.',
    _default: "Today's Appointments Widget: Display Full View",
  },
  hiddenFormFields: {
    _type: Type.Array,
    _description: 'Array of form controls to be hidden on form load',
    _default: [],
  },
  patientIdentifierType: {
    _type: Type.String,
    _description: 'The name of the patient identifier type to be used for the patient identifier field',
    _default: '',
  },
  showServiceQueueFields: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display service queue fields`',
    _default: false,
  },
  showUnscheduledAppointmentsTab: {
    _type: Type.Boolean,
    _description:
      'Whether to show the Unscheduled Appointments tab. Note that configuring this to true requires a custom unscheduledAppointment endpoint not currently available',
    _default: false,
  },
  useBahmniAppointmentsUI: {
    _type: Type.Boolean,
    _description: 'Open links in Bahmni Appointments UI instead of O3 UI',
    _default: false,
  },
  useFullViewPrivilege: {
    _type: Type.Boolean,
    _description: "If set to 'false', will always display the full view, disregarding any privilege",
    _default: false,
  },
};

export interface ConfigObject {
  allowAllDayAppointments: boolean;
  appointmentComments: Array<string>;
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
  concepts: {
    visitQueueNumberAttributeUuid: string;
  };
  customPatientChartUrl: string;
  daysOfTheWeek: Array<string>;
  defaultFacilityUrl: string;
  fullViewPrivilege: string;
  hiddenFormFields: Array<string>;
  patientIdentifierType: string;
  showServiceQueueFields: boolean;
  showUnscheduledAppointmentsTab: boolean;
  useBahmniAppointmentsUI: boolean;
  useFullViewPrivilege: boolean;
}
