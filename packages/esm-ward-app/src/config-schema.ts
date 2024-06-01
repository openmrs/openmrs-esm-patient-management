import { PersonAddress, Type, type ConfigSchema } from '@openmrs/esm-framework';

const defaultWardPatientCardConfig : WardPatientCardConfig = {
  slotElementDefinitions: [
    {id: "bed-number-element", slotElementType: "bed-number-slot-element"},
    {id: "name-element", slotElementType: "patient-name-slot-element"},
    {id: "age-element", slotElementType: "patient-age-slot-element"},
    {
      id: "address-element", 
      slotElementType: "patient-address-slot-element",
      config: {
        fields: ["stateProvince", "country"]
      }
    },
    {id: "admission-time-element", slotElementType: "admission-time-slot-element"},
    // {id: "ward-time-element", slotElementType: "time-on-ward-slot-element"},
  ],
  slotDefinitions: [
    {id: "header-slot", slotType: "bento-slot", 
      elements: [
        "bed-number-element", 
        "name-element", 
        "age-element", 
        "address-element", 
        "admission-time-element"
      ]},
    {id: "footer-slot", slotType: "bento-slot",
      elements: [
        // "ward-time-element"
      ]
    }
  ],
  cardDefinitions: [
    {
      slots: ["header-slot", "footer-slot"],
      // appliedTo: {}
    }
  ]
}

export const configSchema: ConfigSchema = {
  wardPatientCardConfig: {
    _Type: Type.Object,
    _description: 'Configuring admitted patient details',
    _default: defaultWardPatientCardConfig,
  },
};

export interface ConfigObject {
  wardPatientCardConfig: WardPatientCardConfig;
}

export interface WardPatientCardConfig {
  slotElementDefinitions: SlotElementDefinition[];
  slotDefinitions: SlotDefinition[],
  cardDefinitions: CardDefinition[];
}

export type SlotElementDefinition = {
  id: string;
} & (
  | { slotElementType: 'patient-name-slot-element' }
  | { slotElementType: 'bed-number-slot-element' }
  | { slotElementType: 'patient-age-slot-element' }
  | { 
      slotElementType: 'patient-address-slot-element',
      config: PatientAddressConfig
    }
  | { slotElementType: 'admission-time-slot-element' }
  | { slotElementType: 'time-on-ward-slot-element' }
)

export interface PatientAddressConfig {
  fields: Array<keyof PersonAddress>;
}

export type SlotDefinition = {
  id: string;
} & (
  | { slotType: 'bento-slot', elements: string[]}
)

export interface CardDefinition {
  slots: string[];
  appliedTo?: Array<{
    location?: string, // locationUuid. If given, only applies to patients at the specified ward location. (If not provided, applies to all locations)
    status?: "admitted" | "pending" // admission status. If given, only applies to patients with the specified status. (If not provided, applies to all statuses) 
  }>;
}