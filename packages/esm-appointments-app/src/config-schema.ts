import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    priorityConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '3e1583a1-e8b5-4576-afa6-c07f19bba341',
    },
    serviceConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '94788037-eec3-4336-aaf0-6052435811e9',
    },
    statusConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '386988e5-ff48-43cf-9d3b-81dc19452faf',
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
}
