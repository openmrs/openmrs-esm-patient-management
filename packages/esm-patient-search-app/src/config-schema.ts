import { Type, validators } from '@openmrs/esm-framework';
export const configSchema = {
  search: {
    patientResultUrl: {
      _type: Type.String,
      _default: '${openmrsSpaBase}/patient/${patientUuid}/chart/',
      _description: 'The URL to navigate to when a patient is selected from the search results.',
      _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
    },
    showRecentlySearchedPatients: {
      _type: Type.Boolean,
      _default: false,
      _description: 'Whether to show recently searched patients by default in the patient search results.',
    },
    disableTabletSearchOnKeyUp: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Disable the default "keyup search" for instant patient search as typing concludes on tablet devices',
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
      // This UUID is for the Telephone Number
      '14d4f066-15f5-102d-96e4-000c29c2a5d7',
      // This UUID is for the email
      'e3d177ee-04ad-11ed-828d-0242ac1e0002',
    ],
  },
  defaultIdentifierTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.UUID,
    },
    _description:
      'A list of identifier types to be displayed in the patient search results as banner tags. If no defaultIdentifierTypes are provided, the defaultIdentifier will be displayed.',
    // These values correspond to the Patient Clinic Number and National Unique Patient Identifier (NUPI) identifier types respectively
    _default: [
      'b4d66522-11fc-45c7-83e3-39a1af21ae0d',
      'f85081e2-b4be-4e48-b3a4-7994b69bb101',
      '05a29f94-c0ed-11e2-94be-8c13b969e334',
    ],
  },
};

export type PatientSearchConfig = {
  search: {
    disableTabletSearchOnKeyUp: boolean;
    patientSearchResult: string;
    showRecentlySearchedPatients: string;
  };
  contactAttributeType: Array<string>;
  defaultIdentifier: string;
  defaultIdentifierTypes: Array<string>;
  includeDead: boolean;
};
