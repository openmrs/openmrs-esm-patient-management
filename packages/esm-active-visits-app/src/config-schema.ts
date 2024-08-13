import { Type } from '@openmrs/esm-framework';

export interface SectionDefinition {
  activeVisits: {
    pageSize: Number;
    pageSizes: Array<Number>;
    identifiers: Array<IdentifiersDefinition>;
  };
}

export interface IdentifiersDefinition {
  id: Number;
  header: {
    key: string;
    default: string;
  };
  identifierName: string;
}

export const configSchema = {
  activeVisits: {
    identifiers: {
      _type: Type.Array,
      _description: 'Customizable list of identifiers to display on active visits table',
      _elements: {
        header: {
          key: {
            _type: Type.String,
            _default: null,
            _description: 'Key to be used for translation purposes.',
          },
          default: {
            _type: Type.String,
            _default: null,
            _description: 'Default text to be displayed if no translation is found.',
          },
        },
        identifierName: {
          _type: Type.String,
          _default: null,
          _description: 'Name of the desired identifier to filter data returned from the visit resource.',
        },
      },
      _default: null,
    },
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
