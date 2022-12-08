import { Type, validators } from '@openmrs/esm-framework';
export const configSchema = {
  search: {
    patientResultUrl: {
      _type: Type.String,
      _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
      _description: 'Where clicking a patient result takes the user. Accepts template parameter ${patientUuid}',
      _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
    },
    redirectToPatientDashboard: {
      _type: Type.String,
      _default: 'Patient Summary',
      _description:
        'On clicking the patient banner in the search results, which should be the default patient chart dashboard to redirect to.',
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
  MPI: {
    prefferedPatientIdentifierTitle: {
      _type: Type.String,
      _default: 'Health ID',
    },
    prefferedPatientIdentifierType: {
      _type: Type.String,
      _default: '',
    },
  },
};
