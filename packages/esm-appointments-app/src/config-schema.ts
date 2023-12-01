import { Type } from '@openmrs/esm-framework';
import { spaBasePath } from './constants';

export const configSchema = {
  concepts: {
    visitQueueNumberAttributeUuid: {
      _type: Type.String,
      _description: 'The UUID of the visit attribute that contains the visit queue number.',
      _default: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
    },
  },
  appointmentTypes: {
    _type: Type.Array,
    _description: 'Configurable appointment types (types of appointments)',
    _default: ['Scheduled'],
  },
  appointmentStatuses: {
    _type: Type.Array,
    _description: 'Configurable appointment status (status of appointments)',
    _default: ['Requested', 'Scheduled', 'CheckedIn', 'Completed', 'Cancelled', 'Missed'],
  },
  daysOfTheWeek: {
    _type: Type.Array,
    _description: 'Configurable days of the week',
    _default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
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

  fullViewPrivilege: {
    _type: Type.String,
    _description: 'Name of the privilege to display the full view of the Appointments dashboard widget.',
    _default: "Today's Appointments Widget: Display Full View",
  },
  bahmniAppointmentsUiBaseUrl: {
    _type: Type.String,
    _description: 'Configurable base URL that points to the Bahmni Appointments UI',
    _default: '/appointments',
  },
  appointmentsBaseUrl: {
    _type: Type.String,
    _description: 'Configurable alternative URL for the Appointments UI. Eg, the Bahmni Appointments UI URL',
    _default: `${spaBasePath}`,
  },
  hiddenFormFields: {
    _type: Type.Array,
    _description: 'Array of form controls to be hidden on form load',
    _default: [],
  },
  showServiceQueueFields: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display service queue fields`',
    _default: false,
  },
  defaultFacilityUrl: {
    _type: Type.String,
    _default: '/ws/rest/v1/kenyaemr/default-facility',
    _description: 'Custom URL to load default facility if it is not in the session',
  },
  patientChartUrl: {
    _type: Type.String,
    _description: 'Custom URL to the patient chart',
    _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
  },
  patientIdentifierType: {
    _type: Type.String,
    _description: 'The name of the patient identifier type to be used for the patient identifier field',
    _default: 'OpenMRS ID',
  },
};

export interface ConfigObject {
  concepts: {
    visitQueueNumberAttributeUuid: string;
  };
  appointmentTypes: Array<string>;
  daysOfTheWeek: Array<string>;
  appointmentStatuses: Array<string>;
  useBahmniAppointmentsUI: boolean;
  useFullViewPrivilege: boolean;
  fullViewPrivilege: string;
  appointmentComments: Array<string>;
  hiddenFormFields: Array<string>;
  showServiceQueueFields: boolean;
  defaultFacilityUrl: string;
  patientChartUrl: string;
  patientIdentifierType: string;
}
