import { Type, validators, type ConfigSchema, type PersonAddress } from '@openmrs/esm-framework';
import { patientCardElementTypes, type PatientCardElementType } from './types';

const defaultWardPatientCard: WardPatientCardDefinition = {
  id: 'default-card',
  rows: [
    {
      rowType: 'header',
      elements: ['bed-number', 'patient-name', 'patient-age', 'patient-address'],
    },
  ],
  appliedTo: null,
};

const defaultPatientAddressFields: Array<keyof PersonAddress> = ['cityVillage', 'country'];

export const defaultPatientCardElementConfig: PatientCardElementConfig = {
  addressFields: defaultPatientAddressFields,
  obsConceptUuid: null,
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
            _default: defaultPatientAddressFields,
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
        rows: {
          _type: Type.Array,
          _elements: {
            id: {
              _type: Type.String,
              _description: 'The unique identifier for this card row. Currently unused, but that might change.',
            },
            elements: {
              _type: Type.Array,
              _element: {
                _type: Type.String,
                _description: 'The ID of the (bulit-in or custom) patient card elements to appear in this card row',
                _validators: [validators.oneOf(patientCardElementTypes)],
              },
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
  id: string;
  rows: Array<{
    /**
     * The type of row. Currently, only "header" is supported
     */
    rowType: 'header';

    /**
     * an array of (either built-in or custom) patient card element ids
     */
    elements: Array<string>;
  }>;
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

export interface PatientObsElementConfig {
  /**
   * the observation with the specified concept to display
   */
  obsConceptUuid: string;
}

export type PatientCardElementConfig = PatientAddressElementConfig & PatientObsElementConfig;
