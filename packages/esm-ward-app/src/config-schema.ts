import { type PersonAddress, Type, validator, validators, type ConfigSchema } from '@openmrs/esm-framework';
import { type PatientCardElementType, patientCardElementTypes } from './types';

const defaultWardPatientCard: WardPatientCardDefinition = {
  card: {
    id: 'default-card',
    header: ['bed-number', 'patient-name', 'patient-age', 'patient-address'],
  },
  appliedTo: null,
};

export const defaultPatientCardElementConfig: PatientCardElementConfig = {
  addressFields: ['cityVillage', 'country'],
};

export const builtInPatientCardElements: PatientCardElementType[] = [
  'bed-number',
  'patient-name',
  'patient-age',
  'patient-address',
  'admission-time',
];

export const configSchema: ConfigSchema = {
  wardPatientCards: {
    _description: 'Configure the display of ward patient cards',
    patientCardElementDefinitions: {
      _type: Type.Array,
      _default: [],
      _elements: {
        id: {
          _type: Type.String,
          _description: 'The unique identifier for this custom patient card element',
        },
        elementType: {
          _type: Type.String,
          _description: 'The patient card element type',
          _validators: [validators.oneOf(patientCardElementTypes)],
        },
        config: {
          addressFields: {
            _type: Type.Array,
            _description: 'For patientCardElementType "patient-address", defining which address fields to show',
          },
        },
      },
    },
    cardDefinitions: {
      _type: Type.Array,
      _default: [defaultWardPatientCard],
      _description: `An array of card configuration. A card configuration can be applied to different ward locations.
         If multiple card configurations apply to a location, only the first one is chosen.`,
      _elements: {
        id: {
          _type: Type.String,
          _description: 'The unique identifier for this card definition. Currently unused, but that might change.',
        },
        card: {
          header: {
            _type: Type.Array,
            _element: {
              _type: Type.String,
              _description: 'The ID of the (bulit-in or custom) patient card element',
              _validators: [validators.oneOf(patientCardElementTypes)],
            },
          },
        },
        appliedTo: {
          _type: Type.Array,
          _elements: {
            location: {
              _type: Type.UUID,
              _description: 'The UUID of the location. If not provided, applies to all queues.',
              _default: null,
            },
          },
        },
      },
    },
  },
};

export interface WardConfigObject {
  wardPatientCards: WardPatientCardsConfig;
}

export interface WardPatientCardsConfig {
  patientCardElementDefinitions: Array<PatientCardElementDefinition>;
  cardDefinitions: Array<WardPatientCardDefinition>;
}

export interface WardPatientCardDefinition {
  card: {
    id: string;
    /**
     * an array of (either built-in or custom) patient card element ids
     */
    header: Array<string>; 
  };
  appliedTo?: Array<{
    /**
     * locationUuid. If given, only applies to patients at the specified ward locations. (If not provided, applies to all locations)
     */
    location: string; 
  }>;
}

export type PatientCardElementDefinition = {
  id: string;
  elementType: PatientCardElementType;
  config?: PatientCardElementConfig;
};

export interface PatientAddressElementConfig {
  addressFields: Array<keyof PersonAddress>;
}

export type PatientCardElementConfig = {} & PatientAddressElementConfig;
