import { Type } from '@openmrs/esm-framework';
import vitalsConfigSchema, { VitalsConfigObject } from './current-visit/visit-details/vitals-config-schema';
import biometricsConfigSchema, { BiometricsConfigObject } from './current-visit/visit-details/biometrics-config-schema';

export const configSchema = {
  concepts: {
    priorityConceptSetUuid: { _type: Type.ConceptUuid, _default: '3e1583a1-e8b5-4576-afa6-c07f19bba341' },
    serviceConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '94788037-eec3-4336-aaf0-6052435811e9',
    },
    statusConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '386988e5-ff48-43cf-9d3b-81dc19452faf',
    },
    systolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    diastolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    pulseUuid: {
      _type: Type.ConceptUuid,
      _default: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    temperatureUuid: {
      _type: Type.ConceptUuid,
      _default: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    oxygenSaturationUuid: {
      _type: Type.ConceptUuid,
      _default: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    heightUuid: {
      _type: Type.ConceptUuid,
      _default: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    respiratoryRateUuid: {
      _type: Type.ConceptUuid,
      _default: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    generalPatientNoteUuid: {
      _type: Type.ConceptUuid,
      _default: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    midUpperArmCircumferenceUuid: {
      _type: Type.ConceptUuid,
      _default: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The Uuids of person attribute-type that captures contact information `e.g Next of kin contact details`',
    _default: [],
  },
  vitals: vitalsConfigSchema,
  biometrics: biometricsConfigSchema,
};

export interface ConfigObject {
  concepts: {
    priorityConceptSetUuid: string;
    serviceConceptSetUuid: string;
    statusConceptSetUuid: string;
    systolicBloodPressureUuid: string;
    diastolicBloodPressureUuid: string;
    pulseUuid: string;
    temperatureUuid: string;
    oxygenSaturationUuid: string;
    heightUuid: string;
    weightUuid: string;
    respiratoryRateUuid: string;
    midUpperArmCircumferenceUuid: string;
  };
  contactAttributeType: Array<string>;
  vitals: VitalsConfigObject;
  biometrics: BiometricsConfigObject;
}

export interface OutpatientConfig {
  offlineVisitTypeUuid: string;
  visitTypeResourceUrl: string;
  showRecommendedVisitTypeTab: boolean;
}
