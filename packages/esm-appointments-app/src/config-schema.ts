import { Type } from '@openmrs/esm-framework';

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
  appointmentKinds: {
    _type: Type.Array,
    _description: 'Configurable appointment kinds (types of appointments)',
    _default: ['Scheduled', 'WalkIn', 'Virtual'],
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
    _description: "if set to 'false', will always display the full view, disregarding any privilege",
    _default: false,
  },

  fullViewPrivilege: {
    _type: Type.String,
    _description: 'Display for the privilege to view and manage appointments',
    _default: "Today's Appointments Widget: Display Full View",
  },
};

export interface ConfigObject {
  concepts: {
    priorityConceptSetUuid: string;
    serviceConceptSetUuid: string;
  };
  appointmentKinds: Array<string>;
  daysOfTheWeek: Array<string>;
  appointmentStatuses: Array<string>;
  useBahmniAppointmentsUI: boolean;
  useFullViewPrivilege: boolean;
  fullViewPrivilege: string;
}
