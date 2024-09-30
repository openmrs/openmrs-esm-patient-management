import { Type } from '@openmrs/esm-framework';

export const motherChildRowConfigSchema = {
  rowElements: {
    _type: Type.Array,
    _description: `IDs of patient card elements to appear in the mother child row. These can be built-in, or custom ones can be defined in patientCardElementDefinitions.`,
    _elements: {
      _type: Type.String,
    },
  },
};
