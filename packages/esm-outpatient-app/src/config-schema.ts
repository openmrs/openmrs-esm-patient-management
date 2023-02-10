import { Type } from '@openmrs/esm-framework';
import vitalsConfigSchema, { VitalsConfigObject } from './current-visit/visit-details/vitals-config-schema';
import biometricsConfigSchema, { BiometricsConfigObject } from './current-visit/visit-details/biometrics-config-schema';

export const configSchema = {
  concepts: {
    priorityConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '78063dec-b6d8-40c1-9483-dd4d3c3ca434',
    },
    defaultPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default priority for the queues eg Not urgent.',
      _default: '9e123c90-76ac-4eaa-8d40-35577781eb46',
    },
    emergencyPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the priority with the highest sort weight for the queues eg Emergency.',
      _default: '5c2d5f8c-5efb-46d0-8e28-9e707ab7523c',
    },
    serviceConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: 'a8f3f64a-11d5-4a09-b0fb-c8118fa349f3',
    },
    statusConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: 'd60ffa60-fca6-4c60-aea9-a79469ae65c7',
    },
    defaultStatusConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default status for the queues eg Waiting.',
      _default: '136203AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
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
    visitQueueNumberAttributeUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the visit attribute that contains the visit queue number.',
      _default: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
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
  showQueueTableTab: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Disable outpatient table tabs',
  },
  appointmentStatuses: {
    _type: Type.Array,
    _description: 'Configurable appointment status (status of appointments)',
    _default: ['Requested', 'Scheduled', 'CheckedIn', 'Completed', 'Cancelled', 'Missed'],
  },
};

export interface ConfigObject {
  concepts: {
    priorityConceptSetUuid: string;
    defaultPriorityConceptUuid: string;
    serviceConceptSetUuid: string;
    statusConceptSetUuid: string;
    defaultStatusConceptUuid: string;
    systolicBloodPressureUuid: string;
    diastolicBloodPressureUuid: string;
    pulseUuid: string;
    temperatureUuid: string;
    oxygenSaturationUuid: string;
    heightUuid: string;
    weightUuid: string;
    respiratoryRateUuid: string;
    midUpperArmCircumferenceUuid: string;
    visitQueueNumberAttributeUuid: string;
    emergencyPriorityConceptUuid: string;
  };
  contactAttributeType: Array<string>;
  vitals: VitalsConfigObject;
  biometrics: BiometricsConfigObject;
  showQueueTableTab: boolean;
  appointmentStatuses: Array<string>;
}

export interface OutpatientConfig {
  offlineVisitTypeUuid: string;
  visitTypeResourceUrl: string;
  showRecommendedVisitTypeTab: boolean;
}
