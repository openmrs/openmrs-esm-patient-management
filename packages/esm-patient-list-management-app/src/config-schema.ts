import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/utils/createSubject';

export const configSchema = {
  myListCohortTypeUUID: {
    _type: Type.UUID,
    _description: 'UUID of the `My List` cohort type',
    _default: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
  },
  systemListCohortTypeUUID: {
    _type: Type.UUID,
    _description: 'UUID of the `System List` cohort type',
    _default: 'eee9970e-7ca0-4e8c-a280-c33e9d5f6a04',
  },
  patientListsToShow: {
    _type: Type.Number,
    _description: 'The default number of lists to show in the Lists dashboard table',
    _default: 10,
  },
  clinicName: {
    _type: Type.String,
    _description: 'The clinic name to display on theh page',
    _default: 'WellnessPoint Demo Clinic',
  },
};

export interface ConfigSchema {
  myListCohortTypeUUID: string;
  systemListCohortTypeUUID: string;
  patientListsToShow: number;
  clinicName: string;
}
