import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  activeVisits: {
    pageSize: {
      _type: Type.Number,
      _description: 'Count of active visits to be shown in a single page.',
      _default: 10,
    },
    pageSizes: {
      _type: Type.Array,
      _description: 'Customizable page sizes that user can choose',
      _default: [10, 20, 50],
    },
  },
};
