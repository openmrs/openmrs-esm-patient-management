import { type ConfigSchema, Type, validators } from '@openmrs/esm-framework';

export const defaultWardPatientCard: WardPatientCardDefinition = {
  id: 'default',
  headerRowElements: ['patient-age', 'patient-address', 'patient-identifier'],
  footerRowElements: [],
  appliedTo: null,
};

export const builtInPatientCardElements = ['patient-age', 'time-on-ward', 'time-since-admission'];

export const addressFields = [
  'cityVillage',
  'stateProvince',
  'country',
  'postalCode',
  'countyDistrict',
  'latitude',
  'longitude',
  'address1',
  'address2',
  'address3',
  'address4',
  'address5',
  'address6',
  'address7',
  'address8',
  'address9',
  'address10',
  'address11',
  'address12',
  'address13',
  'address14',
  'address15',
] as const;

type AddressField = keyof typeof addressFields;

export const configSchema: ConfigSchema = {
  wardPatientCards: {
    _description: 'Configure the display of ward patient cards',
    obsElementDefinitions: {
      _type: Type.Array,
      _description: 'Defines obs display elements that can be included in the card header or footer.',
      _default: [],
      _elements: {
        id: {
          _type: Type.String,
          _description: 'The unique identifier for this patient card element',
        },
        conceptUuid: {
          _type: Type.UUID,
          _description: 'Identifies the concept to use to identify the desired observations.',
        },
        label: {
          _type: Type.String,
          _description:
            "Optional. The custom label or i18n key to the translated label to display. If not provided, defaults to the concept's name. (Note that this can be set to an empty string to not show a label)",
          _default: null,
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
          identifier: {
            _description: 'Config for the patientCardElementType "patient-identifier"',
            identifierTypeUuid: {
              _type: Type.UUID,
              _description: 'The UUID of the identifier type to display',
              _default: defaultIdentifierTypeUuid,
            },
            label: {
              _type: Type.String,
              _description:
                'the custom label or i18n key to the translated label to display for patient identifier. If not provided, defaults to the patient-identifier name.',
              _default: defaultLabel,
            },
          },
          codedObsTags: {
            _description: 'Config for the patientCardElementType "patient-coded-obs-tags"',
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
            summaryLabelColor: {
              _type: Type.String,
              _validators: [validators.oneOf(addressFields)],
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
          _description:
            'The unique identifier for this card definition. This is used to set the name of the extension slot the card has, where the rows go. The slot name is "ward-patient-card-<id>", unless the id is "default", in which case the slot name is "ward-patient-card".',
          _default: 'default',
        },
        headerRowElements: {
          _type: Type.Array,
          _description: `IDs of patient card elements to appear in the header row. These can be built-in, or custom ones can be defined in patientCardElementDefinitions. Built-in elements are: '${builtInPatientCardElements.join(
            "', '",
          )}'.`,
          _elements: {
            _type: Type.String,
          },
        },
        footerRowElements: {
          _type: Type.Array,
          _description: `IDs of patient card elements to appear in the footer row. These can be built-in, or custom ones can be defined in patientCardElementDefinitions. Built-in elements are: '${builtInPatientCardElements.join(
            "', '",
          )}'.`,
          _elements: {
            _type: Type.String,
          },
        },
        appliedTo: {
          _type: Type.Array,
          _description:
            'Conditions under which this card definition should be used. If not provided, the configuration is applied to all wards.',
          _elements: {
            location: {
              _type: Type.UUID,
              _description: 'The UUID of the location. If not provided, applies to all wards.',
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
  obsElementDefinitions: Array<ObsElementDefinition>;
  identifierElementDefinitions: Array<IdentifierElementDefinition>;
  addressElementDefinitions: Array<AddressElementDefinition>;
  cardDefinitions: Array<WardPatientCardDefinition>;
}

export interface ObsElementDefinition {
  id: string;
  conceptUuid: string;
  onlyWithinCurrentVisit: boolean;
  orderBy: 'ascending' | 'descending';
  limit: number;
  label?: string;


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

export interface IdentifierElementDefinition {
  id: string;
  identifierTypeUuid: string;
  label?: string;
}
export interface PatientCodedObsTagsElementConfig {
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

export interface AddressElementDefinition {
  id: string;
  fields: Array<AddressField>;
}

export interface WardPatientCardDefinition {
  id: string;
  headerRowElements: Array<string>;
  footerRowElements: Array<string>;
  appliedTo?: Array<{
    /**
     * locationUuid. If given, only applies to patients at the specified ward locations. (If not provided, applies to all locations)
     */
    location: string;
  }>;
}
