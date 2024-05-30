import { Type, type ConfigSchema } from '@openmrs/esm-framework';

export const defaultPatientDetailsConfig = {
  admittedPatientDetails: [
    { id: 'patient-bed-number', fieldType: 'patient-bed-number-field' },
    {
      id: 'patient-name',
      fieldType: 'patient-name-field',
    },
    {
      id: 'patient-age',
      fieldType: 'patient-age-field',
    },
    {
      id: 'patient-city',
      fieldType: 'patient-city-field',
    },
    {
      id: 'patient-admitted-reason',
      fieldType: 'patient-admitted-reason-field',
    },
    {
      id: 'patient-time-lapse',
      fieldType: 'patient-time-lapse-field',
    },
  ],
  admittedPatientDefinitions: {
    fields: [
      'patient-bed-number',
      'patient-name',
      'patient-age',
      'patient-city',
      'patient-admitted-reason',
      'patient-time-lapse',
    ],
  },
};

export const configSchema: ConfigSchema = {
  admittedPatientConfig: {
    _Type: Type.Object,
    _description: 'Configuring admitted patient details',
    _default: defaultPatientDetailsConfig,
  },
};

export interface ConfigObject {
  admittedPatientConfig: AdmittedPatientConfig;
}

export interface AdmittedPatientConfig {
  _Type: Type.Object;
  _description: string;
  _default: PatientDetailsConfig;
}

export interface PatientDetailsConfig {
  admittedPatientDetails: PatientDetail[];
  admittedPatientDefinitions: {
    fields: string[];
  };
}

interface PatientDetail {
  id: string;
  fieldType: string;
}


interface WardPatientCardConfig {
  slotElementDefinitions: SlotElementDefinition[];
  slotDefinitions: SlotDefinition[],
  cardDefinitions: CardDefinition[];
}

type SlotElementDefinition = {
  id: string;
} & (
  | { slotElementType: 'patient-name-slot-element' }
  | { slotElementType: 'bed-number-slot-element' }
  | { slotElementType: 'patient-age-slot-element' }
  | { slotElementType: 'patient-address-slot-element' }
  | { slotElementType: 'admission-time-slot-element' }
)
interface SlotDefinition {

}

interface CardDefinition {
  slots: string[];
  appliedTo: Array<any>;
}