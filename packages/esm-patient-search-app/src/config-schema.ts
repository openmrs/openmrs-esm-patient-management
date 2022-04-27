import { Type, validators } from '@openmrs/esm-framework';
export const configSchema = {
  search: {
    patientResultUrl: {
      _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
      _description: 'Where clicking a patient result takes the user. Accepts template parameter ${patientUuid}',
      _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
    },
  },
  includeDead: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to include dead patients in search results',
  },
};

export interface PatientSearchConfig {
  search: {
    patientResultUrl: string;
  };
  includeDead: boolean;
}
