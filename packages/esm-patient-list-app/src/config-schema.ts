import { Type, validators } from '@openmrs/esm-framework';

export const configSchema = {
  myListCohortTypeUUID: {
    _type: Type.UUID,
    _description: 'The UUID of the `My List` cohort type',
    _default: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
  },
};

export interface ConfigSchema {
  myListCohortTypeUUID: string;
}
