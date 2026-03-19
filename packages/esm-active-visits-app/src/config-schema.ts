import { Type, validator } from '@openmrs/esm-framework';

export interface ActiveVisitsConfigSchema {
  activeVisits: {
    pageSize: number;
    pageSizes: Array<number>;
    identifiers: Array<IdentifiersDefinition>;
    obs: Array<string>;
    attributes: Array<AttributeDefinition>;
  };
}

export interface IdentifiersDefinition {
  header: {
    key: string;
    default: string;
  };
  identifierName: string;
}

export interface AttributeDefinition {
  display: string;
  header: {
    key: string;
    default: string;
  };
}

export const configSchema = {
  activeVisits: {
    identifiers: {
      _type: Type.Array,
      _default: [],
      _description: 'Customizable list of identifiers to display on active visits table',
      _elements: {
        header: {
          key: {
            _type: Type.String,
            _default: '',
            _description: 'Key to be used for translation purposes.',
          },
          default: {
            _type: Type.String,
            _default: '',
            _description: 'Default text to be displayed if no translation is found.',
          },
        },
        identifierName: {
          _type: Type.String,
          _default: '',
          _description: 'Name of the desired identifier to filter data returned from the visit resource.',
        },
      },
    },
    attributes: {
      _type: Type.Array,
      _default: [],
      _description: 'Customizable list of person attributes to display on active visits table',
      _elements: {
        display: {
          _type: Type.String,
          _description: 'Display name of the attribute type',
        },
        header: {
          key: {
            _type: Type.String,
            _default: '',
            _description: 'Key to be used for translation purposes.',
          },
          default: {
            _type: Type.String,
            _default: '',
            _description: 'Default text to be displayed if no translation is found.',
          },
        },
      },
    },
    pageSize: {
      _type: Type.Number,
      _default: 10,
      _description: 'Count of active visits to be shown in a single page.',
      _validators: [validator((v: unknown) => typeof v === 'number' && v > 0, 'Must be greater than zero')],
    },
    pageSizes: {
      _type: Type.Array,
      _default: [10, 20, 50],
      _description: 'Customizable page sizes that user can choose',
      _elements: {
        _type: Type.Number,
        _description: 'Number of entries to be displayed on the active visits table.',
        _validators: [validator((v: unknown) => typeof v === 'number' && v > 0, 'Must be greater than zero')],
      },
    },
    obs: {
      _type: Type.Array,
      _default: [],
      _description: 'Array of observation concept UUIDs to be displayed on the active visits table.',
      _elements: {
        _type: Type.UUID,
        _description: 'UUID of an observation concept.',
      },
    },
  },
};
