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
  address: {
    addressFields: defaultPatientAddressFields,
  },
  obs: null,
  codedObs: null,
};

export const builtInPatientCardElements: PatientCardElementType[] = [
  'bed-number',
  'patient-name',
  'patient-age',
  'patient-address',
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
          address: {
            _description: 'Config for the patientCardElementType "patient-address"',
            addressFields: {
              _type: Type.Array,
              _description: 'defines which address fields to show',
              _default: defaultPatientAddressFields,
            },
          },
          obs: {
            _description: 'Config for the patientCardElementType "patient-obs"',
            conceptUuid: {
              _type: Type.UUID,
              _description: 'Required. Identifies the concept to use to identify the desired observations.',
              _default: null,
            },
            label: {
              _type: Type.String,
              _description:
                "Optional. The custom label or i18n key to the translated label to display. If not provided, defaults to the concept's name. (Note that this can be set to an empty string to not show a label)",
              _default: null,
            },
            labelI18nModule: {
              _type: Type.String,
              _description: 'Optional. The custom module to use for translation of the label',
              _default: null,
            },
            orderBy: {
              _type: Type.String,
              _description:
                "Optional. One of 'ascending' or 'descending', specifying whether to display the obs by obsDatetime ascendingly or descendingly. Defaults to ascending.",
              _default: 'descending',
              _validators: [validators.oneOf(['ascending', 'descending'])],
            },
            limit: {
              _type: Type.Number,
              _description: 'Optional. Limits the max number of obs to display. Unlimited by default.',
              _default: null,
            },
            onlyWithinCurrentVisit: {
              _type: Type.Boolean,
              _description:
                'Optional. If true, limits display to only observations within current visit. Defaults to false',
              _default: false,
            },
          },
          codedObs: {
            _description: 'Config for the patientCardElementType "patient-coded-obs"',
            conceptUuid: {
              _type: Type.UUID,
              _description: 'Required. Identifies the concept to use to identify the desired observations.',
              _default: null,
            },
            summaryLabel: {
              _type: Type.String,
              _description: `Optional. The custom label or i18n key to the translated label to display for the summary tag. The summary tag shows the count of the number of answers that are present but not configured to show as their own tags. If not provided, defaults to the name of the concept.`,
              _default: null,
            },
            summaryLabelI18nModule: {
              _type: Type.String,
              _description: 'Optional. The custom module to use for translation of the summary label',
              _default: null,
            },
            summaryLabelColor: {
              _type: Type.String,
              _description:
                'The color of the summary tag. See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors',
              _default: null,
            },
            tags: {
              _description: `An array specifying concept sets and color. Observations with coded values that are members of the specified concept sets will be displayed as their own tags with the specified color. Any observation with coded values not belonging to any concept sets specified will be summarized as a count in the summary tag. If a concept set is listed multiple times, the first matching applied-to rule takes precedence.`,
              _type: Type.Array,
              _elements: {
                color: {
                  _type: Type.String,
                  _description:
                    'Color of the tag. See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors.',
                },
                appliedToConceptSets: {
                  _type: Type.Array,
                  _description: `The concept sets which the color applies to. Observations with coded values that are members of the specified concept sets will be displayed as their own tag with the specified color. If an observation's coded value belongs to multiple concept sets, the first matching applied-to rule takes precedence.`,
                  _elements: {
                    _type: Type.UUID,
                  },
                },
              },
            },
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
   * Required. Identifies the concept to use to identify the desired observations.
   */
  conceptUuid: string;

  /**
   * Optional. The custom label or i18n key to the translated label to display. If not provided, defaults to the concept's name.
   * (Note that this can be set to an empty string to not show a label)
   */
  label?: string;

  /**
   * Optional. The custom module to use for translation of the label
   */
  labelI18nModule?: string;

  /**
   * Optional. One of 'ascending' or 'descending', specifying whether to display the obs by obsDatetime ascendingly or descendingly. Defaults to descending.
   */
  orderBy?: 'ascending' | 'descending';

  /**
   * Optional. Limits the max number of obs to display. Unlimited by default.
   */
  limit?: number;

  /**
   * Optional. If true, limits display to only observations within current visit
   */
  onlyWithinCurrentVisit?: boolean;
}

export interface PatientCodedObsElementConfig {
  /**
   * Required. Identifies the concept to use to identify the desired observations.
   */
  conceptUuid: string;

  /**
   * Optional. The custom label or i18n key to the translated label to display for the summary tag. The summary tag
   * shows the count of the number of answers that are present but not configured to show as their own tags. If not
   * provided, defaults to the name of the concept.
   */
  summaryLabel?: string;
  /**
   * Optional. The custom module to use for translation of the summary label
   */
  summaryLabelI18nModule?: string;

  /**
   * The color of the summary tag.
   * See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors
   */
  summaryLabelColor?: string;

  /**
   * An array specifying concept sets and color. Observations with coded values that are members of the specified concept sets
   * will be displayed as their own tags with the specified color. Any observation with coded values not belonging to
   * any concept sets specified will be summarized as a count in the summary tag. If a concept set is listed multiple times,
   * the first matching applied-to rule takes precedence.
   */
  tags: Array<{
    /**
     * Color of the tag. See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors.
     */
    color: string;

    /**
     * The concept sets which the color applies to. Observations with coded values that are members of the specified concept sets
     * will be displayed as their own tag with the specified color.
     * If an observation's coded value belongs to multiple concept sets, the first matching applied-to rule takes precedence.
     */
    appliedToConceptSets: Array<string>;
  }>;
}

export type PatientCardElementConfig = {
  address: PatientAddressElementConfig;
  obs: PatientObsElementConfig;
  codedObs: PatientCodedObsElementConfig;
};
