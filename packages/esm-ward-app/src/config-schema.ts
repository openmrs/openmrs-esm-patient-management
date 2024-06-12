import { type PersonAddress, Type, validator, validators, type ConfigSchema } from '@openmrs/esm-framework';
import { type BentoElementType, bentoElementTypes } from './types';

const defaultWardPatientCard: WardPatientCardDefinition = {
  card: {
    id: 'default-card',
    header: ['bed-number', 'patient-name', 'patient-age', 'patient-address', 'admission-time'],
  },
  appliedTo: null,
};

export const defaultBentoElementConfig: BentoElementConfig = {
  addressFields: ['cityVillage'],
};

export const builtInBentoElements: BentoElementType[] = [
  'bed-number',
  'patient-name',
  'patient-age',
  'patient-address',
  'admission-time',
];

export const configSchema: ConfigSchema = {
  wardPatientCards: {
    _description: 'Configure the display of ward patient cards',
    bentoElementDefinitions: {
      _type: Type.Array,
      _default: [],
      _elements: {
        id: {
          _type: Type.String,
          _description: 'The unique identifier for this custom bento element',
        },
        elementType: {
          _type: Type.String,
          _description: 'The bento element type',
          _validators: [validators.oneOf(bentoElementTypes)],
        },
        config: {
          addressFields: {
            _type: Type.Array,
            _description: 'For bentoElementType "patient-address", defining which address fields to show',
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
              _description: 'The ID of the (bulit-in or custom) bento element',
              _validators: [
                validator(
                  (bentoElementId: string) => {
                    const validBentoElementIds: string[] = [...bentoElementTypes];
                    return validBentoElementIds.includes(bentoElementId);
                  },
                  (bentoElementId: string) => 'Invalid bento element id: ' + bentoElementId,
                ),
              ],
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
  bentoElementDefinitions: Array<BentoElementDefinition>;
  cardDefinitions: Array<WardPatientCardDefinition>;
}

export interface WardPatientCardDefinition {
  card: {
    id: string;
    header: Array<string>; // an array of (either built-in or custom) bento element ids
  };
  appliedTo?: Array<{
    location: string; // locationUuid. If given, only applies to patients at the specified ward locations. (If not provided, applies to all locations)
  }>;
}

export type BentoElementDefinition = {
  id: string;
  elementType: BentoElementType;
  config?: BentoElementConfig;
};

export interface PatientAddressBentoElementConfig {
  addressFields: Array<keyof PersonAddress>;
}

export type BentoElementConfig = {} & PatientAddressBentoElementConfig;
