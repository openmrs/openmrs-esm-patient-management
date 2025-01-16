import { Type, validators } from '@openmrs/esm-framework';

export const configSchema = {
  search: {
    patientChartUrl: {
      _type: Type.String,
      _default: '${openmrsSpaBase}/patient/${patientUuid}/chart/',
      _description:
        'The URL template to navigate to when a patient is selected from the search results. `openmrsSpaBase` is the base URL for the SPA, and patientUuid is the UUID of the patient.',
      _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
    },
    showRecentlySearchedPatients: {
      _type: Type.Boolean,
      _default: true,
      _description:
        'When enabled, displays a list of recently searched patients in the initial search results, providing quick access to frequently accessed patient records.',
    },
    disableTabletSearchOnKeyUp: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Disable the default "keyup search" for instant patient search as typing concludes on tablet devices',
    },
    searchFilterFields: {
      _type: Type.Object,
      _description: 'Configuration for advanced search fields',
      _default: {
        gender: {
          enabled: true,
        },
        dateOfBirth: {
          enabled: true,
        },
        age: {
          enabled: true,
          min: 0,
        },
        postcode: {
          enabled: true,
        },
        personAttributes: [
          {
            attributeTypeUuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
          },
        ],
      },
      gender: {
        _type: Type.Object,
        _description: 'Configuration for gender field',
        enabled: {
          _type: Type.Boolean,
          _description: 'Optional. If true, determines whether to display the gender field or not. Defaults to true',
          _default: true,
        },
      },
      dateOfBirth: {
        _type: Type.Object,
        _description: 'Configuration for the date of birth field',
        enabled: {
          _type: Type.Boolean,
          _description:
            'Optional. If true, determines whether to display the date of birth field or not. Defaults to true',
          _default: true,
        },
      },
      age: {
        _type: Type.Object,
        _description: 'Configuration for the age field',
        enabled: {
          _type: Type.Boolean,
          _description: 'Optional. If true, determines whether to display the age field or not. Defaults to true',
          _default: true,
        },
        min: {
          _type: Type.Number,
          _description: 'The minimum value for the age field',
          _default: 0,
        },
        max: {
          _type: Type.Number,
          _description: 'The maximum value for the age field',
          _default: 0,
        },
      },
      postcode: {
        _type: Type.Object,
        _description: 'Configuration for the postcode field',
        enabled: {
          _type: Type.Boolean,
          _description: 'Optional. If true, determines whether to display the postcode field or not. Defaults to true',
          _default: true,
        },
      },
      personAttributes: {
        _type: Type.Array,
        _description: 'Configuration for person attributes to display on advanced search',
        _elements: {
          _type: Type.Object,
          placeholder: {
            _type: Type.String,
            _description: 'Placeholder text for the field',
            _default: '',
          },
          attributeTypeUuid: {
            _type: Type.UUID,
            _description: 'UUID of the person attribute type',
          },
          answerConceptSetUuid: {
            _type: Type.ConceptUuid,
            _default: null,
            _description:
              'For coded questions only. A concept which has the possible responses either as answers or as set members.',
          },
          conceptAnswersUuids: {
            _type: Type.Array,
            _description: 'A list of UUIDs representing the possible answers for the associated concept question.',
            _default: [],
          },
          locationTag: {
            _type: Type.String,
            _default: null,
            _description:
              'Only for fields with "person attribute" type `org.openmrs.Location`. This filters the list of location options in the dropdown based on their location tag.',
          },
        },
        _default: [],
      },
    },
  },
  includeDead: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to include dead patients in search results',
  },
  contactAttributeType: {
    _type: Type.Array,
    _elements: {
      _type: Type.UUID,
    },
    _default: [
      // Telephone Number attribute type UUID
      '14d4f066-15f5-102d-96e4-000c29c2a5d7',
      // Email attribute type UUID
      'e3d177ee-04ad-11ed-828d-0242ac1e0002',
    ],
  },
  defaultIdentifierTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.UUID,
    },
    _description:
      'A list of identifier types to be displayed in the patient search results as banner tags. Defaults to the OpenMRS ID identifier type.',
    _default: [
      // OpenMRS ID identifier type UUID
      '05a29f94-c0ed-11e2-94be-8c13b969e334',
    ],
  },
};

export type BuiltInFieldType = 'gender' | 'dateOfBirth' | 'age' | 'postcode';

export interface PersonAttributeFieldConfig {
  attributeTypeUuid: string;
  placeholder?: string;
  answerConceptSetUuid?: string;
  conceptAnswersUuids?: Array<string>;
  locationTag?: string;
}

export interface BuiltInFieldConfig {
  enabled: boolean;
  min?: number;
  max?: number;
}

export type PatientSearchConfig = {
  search: {
    disableTabletSearchOnKeyUp: boolean;
    patientChartUrl: string;
    showRecentlySearchedPatients: boolean;
    searchFilterFields: {
      gender: BuiltInFieldConfig;
      dateOfBirth: BuiltInFieldConfig;
      age: BuiltInFieldConfig & { min?: number };
      postcode: BuiltInFieldConfig;
      personAttributes: Array<PersonAttributeFieldConfig>;
    };
  };
  contactAttributeType: Array<string>;
  defaultIdentifier: string;
  defaultIdentifierTypes: Array<string>;
  includeDead: boolean;
};
