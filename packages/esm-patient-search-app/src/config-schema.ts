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

export type PatientSearchConfig = {
  search: {
    disableTabletSearchOnKeyUp: boolean;
    patientChartUrl: string;
    showRecentlySearchedPatients: boolean;
  };
  contactAttributeType: Array<string>;
  defaultIdentifier: string;
  defaultIdentifierTypes: Array<string>;
  includeDead: boolean;
};
