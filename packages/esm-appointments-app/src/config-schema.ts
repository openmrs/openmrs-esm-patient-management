import { Type } from '@openmrs/esm-framework';
import { spaBasePath } from './constants';

export const configSchema = {
  concepts: {
    priorityConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '96105db1-abbf-48d2-8a52-a1d561fd8c90',
    },
    serviceConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
    },
    statusConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: 'a8f3f64a-11d5-4a09-b0fb-c8118fa349f3',
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
};

export interface ConfigObject {
  concepts: {
    priorityConceptSetUuid: string;
    serviceConceptSetUuid: string;
  };
  appointmentTypes: Array<string>;
  daysOfTheWeek: Array<string>;
  appointmentStatuses: Array<string>;
  useBahmniAppointmentsUI: boolean;
  useFullViewPrivilege: boolean;
  fullViewPrivilege: string;
  appointmentComments: Array<string>;
  hiddenFormFields: Array<string>;
}
