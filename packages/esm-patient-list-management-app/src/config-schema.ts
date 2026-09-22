import { Type, validator } from '@openmrs/esm-framework';

export const configSchema = {
  systemListCohortTypeUUID: {
    _type: Type.UUID,
    _default: 'eee9970e-7ca0-4e8c-a280-c33e9d5f6a04',
    _description: 'UUID of the `System List` cohort type',
  },
  patientListsToShow: {
    _type: Type.Number,
    _default: 10,
    _description: 'The default number of lists to show in the Lists dashboard table',
    _validators: [validator((v: unknown) => typeof v === 'number' && v > 0, 'Must be greater than zero')],
  },
  defaultToCurrentLocation: {
    _type: Type.Boolean,
    _default: false,
    _description: "If true, the patient list will default to filtering by the user's current session location.",
  },
};

export interface PatientListManagementConfig {
  systemListCohortTypeUUID: string;
  patientListsToShow: number;
  defaultToCurrentLocation: boolean;
}
