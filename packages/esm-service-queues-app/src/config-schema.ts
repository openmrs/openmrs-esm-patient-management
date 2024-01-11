import { Type } from '@openmrs/esm-framework';
import vitalsConfigSchema, { type VitalsConfigObject } from './current-visit/visit-details/vitals-config-schema';
import biometricsConfigSchema, {
  type BiometricsConfigObject,
} from './current-visit/visit-details/biometrics-config-schema';

export const configSchema = {
  concepts: {
    priorityConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '78063dec-b6d8-40c1-9483-dd4d3c3ca434',
    },
    defaultPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default priority for the queues eg Not urgent.',
      _default: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
    },
    emergencyPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the priority with the highest sort weight for the queues eg Emergency.',
      _default: '04f6f7e0-e3cb-4e13-a133-4479f759574e',
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
      _default: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
    },
    defaultTransitionStatus: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default status for attending a service in the queues eg In Service.',
      _default: 'ca7494ae-437f-4fd0-8aae-b88b9a2ba47d',
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
    historicalObsConceptUuid: {
      _type: Type.Array,
      _description: 'The Uuids of the obs that are displayed on the previous visit modal',
      _default: ['161643AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    },
  },
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The Uuids of person attribute-type that captures contact information `e.g Next of kin contact details`',
    _default: [],
  },
  visitQueueNumberAttributeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the visit attribute that contains the visit queue number.',
    _default: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
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
  defaultIdentifierTypes: {
    _type: Type.Array,
    _element: {
      _type: Type.String,
    },
    _description: 'The identifier types to be display on all patient search result page',
    _default: ['05ee9cf4-7242-4a17-b4d4-00f707265c8a', 'f85081e2-b4be-4e48-b3a4-7994b69bb101'],
  },
  showRecommendedVisitTypeTab: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display recommended visit type tab. Requires `visitTypeResourceUrl`',
    _default: false,
  },
  customPatientChartUrl: {
    _type: Type.String,
    _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
    _description:
      'Template URL that will be used when clicking on the patient name in the queues table. Available argument: patientUuid',
  },
  defaultFacilityUrl: {
    _type: Type.String,
    _default: '/ws/rest/v1/kenyaemr/default-facility',
    _description: 'Custom URL to load default facility if it is not in the session',
  },
  customPatientChartText: {
    _type: Type.String,
    _default: '',
    _description: 'Custom label for patient chart button',
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
    emergencyPriorityConceptUuid: string;
    historicalObsConceptUuid: Array<string>;
  };
  contactAttributeType: Array<string>;
  vitals: VitalsConfigObject;
  biometrics: BiometricsConfigObject;
  showQueueTableTab: boolean;
  appointmentStatuses: Array<string>;
  defaultIdentifierTypes: Array<string>;
  showRecommendedVisitTypeTab: boolean;
  customPatientChartUrl: string;
  defaultFacilityUrl: string;
  customPatientChartText: string;
}

export interface OutpatientConfig {
  visitTypeResourceUrl: string;
}
