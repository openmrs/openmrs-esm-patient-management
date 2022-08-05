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
};

export interface ConfigObject {
  concepts: {
    priorityConceptSetUuid: string;
    serviceConceptSetUuid: string;
  };
  appointmentKinds: Array<string>;
  daysOfTheWeek: Array<string>;
  appointmentStatuses: Array<string>;
}
