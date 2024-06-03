import { type PersonAddress, Type, validator, validators, type ConfigSchema } from '@openmrs/esm-framework';
import _default from 'swr';

// const defaultWardPatientCardConfig: WardPatientCardConfig = {
//   slotElementDefinitions: [
//     { id: 'bed-number-element', slotElementType: 'bed-number-slot-element' },
//     { id: 'name-element', slotElementType: 'patient-name-slot-element' },
//     { id: 'age-element', slotElementType: 'patient-age-slot-element' },
//     {
//       id: 'address-element',
//       slotElementType: 'patient-address-slot-element',
//       config: {
//         fields: ['stateProvince', 'country'],
//       },
//     },
//     { id: 'admission-time-element', slotElementType: 'admission-time-slot-element' },
//     // {id: "ward-time-element", slotElementType: "time-on-ward-slot-element"},
//   ],
//   slotDefinitions: [
//     {
//       id: 'header-slot',
//       slotType: 'bento-slot',
//       elements: ['bed-number-element', 'name-element', 'age-element', 'address-element', 'admission-time-element'],
//     },
//     {
//       id: 'footer-slot',
//       slotType: 'bento-slot',
//       elements: [
//         // "ward-time-element"
//       ],
//     },
//   ],
//   cardDefinitions: [
//     {
//       slots: ['header-slot', 'footer-slot'],
//       // appliedTo: {}
//     },
//   ],
// };

// export const configSchema: ConfigSchema = {
//   wardPatientCardConfig: {
//     _type: Type.Object,
//     _description: 'Configuring admitted patient details',
//     _default: defaultWardPatientCardConfig,
//   },
// };

// export type SlotElementDefinition = {
//   id: string;
// } & (
//   | { slotElementType: 'patient-name-slot-element' }
//   | { slotElementType: 'bed-number-slot-element' }
//   | { slotElementType: 'patient-age-slot-element' }
//   | {
//       slotElementType: 'patient-address-slot-element';
//       config: PatientAddressConfig;
//     }
//   | { slotElementType: 'admission-time-slot-element' }
//   | { slotElementType: 'time-on-ward-slot-element' }
// );

const defaultSlotElementDefinitions = [
  { id: 'bed-number-element', slotElementType: 'bed-number-slot-element' },
  { id: 'name-element', slotElementType: 'patient-name-slot-element' },
  { id: 'age-element', slotElementType: 'patient-age-slot-element' },
  {
    id: 'address-element',
    slotElementType: 'patient-address-slot-element',
    config: {
      fields: ['stateProvince', 'country'],
    },
  },
  { id: 'admission-time-element', slotElementType: 'admission-time-slot-element' },
  // {id: "ward-time-element", slotElementType: "time-on-ward-slot-element"},
];

const defaultSlotDefinitions = [
  {
    id: 'header-slot',
    slotType: 'bento-slot',
    elements: ['bed-number-element', 'name-element', 'age-element', 'address-element', 'admission-time-element'],
  },
  {
    id: 'footer-slot',
    slotType: 'bento-slot',
    elements: [
      // "ward-time-element"
    ],
  },
  // {
  //   id: 'tags-slot',
  //   slotType: 'risk-slot',
  // },
];

const deafultCardDefinitions = [
  {
    slots: ['header-slot', 'footer-slot'],
    // appliedTo: {}
  },
];

export const configSchema = {
  wardPatientCardConfig: {
    _type: Type.Object,
    _description: 'Configuring ward patient details',
    slotElementDefinitions: {
      _type: Type.Array,
      _default: defaultSlotElementDefinitions,
      _elements: {
        id: {
          _type: Type.String,
          _description:
            'These are the ids for subelements within the parent slot,Specifically for header and footer of Patient Card',
        },
        slotElementType: {
          _type: Type.String,
          _description: 'These are the types of slots present within the parent slot',
        },
        config: {
          _type: Type.Object,
          _description: 'Ability to configure various fields within a slot,Specifically for address-element',
          fields: {
            _type: Type.Array,
            _description: 'Describes the which fields should be there in the specified slot',
            _elements: {
              _type: Type.String,
            },
          },
        },
        _validators: [
          validator((slotElementDef: SlotElementDefinition) => {
            if (slotElementDef.id != 'address-element') return true;
            return !!(slotElementDef?.config?.fields?.length > 0);
          }, 'Please specify which fields a address should have'),
        ],
      },
    },
    slotDefinitions: {
      _type: Type.Array,
      _default: defaultSlotDefinitions,
      _elements: {
        id: {
          _type: Type.String,
          _description: 'These are the ids of the parent slots in the patient card',
        },
        slotType: {
          _type: Type.String,
          _description: 'Specifies the type of parent slot',
        },
        elements: {
          _type: Type.Array,
          _description: 'Specifies which subelements or slot elements should occur within the parent slot',
          _elements: {
            _type: Type.String,
          },
        },
      },
    },
    cardDefinitions: {
      _type: Type.Array,
      _default: deafultCardDefinitions,
      _elements: {
        slots: {
          _type: Type.Array,
          _description: 'Specifies which parent slots we want in the admission card',
          _elements: {
            _type: Type.String,
          },
          appliedTo: {
            _type: Type.Array,
            _description: 'Tells for which combination of location and status the configuartion should be applied',
            _elements: {
              location: {
                _type: Type.UUID,
              },
              status: {
                _type: Type.String,
                _validators: [validators.oneOf(['admitted', 'pending'])],
              },
            },
          },
        },
      },
    },
  },
  _validators: [
    validator(
      (config: WardConfigObject) => {
        return config.wardPatientCardConfig.slotDefinitions.every((slotDefinition) =>
          slotDefinition.elements.every((ele) =>
            config.wardPatientCardConfig.slotElementDefinitions.some((slotEleDef) => slotEleDef.id === ele),
          ),
        );
      },
      (config: WardConfigObject) => {
        const slotElementIdsProvided = config.wardPatientCardConfig.slotDefinitions.reduce(
          (prev: Array<string>, cur: SlotDefinition) => {
            return [...prev, ...cur.elements];
          },
          [],
        );
        const slotElementIdsPresent = config.wardPatientCardConfig.slotElementDefinitions.reduce(
          (prev: Array<string>, cur: SlotElementDefinition) => {
            prev.push(cur.id);
            return prev;
          },
          [],
        );

        const missingSlotIds = slotElementIdsProvided.filter(
          (slotElementId) => !slotElementIdsPresent.includes(slotElementId),
        );
        return `These slotElementIds are missing ${missingSlotIds.join(',')}`;
      },
    ),
  ],
};

export interface WardConfigObject {
  wardPatientCardConfig: WardPatientCardConfig;
}

export interface WardPatientCardConfig {
  slotElementDefinitions: SlotElementDefinition[];
  slotDefinitions: SlotDefinition[];
  cardDefinitions: CardDefinition[];
}

type SlotElemnentTypes =
  | 'patient-name-slot-element'
  | 'bed-number-slot-element'
  | 'patient-age-slot-element'
  | 'patient-address-slot-element'
  | 'admission-time-slot-element'
  | 'time-on-ward-slot-element';

export type SlotElementDefinition = {
  id: string;
  slotElementType: SlotElemnentTypes;
  config?: PatientAddressConfig;
};

export interface PatientAddressConfig {
  fields: Array<keyof PersonAddress>;
}

export type SlotDefinition = {
  id: string;
} & { slotType: 'bento-slot'; elements: string[] };

export interface CardDefinition {
  slots: string[];
  appliedTo?: Array<{
    location?: string; // locationUuid. If given, only applies to patients at the specified ward location. (If not provided, applies to all locations)
    status?: 'admitted' | 'pending'; // admission status. If given, only applies to patients with the specified status. (If not provided, applies to all statuses)
  }>;
}
